# Báo cáo đánh giá 6 file gốc

Em đã đọc toàn bộ 6 file và chạy thật trên PostgreSQL 16 + pgvector. **Kiến trúc anh thiết kế rất tốt**:
tách phác đồ cha và chunk con, chuẩn hoá theo PICO, có bảng đối chiếu y văn, có đồ thị liên kết lâm sàng,
dùng tìm kiếm lai vector + từ khoá và có fallback PubMed. Toàn bộ SQL chạy không lỗi.
Khi chạy thử, em phát hiện một số lỗi khiến hệ thống không trả lời đúng. Các lỗi này đã được sửa
mà **không chỉnh sửa file gốc**: phần sửa nằm trong file `db/07_…sql` và thư mục `dental_ai/`.
Bản gốc nguyên vẹn được lưu ở commit đầu tiên của repo.

## A. Lỗi đã sửa

| # | Vấn đề | Hậu quả | Cách sửa |
|---|---|---|---|
| 1 | File 05 **không có chunk nào** cho 4/6 phác đồ (cấy ghép tức thì, nha chu, khay trong suốt, veneer) | Hỏi "chảy máu nướu" ra **0 kết quả** | `dental_ai/chunker.py` tự sinh 5 loại chunk theo đúng header của schema 02 cho mọi phác đồ |
| 2 | Embedding trong seed là hằng số `array_fill(0.012)`, không mang ngữ nghĩa | Tìm kiếm vector vô nghĩa | Lệnh `reindex` tính embedding thật (OpenAI hoặc bộ offline) |
| 3 | `plainto_tsquery` ghép **AND** tất cả các từ | Câu hỏi tự nhiên dài gần như không khớp | Ghép OR, loại hư từ tiếng Việt, cộng điểm khi cụm 2 âm tiết đứng liền nhau ("chảy máu", "máu nướu") |
| 4 | Tìm kiếm từ khoá không bỏ dấu | Gõ "chay mau nuou" thì không tìm được | Dùng `unaccent` cho cả văn bản lẫn câu hỏi |
| 5 | `fts_matches … LIMIT 40` không có `ORDER BY` | Lấy 40 dòng ngẫu nhiên | Sắp xếp trước rồi mới cắt |
| 6 | File 03 so **điểm RRF (~0,02)** với ngưỡng **0,78** | Fallback PubMed **luôn** chạy | Quyết định dựa trên độ tương đồng cosine kết hợp độ phủ từ khoá |
| 7 | Nhân `authority_weight ×1,5` thẳng vào RRF, trong khi RRF hạng 1 và hạng 10 chỉ chênh ~13% | Uy tín nguồn lấn át độ liên quan: hỏi niềng răng lại ra phác đồ Veneer (ITI) | Uy tín thành hệ số thưởng có giới hạn (ADA/ITI ×1,10). Vai trò trụ cột ADA/ITI vẫn giữ khi trình bày |
| 8 | Hàm v1 luôn xếp ADA/ITI lên đầu kể cả khi không liên quan | Như mục 7 | Xếp theo độ liên quan, cộng điểm 3 chunk tốt nhất của mỗi phác đồ |
| 9 | File 03 coi **mọi bài trên JADA** là chuẩn ADA Tier 1 | Một nghiên cứu đoàn hệ bất kỳ được coi là hướng dẫn chính thức | Chỉ bài loại *Practice Guideline* mới được xếp Tier 1 |
| 10 | File 03 trả lỗi mạng như một "bài báo" `{"error": …}` | Lỗi lọt vào ngữ cảnh gửi AI | Ghi log và trả danh sách rỗng |
| 11 | File 03 đọc thiếu abstract có thẻ con (`<i>`, `<sup>`), năm dạng `MedlineDate`, không lấy DOI | Mất dữ liệu | Đã xử lý đầy đủ |
| 12 | Câu hỏi tiếng Việt gửi thẳng PubMed | PubMed chỉ tìm tiếng Anh nên không ra kết quả | Claude chuyển câu hỏi thành từ khoá MeSH tiếng Anh |

**Kết quả kiểm chứng:** bộ 11 câu hỏi mẫu (cả ngôn ngữ bệnh nhân lẫn thuật ngữ chuyên môn) đều trả đúng
phác đồ ở **vị trí số 1**. Phần này có trong bộ kiểm thử tự động `tests/test_search_quality.py`.

## B. ⚠️ Trích dẫn cần bác sĩ xác minh trước khi dùng thật

Môi trường làm việc của em không truy cập được Crossref/DOI nên em chưa thể tự xác minh.
Theo hiểu biết của em, một số trích dẫn trong file 05 và 06 **có dấu hiệu sai lệch** (năm, tạp chí hoặc DOI không khớp).
Với hệ thống tư vấn y khoa, đây là việc **quan trọng nhất** cần làm trước khi đưa vào sử dụng.

Anh chạy lệnh sau trên máy anh, có Internet, để đối chiếu tự động toàn bộ DOI:

```bash
python -m dental_ai verify-citations
```

Những điểm em nghi ngờ (cần kiểm tra lại, em có thể nhớ sai):

| Nguồn trong DB | Nghi vấn |
|---|---|
| EFP 2022 `10.1111/jcpe.13290` | DOI này là hướng dẫn EFP S3 cho **giai đoạn I–III, xuất bản 2020**; hướng dẫn cho giai đoạn IV là một bài riêng năm 2022 |
| ADA 2016 (Smiley CJ) `10.1016/j.adaj.2015.01.028` | Hướng dẫn SRP của ADA xuất bản **2015** và dùng thuật ngữ "chronic periodontitis"; phân loại Stage I–III chỉ có từ năm 2017–2018 |
| Springer COI 2023 (Rossini G) `10.1007/s00784-023-04988-2` | Tổng quan hệ thống của Rossini và cộng sự về khay trong suốt mà em biết đăng trên *Angle Orthodontist* năm **2015** |
| ADA 2022 (Bidra AS) `10.1016/j.adaj.2022.04.008` | Hướng dẫn tái khám/bảo trì phục hình của Bidra và cộng sự (ACP/ADA) mà em biết xuất bản năm **2016** |
| ITI 2023 `10.11607/jomi.2023.suppl.iti6` | Định dạng DOI bất thường; ITI Treatment Guide về nâng xoang là sách, không phải bài báo có DOI dạng này |
| Cochrane 2022 `CD008397.pub3` | Cần kiểm tra phiên bản và năm |
| CGDent `CGDENT-IMP-2022` | Không phải DOI, cần ghi URL hoặc tên ấn phẩm chính xác |
| Các số liệu định lượng (VD: tỷ lệ thủng màng 15,7% → 3,6–6,2% khi dùng Piezo; MBL 1,1 mm…) | Cần đối chiếu với nguyên văn bài gốc |

**Khuyến nghị:** sửa trực tiếp trong DB, hoặc tạo file SQL `db/08_…` để cập nhật. Sau đó chạy `audit` và `verify-citations` lại.
Hệ thống đã được cấu hình để Claude **không tự bịa trích dẫn**, nhưng nó vẫn sẽ trích những gì có trong DB.
Vì vậy dữ liệu đầu vào phải chính xác.

## C. Dữ liệu chưa dùng hết

- 9/15 nguồn trong `dental_sources` (VD: ADA 2023 về kháng sinh dự phòng, CGDent, Springer về viêm quanh implant, EAO, Cochrane)
  **chưa có phác đồ** gắn với chúng. Hiện các nguồn này chỉ được nhắc tên trong mục đối chiếu.
  Mỗi nguồn nên có một phác đồ riêng (dùng schema 02 và quy trình `ingest` → `review approve`).
- Chuyên khoa `GENERAL_OMFS_ENDODONTICS` chưa có phác đồ nào. Đây là nhóm bệnh nhân hỏi nhiều nhất (răng khôn, sâu răng, viêm tuỷ).
  Đã có sẵn 3 bản nháp chờ bác sĩ duyệt:
  - sâu răng không xâm lấn (`data/examples/`, ADA 2018);
  - đau răng/kháng sinh (ADA 2019) và răng khôn mọc ngầm (Cochrane 2020), trong `data/knowledge_drafts/`.

## D. Góp ý cho system prompt (file 04)

File gốc được giữ nguyên. Em bổ sung phần **"Quy tắc vận hành"** (trong `dental_ai/llm.py`) để:
- buộc Claude chỉ dùng số liệu và trích dẫn có trong ngữ cảnh truy xuất, cấm bịa DOI/PMID;
- ở chế độ bệnh nhân: không chẩn đoán xác định, không kê đơn, không đưa thông số phẫu thuật;
- mở đầu bằng lời khuyên đi khám hoặc cấp cứu khi hệ thống phát hiện dấu hiệu nguy hiểm.

Ghi chú nhỏ: khi xuất từ Google Docs, danh sách ở mục 3 của file 04 được đánh số bắt đầu từ 2 (2, 3, 4).
Nội dung không bị mất, chỉ lệch số thứ tự.
