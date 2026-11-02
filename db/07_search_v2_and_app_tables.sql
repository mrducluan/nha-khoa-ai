-- ============================================================================
-- 07 — NÂNG CẤP TRUY VẤN LAI v2 + BẢNG VẬN HÀNH ỨNG DỤNG
-- Chạy SAU 01, 05, 06. Không sửa bảng/hàm gốc — chỉ bổ sung.
--
-- Sửa các lỗi đã phát hiện trong hàm search_golden_hybrid_dental_knowledge (v1):
--   1. plainto_tsquery ghép AND mọi từ → câu hỏi tự nhiên dài gần như không khớp
--      → v2 ghép OR các âm tiết + xếp hạng theo độ phủ (ts_rank_cd).
--   2. Không bỏ dấu tiếng Việt → "chay mau nuou" không khớp "chảy máu nướu"
--      → v2 dùng unaccent cho cả văn bản và câu hỏi.
--   3. fts_matches LIMIT 40 không có ORDER BY → lấy 40 dòng ngẫu nhiên
--      → v2 sắp xếp trước khi cắt.
--   4. Điểm RRF (~0.01–0.03) bị so với ngưỡng 0.78 trong file 03 → fallback
--      luôn kích hoạt → v2 trả thêm best_vector_similarity (cosine 0..1) để
--      ứng dụng ra quyết định fallback có ý nghĩa.
--   5. v1 luôn đẩy ADA/ITI lên đầu kể cả khi KHÔNG liên quan câu hỏi, và nhân
--      authority_weight (×1.5) trực tiếp vào RRF — trong khi RRF hạng 1 và hạng 10
--      chỉ chênh ~13% → uy tín nguồn lấn át độ liên quan.
--      → v2 xếp theo độ liên quan (RRF k=20, cộng 3 chunk tốt nhất), uy tín nguồn là
--      hệ số thưởng có giới hạn. Vai trò "trụ cột ADA/ITI" vẫn được giữ trong
--      system prompt khi trình bày câu trả lời.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() không IMMUTABLE nên không dùng được trong cột GENERATED → bọc lại.
CREATE OR REPLACE FUNCTION f_unaccent(txt TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, txt) $$;

-- Chunk do hệ thống tự sinh từ clinical_payload (có thể sinh lại an toàn)
ALTER TABLE child_knowledge_chunks
    ADD COLUMN IF NOT EXISTS is_generated BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE child_knowledge_chunks
    ADD COLUMN IF NOT EXISTS search_vector_unaccent tsvector
    GENERATED ALWAYS AS (to_tsvector('simple', f_unaccent(lower(contextualized_text)))) STORED;

CREATE INDEX IF NOT EXISTS idx_child_fts_unaccent_gin
    ON child_knowledge_chunks USING GIN (search_vector_unaccent);

-- Tách câu hỏi thành âm tiết đã bỏ dấu, loại hư từ tiếng Việt, giữ thứ tự
CREATE OR REPLACE FUNCTION dental_query_tokens(query_text TEXT)
RETURNS TABLE (tok TEXT, ord BIGINT)
LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$
    SELECT t.tok, row_number() OVER (ORDER BY t.n)
    FROM regexp_split_to_table(f_unaccent(lower(coalesce(query_text, ''))), '[^[:alnum:]]+')
         WITH ORDINALITY AS t(tok, n)
    WHERE length(t.tok) >= 2
      AND t.tok <> ALL (ARRAY[
        -- hư từ / đại từ (đã bỏ dấu) + từ có mặt trong hầu hết tài liệu
        'toi','em','anh','chi','minh','ban','bac','si','oi','nhe','vay','roi','bi','khi','thi','phai','lam',
        'sao','cua','va','la','co','khong','ko','nhu','the','nao','nay','do','de','duoc','cho','voi','mot',
        'cac','nhung','nen','gi','se','da','dang','rat','qua','hay','hoac','neu','trong','tren','duoi','ve',
        'tu','den','ma','cung','con','lai','ra','vao','len','nhieu','it','hoi','bao','lau','can','muon',
        'rang','nha','khoa','benh','nhan','sau','truoc','thuong','hien','dieu','tri'
      ])
$$;

-- Câu hỏi tự nhiên → tsquery OR (dùng để lọc nhanh bằng chỉ mục GIN)
CREATE OR REPLACE FUNCTION dental_or_tsquery(query_text TEXT)
RETURNS tsquery
LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$
    SELECT CASE WHEN count(*) = 0 THEN NULL::tsquery
                ELSE to_tsquery('simple', string_agg(DISTINCT quote_literal(tok), ' | '))
           END
    FROM dental_query_tokens(query_text)
$$;

-- Điểm từ khoá: +1 mỗi âm tiết khớp, +2 mỗi cụm 2 âm tiết liền nhau khớp
-- (tiếng Việt là ngôn ngữ đơn lập: "chảy máu nướu" mang nghĩa nhờ các cụm liền kề)
CREATE OR REPLACE FUNCTION dental_keyword_score(doc tsvector, query_text TEXT)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$
    WITH t AS (SELECT DISTINCT tok, ord FROM dental_query_tokens(query_text)),
    uni AS (
        SELECT count(DISTINCT tok) AS n FROM t
        WHERE doc @@ to_tsquery('simple', quote_literal(tok))
    ),
    bi AS (
        SELECT count(*) AS n FROM t a JOIN t b ON b.ord = a.ord + 1
        WHERE doc @@ to_tsquery('simple', quote_literal(a.tok) || ' <-> ' || quote_literal(b.tok))
    )
    SELECT (uni.n + 2 * bi.n)::NUMERIC FROM uni, bi
$$;

-- ----------------------------------------------------------------------------
-- HÀM TRUY VẤN LAI v2
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS search_dental_knowledge_v2(TEXT, vector, dental_specialty_enum, INT);
CREATE OR REPLACE FUNCTION search_dental_knowledge_v2(
    query_text TEXT,
    query_embedding vector(1536),
    target_specialty dental_specialty_enum DEFAULT NULL,
    match_count INT DEFAULT 6,
    vector_weight NUMERIC DEFAULT 0.70   -- trọng số RRF cho vector; phần còn lại cho từ khoá
)
RETURNS TABLE (
    slot_role VARCHAR(30),
    protocol_id UUID,
    organization_code VARCHAR(50),
    authority_tier authority_tier_enum,
    publication_year INT,
    evidence_level evidence_level_enum,
    grade_of_recommendation VARCHAR(20),
    document_title TEXT,
    authors_or_committee TEXT,
    journal_or_series TEXT,
    doi_or_pmid VARCHAR(120),
    primary_specialty dental_specialty_enum,
    protocol_title TEXT,
    clinical_topic_slug VARCHAR(150),
    pico_structured JSONB,
    clinical_payload JSONB,
    comparative_arbitration JSONB,
    ada_iti_core_stance TEXT,
    related_clinical_edges JSONB,
    matched_chunks JSONB,
    best_vector_similarity NUMERIC,
    hybrid_rrf_score NUMERIC
)
LANGUAGE sql STABLE
AS $$
    WITH q AS (SELECT dental_or_tsquery(query_text) AS tsq),
    vector_matches AS (
        SELECT c.chunk_id, c.protocol_id,
               1 - (c.embedding <=> query_embedding) AS vec_sim,
               ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS vec_rank
        FROM child_knowledge_chunks c
        WHERE target_specialty IS NULL OR c.specialty = target_specialty
        ORDER BY c.embedding <=> query_embedding
        LIMIT 60
    ),
    fts_matches AS (
        SELECT x.chunk_id, x.protocol_id,
               ROW_NUMBER() OVER (ORDER BY x.fts_score DESC) AS fts_rank
        FROM (
            SELECT c.chunk_id, c.protocol_id,
                   dental_keyword_score(c.search_vector_unaccent, query_text)
                     + ts_rank_cd(c.search_vector_unaccent, q.tsq, 32) AS fts_score
            FROM child_knowledge_chunks c, q
            WHERE q.tsq IS NOT NULL
              AND c.search_vector_unaccent @@ q.tsq
              AND (target_specialty IS NULL OR c.specialty = target_specialty)
            ORDER BY fts_score DESC
            LIMIT 60
        ) x
    ),
    fused AS (
        SELECT COALESCE(v.chunk_id, f.chunk_id) AS chunk_id,
               COALESCE(v.protocol_id, f.protocol_id) AS protocol_id,
               v.vec_sim,
               COALESCE(vector_weight / (20 + v.vec_rank), 0) + COALESCE((1 - vector_weight) / (20 + f.fts_rank), 0) AS rrf
        FROM vector_matches v
        FULL OUTER JOIN fts_matches f ON f.chunk_id = v.chunk_id
    ),
    ranked AS (
        SELECT fu.*, ROW_NUMBER() OVER (PARTITION BY fu.protocol_id ORDER BY fu.rrf DESC) AS rn
        FROM fused fu
    ),
    per_protocol AS (
        -- Cộng điểm 3 chunk tốt nhất: phác đồ liên quan toàn diện được ưu tiên
        -- hơn phác đồ chỉ có 1 câu tình cờ trùng từ.
        SELECT r.protocol_id,
               SUM(r.rrf) FILTER (WHERE r.rn <= 3) AS best_rrf,
               MAX(r.vec_sim) AS best_sim,
               jsonb_agg(jsonb_build_object(
                   'section', c.chunk_section_type,
                   'text', c.contextualized_text,
                   'rrf', ROUND(r.rrf::NUMERIC, 5)
               ) ORDER BY r.rrf DESC) FILTER (WHERE r.rn <= 3) AS chunks
        FROM ranked r
        JOIN child_knowledge_chunks c ON c.chunk_id = r.chunk_id
        GROUP BY r.protocol_id
    )
    SELECT
        CASE WHEN s.organization_code IN ('ADA', 'ITI')
             THEN 'PRIMARY_ADA_ITI_STANDARD' ELSE 'PARALLEL_COMPARATIVE_EVIDENCE'
        END::VARCHAR(30),
        p.protocol_id, s.organization_code, s.authority_tier, s.publication_year,
        s.evidence_level, s.grade_of_recommendation, s.document_title,
        s.authors_or_committee, s.journal_or_series, s.doi_or_pmid,
        p.primary_specialty, p.protocol_title, p.clinical_topic_slug,
        p.pico_structured, p.clinical_payload,
        COALESCE(ga.comparative_stances, '[]'::JSONB),
        ga.ada_iti_core_stance,
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'relation', e.relationship_type,
                'linked_protocol_id', e.target_protocol_id,
                'linked_protocol_title', tp.protocol_title,
                'rationale', e.clinical_rationale))
            FROM clinical_entity_edges e
            JOIN parent_clinical_protocols tp ON tp.protocol_id = e.target_protocol_id
            WHERE e.source_protocol_id = p.protocol_id
        ), '[]'::JSONB),
        pp.chunks,
        ROUND(COALESCE(pp.best_sim, 0)::NUMERIC, 4),
        -- Uy tín nguồn là hệ số THƯỞNG có giới hạn, không lấn át độ liên quan:
        --   ADA/ITI (1.50) → ×1.10 ; Tier 2 (1.20) → ×1.04 ; Tier 3 (1.00) → ×1.00 ; xuất bản ≥2020 → ×1.05
        ROUND((pp.best_rrf * (1 + 0.20 * (s.authority_weight - 1)) *
               CASE WHEN s.publication_year >= 2020 THEN 1.05 ELSE 1.00 END)::NUMERIC, 5)
    FROM per_protocol pp
    JOIN parent_clinical_protocols p ON p.protocol_id = pp.protocol_id
    JOIN dental_sources s ON s.source_id = p.source_id
    LEFT JOIN guideline_arbitrations ga ON ga.clinical_topic_slug = p.clinical_topic_slug
    ORDER BY 22 DESC
    LIMIT match_count
$$;

-- ----------------------------------------------------------------------------
-- BẢNG VẬN HÀNH
-- ----------------------------------------------------------------------------

-- Cấu hình hệ thống (VD: embedding_provider đã dùng để index)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nhật ký hỏi đáp + phản hồi của người dùng (để bác sĩ rà soát chất lượng)
CREATE TABLE IF NOT EXISTS qa_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    persona_mode VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    protocol_ids UUID[] DEFAULT '{}',
    red_flags TEXT[] DEFAULT '{}',
    used_fallback BOOLEAN DEFAULT FALSE,
    fallback_pmids TEXT[] DEFAULT '{}',
    model VARCHAR(80),
    latency_ms INT,
    feedback_rating SMALLINT CHECK (feedback_rating IN (-1, 1)),
    feedback_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_qa_logs_created ON qa_logs(created_at DESC);

-- Bộ nhớ đệm y văn PubMed truy xuất tự động (Fallback)
CREATE TABLE IF NOT EXISTS literature_cache (
    pmid VARCHAR(20) PRIMARY KEY,
    search_query TEXT,
    title TEXT NOT NULL,
    journal TEXT,
    publication_year INT,
    publication_types TEXT[] DEFAULT '{}',
    doi VARCHAR(120),
    abstract TEXT,
    organization_code VARCHAR(50),
    authority_tier authority_tier_enum,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hàng chờ duyệt tri thức mới: KHÔNG có dữ liệu nào lên hệ thống
-- trước khi bác sĩ phê duyệt (an toàn y khoa).
CREATE TABLE IF NOT EXISTS knowledge_review_queue (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_by TEXT,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewer TEXT,
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    created_protocol_id UUID REFERENCES parent_clinical_protocols(protocol_id) ON DELETE SET NULL
);
