-- ============================================================================
-- GOLDEN HYBRID DENTAL RAG ARCHITECTURE (POSTGRESQL 16+ & PGVECTOR)
-- Chuẩn Y học Thực chứng: ADA / ITI (Gold Standard) + Parallel Arbitration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM ĐỊNH DANH CHUYÊN KHOA MŨI NHỌN & CẤP ĐỘ BẰNG CHỨNG
CREATE TYPE dental_specialty_enum AS ENUM (
    'IMPLANTOLOGY',               -- Cấy ghép Nha khoa
    'PERIODONTOLOGY',             -- Nha chu học
    'ORTHODONTICS',               -- Chỉnh nha (Khay trong suốt & Mắc cài)
    'ESTHETIC_PROSTHODONTICS',    -- Phục hình Thẩm mỹ & Toàn hàm
    'GENERAL_OMFS_ENDODONTICS'    -- Đa chuyên khoa / Phẫu thuật hàm mặt / Nội nha liên quan
);

CREATE TYPE authority_tier_enum AS ENUM (
    'TIER_1_GOLD_STANDARD',       -- Ưu tiên tuyệt đối: ADA, ITI
    'TIER_2_INTERNATIONAL_GUIDE', -- Đối chiếu song song: FDI, CGDent, EFP, AAP, EAO, AAID, ICOI
    'TIER_3_PEER_REVIEWED'        -- Nghiên cứu chuyên sâu: Springer, Cochrane, PubMed, Wiley, Elsevier
);

CREATE TYPE evidence_level_enum AS ENUM (
    '1A_SYSTEMATIC_REVIEW_META',  -- Tổng quan hệ thống / Phân tích gộp các RCT
    '1B_HIGH_QUALITY_RCT',        -- Thử nghiệm lâm sàng ngẫu nhiên có đối chứng
    '2A_COHORT_STUDY',            -- Nghiên cứu đoàn hệ
    '2B_CASE_CONTROL',            -- Nghiên cứu bệnh chứng
    'CONSENSUS_GUIDELINE'         -- Đồng thuận chuyên gia Hiệp hội (ADA/ITI/CGDent/FDI)
);

-- 2. BẢNG QUẢN LÝ NGUỒN Y VĂN & TÀI LIỆU PDF HỌC THUẬT (DENTAL SOURCES)
CREATE TABLE dental_sources (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_code VARCHAR(50) NOT NULL CHECK (
        organization_code IN (
            'ADA', 'ITI', 'FDI', 'CGDent', 'EFP', 'AAP', 'EAO', 'AAID', 'ICOI',
            'SPRINGER_COI', 'SPRINGER_PIR', 'COCHRANE', 'PUBMED_NCBI', 'WILEY', 'ELSEVIER'
        )
    ),
    authority_tier authority_tier_enum NOT NULL,
    document_title TEXT NOT NULL,
    authors_or_committee TEXT NOT NULL,
    publication_year INT NOT NULL CHECK (publication_year >= 1990 AND publication_year <= 2030),
    journal_or_series TEXT,
    doi_or_pmid VARCHAR(120) UNIQUE,
    evidence_level evidence_level_enum NOT NULL,
    grade_of_recommendation VARCHAR(20), -- VD: Grade A, Grade B, Strong, Conditional
    authority_weight NUMERIC(4,2) NOT NULL DEFAULT 1.00, -- ADA/ITI = 1.50, Tier 2 = 1.20, Tier 3 = 1.00
    is_auto_ingested BOOLEAN DEFAULT FALSE,
    pdf_storage_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG CHA: PHÁC ĐỒ LÂM SÀNG HOÀN CHỈNH & LÕI PICO (PARENT CLINICAL PROTOCOLS)
CREATE TABLE parent_clinical_protocols (
    protocol_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES dental_sources(source_id) ON DELETE CASCADE,
    primary_specialty dental_specialty_enum NOT NULL,
    secondary_specialties dental_specialty_enum[] DEFAULT '{}',
    condition_code_icd_or_snomed VARCHAR(64),
    protocol_title TEXT NOT NULL,
    clinical_topic_slug VARCHAR(150) NOT NULL,
    pico_structured JSONB NOT NULL,
    clinical_payload JSONB NOT NULL,
    full_markdown_content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parent_specialty ON parent_clinical_protocols(primary_specialty);
CREATE INDEX idx_parent_topic_slug ON parent_clinical_protocols(clinical_topic_slug);
CREATE INDEX idx_parent_pico_gin ON parent_clinical_protocols USING GIN (pico_structured);

-- 4. BẢNG CON: VECTOR CHUNKS & FULL-TEXT SEARCH (CHILD KNOWLEDGE CHUNKS)
CREATE TABLE child_knowledge_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES parent_clinical_protocols(protocol_id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES dental_sources(source_id) ON DELETE CASCADE,
    specialty dental_specialty_enum NOT NULL,
    authority_tier authority_tier_enum NOT NULL,
    chunk_section_type VARCHAR(50) NOT NULL CHECK (
        chunk_section_type IN ('INDICATION_CONTRA', 'PROCEDURE_PARAMS', 'PICO_OUTCOME', 'COMPLICATION', 'PATIENT_FAQ')
    ),
    contextualized_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', contextualized_text)) STORED
);

CREATE INDEX idx_child_embedding_hnsw ON child_knowledge_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_child_fts_gin ON child_knowledge_chunks USING GIN (search_vector);
CREATE INDEX idx_child_specialty_tier ON child_knowledge_chunks(specialty, authority_tier);

-- 5. BẢNG ĐỒ THỊ LIÊN KẾT LÂM SÀNG NHẸ (LIGHT CLINICAL GRAPH EDGES - Phương pháp 2)
CREATE TABLE clinical_entity_edges (
    edge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_protocol_id UUID NOT NULL REFERENCES parent_clinical_protocols(protocol_id) ON DELETE CASCADE,
    target_protocol_id UUID NOT NULL REFERENCES parent_clinical_protocols(protocol_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (
        relationship_type IN (
            'REQUIRES_PREREQUISITE',
            'CONTRAINDICATED_WITH',
            'SYNERGISTIC_WITH',
            'ALTERNATIVE_OPTION'
        )
    ),
    clinical_rationale TEXT NOT NULL,
    UNIQUE(source_protocol_id, target_protocol_id, relationship_type)
);

-- 6. BẢNG ĐỐI CHIẾU TRỌNG TÀI Y VĂN SONG SONG (GUIDELINE ARBITRATION MATRIX)
CREATE TABLE guideline_arbitrations (
    arbitration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_topic_slug VARCHAR(150) NOT NULL UNIQUE,
    clinical_scenario TEXT NOT NULL,
    ada_iti_gold_standard_protocol_id UUID NOT NULL REFERENCES parent_clinical_protocols(protocol_id),
    ada_iti_core_stance TEXT NOT NULL,
    comparative_stances JSONB NOT NULL
);

-- 7. HÀM TRUY VẤN LAI PHÂN LUỒNG KÉP (PARTITIONED HYBRID RRF SEARCH FUNCTION)
CREATE OR REPLACE FUNCTION search_golden_hybrid_dental_knowledge(
    query_text TEXT,
    query_embedding vector(1536),
    target_specialty dental_specialty_enum DEFAULT NULL,
    match_count INT DEFAULT 6
)
RETURNS TABLE (
    slot_role VARCHAR(30),
    protocol_id UUID,
    organization_code VARCHAR(50),
    publication_year INT,
    evidence_level evidence_level_enum,
    protocol_title TEXT,
    clinical_topic_slug VARCHAR(150),
    pico_structured JSONB,
    clinical_payload JSONB,
    comparative_arbitration JSONB,
    related_clinical_edges JSONB,
    hybrid_rrf_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH vector_matches AS (
        SELECT
            c.chunk_id,
            c.protocol_id,
            c.source_id,
            c.authority_tier,
            1 - (c.embedding <=> query_embedding) AS vec_sim,
            ROW_NUMBER() OVER (PARTITION BY (c.authority_tier = 'TIER_1_GOLD_STANDARD') ORDER BY c.embedding <=> query_embedding) AS vec_rank
        FROM child_knowledge_chunks c
        WHERE (target_specialty IS NULL OR c.specialty = target_specialty)
        ORDER BY c.embedding <=> query_embedding
        LIMIT 40
    ),
    fts_matches AS (
        SELECT
            c.chunk_id,
            c.protocol_id,
            ts_rank_cd(c.search_vector, plainto_tsquery('simple', query_text)) AS fts_score,
            ROW_NUMBER() OVER (PARTITION BY (c.authority_tier = 'TIER_1_GOLD_STANDARD') ORDER BY ts_rank_cd(c.search_vector, plainto_tsquery('simple', query_text)) DESC) AS fts_rank
        FROM child_knowledge_chunks c
        WHERE c.search_vector @@ plainto_tsquery('simple', query_text)
          AND (target_specialty IS NULL OR c.specialty = target_specialty)
        LIMIT 40
    ),
    combined_scores AS (
        SELECT
            COALESCE(v.protocol_id, f.protocol_id) AS p_id,
            MAX(
                (
                    COALESCE(0.70 / (60 + v.vec_rank), 0.0) +
                    COALESCE(0.30 / (60 + f.fts_rank), 0.0)
                ) * s.authority_weight *
                CASE WHEN s.publication_year >= 2020 THEN 1.15 ELSE 1.00 END
            ) AS final_score
        FROM vector_matches v
        FULL OUTER JOIN fts_matches f ON v.chunk_id = f.chunk_id
        JOIN dental_sources s ON s.source_id = COALESCE(v.source_id, (SELECT source_id FROM parent_clinical_protocols WHERE parent_clinical_protocols.protocol_id = f.protocol_id))
        GROUP BY COALESCE(v.protocol_id, f.protocol_id)
    )
    SELECT
        CASE
            WHEN s.organization_code IN ('ADA', 'ITI') THEN 'PRIMARY_ADA_ITI_STANDARD'::VARCHAR(30)
            ELSE 'PARALLEL_COMPARATIVE_EVIDENCE'::VARCHAR(30)
        END AS slot_role,
        p.protocol_id,
        s.organization_code,
        s.publication_year,
        s.evidence_level,
        p.protocol_title,
        p.clinical_topic_slug,
        p.pico_structured,
        p.clinical_payload,
        COALESCE(ga.comparative_stances, '[]'::JSONB) AS comparative_arbitration,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'relation', e.relationship_type,
                    'linked_protocol_id', e.target_protocol_id,
                    'rationale', e.clinical_rationale
                ))
                FROM clinical_entity_edges e
                WHERE e.source_protocol_id = p.protocol_id
            ),
            '[]'::JSONB
        ) AS related_clinical_edges,
        ROUND(cs.final_score::NUMERIC, 5) AS hybrid_rrf_score
    FROM combined_scores cs
    JOIN parent_clinical_protocols p ON p.protocol_id = cs.p_id
    JOIN dental_sources s ON s.source_id = p.source_id
    LEFT JOIN guideline_arbitrations ga ON ga.clinical_topic_slug = p.clinical_topic_slug
    ORDER BY
        (s.organization_code IN ('ADA', 'ITI')) DESC,
        cs.final_score DESC
    LIMIT match_count;
END;
$$;
