# 🦷 Nha Khoa AI — Hỏi đáp & Tư vấn Nha khoa Thực chứng

Hệ thống hỏi đáp tri thức Răng Hàm Mặt phục vụ **bác sĩ** (phân tích chuyên sâu, đối chiếu y văn, trích dẫn)
và **bệnh nhân** (giải thích dễ hiểu, trấn an, hướng dẫn chăm sóc, cảnh báo dấu hiệu nguy hiểm).
Hệ thống được xây dựng trên **Golden Hybrid Dental RAG Database** (PostgreSQL + pgvector), lấy chuẩn ADA/ITI làm trụ cột
và đối chiếu song song với FDI, CGDent, EFP, EAO, Cochrane và Springer.

## Hệ thống hoạt động thế nào

```
 Câu hỏi ──► ① Nhận diện đối tượng ──► ② Phát hiện cảnh báo đỏ ──► ③ Mở rộng thuật ngữ
            (Bác sĩ / Bệnh nhân)        (sưng lan, khó thở…)        ("chảy máu chân răng" → nha chu)
                                                                         │
 ⑦ Ghi nhật ký + đánh giá 👍👎 ◄── ⑥ Claude soạn trả lời ◄── ⑤ Fallback PubMed ◄── ④ Tìm kiếm lai
                                   (chỉ dùng dữ liệu đã tra,   (2016–2026, khi DB      (vector + từ khoá
                                    trích dẫn chuẩn, cảnh báo)   chưa đủ thông tin)       tiếng Việt bỏ dấu)
```

| Thành phần | File |
|---|---|
| Lược đồ CSDL gốc + dữ liệu gốc | `db/01_…sql`, `db/05_…sql`, `db/06_…sql` |
| Nâng cấp tìm kiếm v2 + bảng vận hành | `db/07_search_v2_and_app_tables.sql` |
| Chuẩn nạp tài liệu (PICO) | `schemas/02_pdf_ingestion_pico_schema.json` |
| System prompt chuyên gia | `prompts/04_master_dental_agent_system_prompt.md` |
| Mã nguồn ứng dụng | `dental_ai/` |
| Bản gốc module fallback (tham khảo) | `legacy/03_auto_fallback_literature_ingestor.py` |
| Báo cáo đánh giá dữ liệu & lỗi đã sửa | [`docs/DANH_GIA_DU_LIEU.md`](docs/DANH_GIA_DU_LIEU.md) |
| Hướng dẫn tạo repo GitHub | [`docs/HUONG_DAN_GITHUB.md`](docs/HUONG_DAN_GITHUB.md) |

## Chạy nhanh bằng Docker (khuyến nghị)

Cần cài [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/<tai-khoan>/nha-khoa-ai.git
cd nha-khoa-ai
cp .env.example .env        # rồi mở .env, điền ANTHROPIC_API_KEY, ADMIN_TOKEN…
docker compose up -d --build
```

Mở **http://localhost:8000**. Lần đầu khởi động, hệ thống tự tạo bảng, nạp dữ liệu và sinh chỉ mục tìm kiếm.

> Chưa có API key vẫn chạy được ở **chế độ dữ liệu**: hệ thống trả lời bằng nội dung trích thẳng từ phác đồ.
> Thêm `ANTHROPIC_API_KEY` để Claude soạn câu trả lời đầy đủ theo 2 chế độ của system prompt.

## Chạy không dùng Docker

Cần Python ≥ 3.11 và PostgreSQL 16 có extension `pgvector`.

```bash
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env                                   # sửa DATABASE_URL cho đúng
python -m dental_ai bootstrap                          # tạo bảng + nạp dữ liệu + sinh chỉ mục
python -m dental_ai serve                              # http://localhost:8000
```

## Cấu hình chính (`.env`)

| Biến | Ý nghĩa |
|---|---|
| `ANTHROPIC_API_KEY` | Khoá Claude API (lấy tại console.anthropic.com). Mô hình mặc định `claude-opus-5-5` |
| `CLAUDE_EFFORT_DOCTOR` / `CLAUDE_EFFORT_PATIENT` | Độ sâu suy luận cho từng chế độ (`low`…`max`) |
| `EMBEDDING_PROVIDER` | `openai` (khuyến nghị, cần `OPENAI_API_KEY`) hoặc `local` (offline). **Đổi xong chạy `reindex`** |
| `FALLBACK_ENABLED`, `NCBI_API_KEY`, `NCBI_EMAIL` | Tự tra PubMed 2016–2026 khi DB chưa đủ dữ liệu |
| `ADMIN_TOKEN` | Mật khẩu cho các API quản trị `/api/admin/*` |

## Dòng lệnh quản trị

```bash
python -m dental_ai ask "Tôi bị chảy máu chân răng có sao không?"     # hỏi thử
python -m dental_ai ask "Torque MUA bao nhiêu Ncm?" --role doctor
python -m dental_ai search "nâng xoang hở"                             # chỉ tìm kiếm, không gọi AI
python -m dental_ai audit                                              # kiểm định dữ liệu theo schema 02
python -m dental_ai verify-citations                                   # đối chiếu DOI với Crossref
python -m dental_ai ingest data/examples/mau_sau_rang_fluoride_ADA2018.json   # gửi tài liệu vào hàng chờ duyệt
python -m dental_ai review list                                        # xem hàng chờ
python -m dental_ai review approve <review_id> --by "BS. Nguyễn Văn A"  # duyệt → tài liệu lên hệ thống
python -m dental_ai reindex                                            # sinh lại chỉ mục
```

Khi chạy bằng Docker, thêm tiền tố `docker compose exec app`, ví dụ: `docker compose exec app python -m dental_ai audit`.

## Thêm tri thức mới

1. Soạn file JSON theo `schemas/02_pdf_ingestion_pico_schema.json` (xem mẫu `data/examples/`).
2. `python -m dental_ai ingest file.json` → tài liệu vào **hàng chờ duyệt** (chưa xuất hiện với người dùng).
3. Bác sĩ phụ trách đối chiếu nguồn gốc → `review approve` → hệ thống tự sinh chunk + embedding.
4. Chạy `verify-citations` để xác minh DOI.

Quy trình duyệt bắt buộc này đảm bảo **không có nội dung y khoa nào lên hệ thống mà chưa qua bác sĩ**.

## API

Tài liệu tương tác tự động: **http://localhost:8000/docs**

| Endpoint | Mô tả |
|---|---|
| `POST /api/ask/stream` | Hỏi đáp dạng streaming (SSE): `{question, role: auto/doctor/patient, history}` |
| `POST /api/ask` | Hỏi đáp trả JSON một lần |
| `POST /api/search` | Tìm phác đồ liên quan |
| `GET /api/protocols` · `GET /api/protocols/{id}` | Danh sách / chi tiết phác đồ |
| `POST /api/feedback` | Đánh giá câu trả lời 👍/👎 |
| `/api/admin/*` (header `X-Admin-Token`) | Gửi tài liệu, duyệt, kiểm định, xem nhật ký + phản hồi tiêu cực |

## An toàn y khoa

- **Cảnh báo đỏ bằng quy tắc cố định** (không phụ thuộc AI): khó thở/khó nuốt, sưng lan + sốt, chảy máu không cầm,
  chấn thương/rơi răng, tê kéo dài, loét > 2 tuần, thông xoang, phản ứng toàn thân.
- **Bám sát dữ liệu**: Claude chỉ được dùng số liệu và trích dẫn có trong ngữ cảnh truy xuất; cấm bịa DOI/PMID.
- **Chế độ bệnh nhân**: không chẩn đoán xác định, không kê đơn, luôn khuyến khích thăm khám, kèm lời miễn trừ.
- **Hàng chờ duyệt** cho mọi tri thức mới; y văn PubMed tự động được đánh dấu "chưa thẩm định".
- **Nhật ký + phản hồi** để bác sĩ rà soát câu trả lời bị đánh giá 👎.

## Kiểm thử

```bash
pytest -q          # cần PostgreSQL+pgvector; đặt TEST_DATABASE_URL nếu khác mặc định
```

Bộ kiểm thử gồm: định tuyến đối tượng, cảnh báo đỏ, kiểm định schema, phân tích XML PubMed,
**bộ đánh giá chất lượng tìm kiếm** (11 câu hỏi phải trả đúng phác đồ ở vị trí số 1), quy trình duyệt tài liệu,
API, và kiểm tra request gửi tới Claude API ở tầng HTTP. GitHub Actions tự chạy kiểm thử mỗi lần push.

## Lộ trình đề xuất

- [ ] Bổ sung phác đồ cho các chủ đề hay được hỏi: răng khôn, nội nha, sâu răng trẻ em, tẩy trắng, viêm quanh implant, bệnh nhân dùng thuốc chống đông.
- [ ] Công cụ bóc tách PDF hướng dẫn (ADA/ITI…) thành JSON schema 02 bằng Claude, đưa vào hàng chờ duyệt.
- [ ] Trang quản trị web cho bác sĩ duyệt tài liệu và xem phản hồi.
- [ ] Đăng nhập theo vai trò (bác sĩ được xác thực mới thấy thông số phẫu thuật).
- [ ] Kết nối Zalo OA / Messenger cho bệnh nhân.
