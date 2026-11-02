# Hướng dẫn tạo repo GitHub và triển khai

## 1. Anh cần chuẩn bị

| Thứ cần có | Dùng để | Lấy ở đâu |
|---|---|---|
| Tài khoản GitHub | Lưu mã nguồn | https://github.com/signup |
| Khoá **Anthropic API** | Claude soạn câu trả lời | https://console.anthropic.com → API Keys (cần nạp credit) |
| *(Khuyến nghị)* Khoá **OpenAI API** | Embedding giúp tìm kiếm chính xác hơn (chi phí rất thấp) | https://platform.openai.com/api-keys |
| *(Khuyến nghị)* Khoá **NCBI** | Fallback PubMed ổn định hơn (miễn phí) | https://www.ncbi.nlm.nih.gov/account/ → API Key Management |
| Docker Desktop | Chạy hệ thống trên máy hoặc server | https://www.docker.com/products/docker-desktop/ |

> 🔒 **Không bao giờ** đưa các khoá API lên GitHub. Chúng chỉ nằm trong file `.env` trên máy hoặc server.
> File `.env` đã được chặn bằng `.gitignore`.

## 2. Tạo repo trên GitHub

1. Đăng nhập GitHub → bấm **New repository** (hoặc vào https://github.com/new).
2. **Repository name:** `nha-khoa-ai`.
3. Chọn **Private**. Đây là tri thức chuyên môn riêng của anh.
4. **KHÔNG** tích "Add a README", ".gitignore" hay "license" (repo phải trống để đẩy code lên).
5. Bấm **Create repository**.

## 3. Đưa mã nguồn lên repo

**Cách A — để Claude đẩy giúp (nhanh nhất):** báo cho Claude tên repo (VD: `tentaikhoan/nha-khoa-ai`)
và cấp quyền cho Claude truy cập repo đó khi được hỏi. Claude sẽ đẩy toàn bộ lịch sử commit lên.

**Cách B — tự đẩy từ máy anh** (khi đã có thư mục code trên máy):

```bash
cd nha-khoa-ai
git remote add origin https://github.com/<tai-khoan>/nha-khoa-ai.git
git push -u origin main
```

## 4. Chạy trên máy anh

```bash
git clone https://github.com/<tai-khoan>/nha-khoa-ai.git
cd nha-khoa-ai
cp .env.example .env
# Mở .env, điền: ANTHROPIC_API_KEY, OPENAI_API_KEY (nếu có), ADMIN_TOKEN (chuỗi dài ngẫu nhiên)
docker compose up -d --build
```

Mở http://localhost:8000. Sau đó xác minh trích dẫn:

```bash
docker compose exec app python -m dental_ai verify-citations
```

## 5. Đưa lên Internet cho bệnh nhân dùng

Gợi ý các lựa chọn, từ đơn giản đến chuyên nghiệp:
- **VPS** (DigitalOcean, Vultr, Viettel IDC…): cài Docker, `git clone`, `docker compose up -d`,
  đặt **Caddy** hoặc **Nginx** phía trước để có HTTPS cho tên miền (VD: `tuvan.phongkham.vn`).
- **Railway / Render / Fly.io**: kết nối trực tiếp với repo GitHub, tự build từ `Dockerfile`.
  Cần một PostgreSQL có pgvector (VD: Supabase, Neon).

Trước khi mở cho công chúng, cần:
1. Hoàn tất xác minh trích dẫn (`docs/DANH_GIA_DU_LIEU.md`, mục B).
2. Đặt `ADMIN_TOKEN` mạnh, chỉ mở cổng 80/443 (cổng 5432 của DB chỉ mở cho máy local).
3. Thêm trang điều khoản sử dụng và miễn trừ trách nhiệm y khoa.
4. Đặt giới hạn chi tiêu (spend limit) trong Anthropic Console để tránh phát sinh chi phí ngoài ý muốn.

## 6. Kiểm thử tự động

Mỗi lần push, GitHub Actions (`.github/workflows/ci.yml`) tự dựng PostgreSQL + pgvector và chạy toàn bộ kiểm thử.
Xem kết quả ở tab **Actions** của repo.
