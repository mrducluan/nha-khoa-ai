# Đối chiếu kiến thức chuyên môn trong 9 video Asia với engine Nha Khoa AI

Khác bộ Tâm Đức (đối chiếu làm sau), bộ này **chọn chủ đề và viết lời từ dữ liệu engine ngay từ đầu**:
`db/05_seed_core_dental_knowledge.sql`, `db/06_seed_advanced_implant_prostho_sinus.sql` (ITI, ADA, EAO, Springer).
Câu nào engine chưa có thì ghi ⚪, cần bác sĩ duyệt.

Ký hiệu:
- ✅ có trong engine
- 🟡 engine có nội dung liên quan nhưng diễn đạt khác
- ⚪ chưa có trong engine (kiến thức phổ thông)

## Implant

| Video · câu | Đối chiếu engine | Ghi chú |
|---|---|---|
| i01 · "Chụp phim CT để đo xương và lên kế hoạch" | ✅ `db/05` bước 1: *"Chụp CBCT khảo sát độ dày vách ngoài… thiết kế máng hướng dẫn"*; `db/06` lập kế hoạch 3D | Khớp |
| i01 · "Chờ vài tháng để xương bám chặt vào trụ, rồi mới gắn mão sứ" | 🟡 `db/06`: phục hình chính thức sau 4–6 tháng (toàn hàm); `db/06` nâng xoang 2 thì: đặt trụ sau 6–8 tháng | Engine chưa có mốc thời gian riêng cho 1 răng. Lời đọc dùng "vài tháng" cho an toàn |
| i01 · "Phòng phẫu thuật Implant có vách kính trong suốt, người nhà theo dõi được" | — (thông tin doanh nghiệp) | Lấy từ trang Trồng răng Implant của nhakhoaasia.com. **Cần xác nhận ở chi nhánh nào** |
| i02 · "Mất răng để lâu, xương tiêu dần" | ✅ `db/05` dòng 34: bó xương tiêu sau nhổ răng; `db/06`: tiêu xương Cawood & Howell | Khớp |
| i02 · "Viêm nha chu kéo dài làm tiêu xương quanh chân răng" | ✅ `db/05` (EFP): viêm nha chu Stage I–III, *"tiêu xương trên phim X-quang"* | Khớp |
| i02 · "Ở hàm trên, xoang hàm sà xuống, phần xương còn lại thấp đi" | ✅ `db/06` dòng 172: *"sự khí hóa xoang hàm… làm chiều cao xương còn lại (RBH) không đủ"* | Khớp |
| i02 · "Nâng màng xoang, ghép xương bên dưới; xương còn tương đối cao thì đặt trụ cùng lúc; quá mỏng thì ghép trước, chờ vài tháng mới đặt trụ" | ✅ `db/06` dòng 180–182: nâng xoang kín + đặt trụ khi RBH 5–8 mm; nâng xoang hở 1 thì khi RBH 3–5 mm; **RBH < 3 mm: ghép trước, đặt trụ sau 6–8 tháng** | Khớp. Tỷ lệ tồn tại 5 năm 96,8% / 95,4% (ITI, Springer). Không đưa số vào video |
| i02 · "Bác sĩ đo chiều cao, độ dày xương; xem xoang có viêm không" | ✅ `db/06` bước 1: *"Đo chính xác RBH… kiểm tra sự thông thoáng"*; chống chỉ định: *"Viêm xoang hàm cấp tính đang hoạt động"* | Khớp |
| i03 · "Mảng bám bám quanh cổ trụ → nướu viêm → xương giữ trụ tiêu → trụ lung lay (viêm quanh Implant)" | ✅ nguồn ADA 2023 (Peri-Implant Maintenance) và Springer 2024 (điều trị viêm quanh Implant) trong `db/05`; `db/05` dòng 309: kiểm soát nha chu trước cấy để *"ngăn ngừa… Viêm quanh Implant"* | Khớp |
| i03 · "Chỉ nha khoa hoặc tăm nước quanh trụ mỗi tối; tái khám khoảng 6 tháng/lần; nghiến răng hỏi về máng bảo vệ" | ✅ `db/06` dòng 152: *"máy tăm nước… chỉ nha khoa đầu cứng… mỗi tối; đeo máng bảo vệ ban đêm và tái khám… định kỳ 6 tháng/lần"* | Khớp. Engine viết cho cầu toàn hàm, lời đọc áp dụng chung cho trụ |

## Răng sứ

| Video · câu | Đối chiếu engine | Ghi chú |
|---|---|---|
| s01 · "Lớp men ở cổ răng chỉ dày chưa tới nửa milimét" | ✅ `db/05` dòng 250: *"lớp men răng… ở 1/3 cổ răng (vốn chỉ dày 0.3–0.4mm)"* | Khớp |
| s01 · "Mài lấn quá lớp men, răng dễ ê buốt; men mất không mọc lại" | 🟡 `db/05` dòng 221, 250: lộ ngà làm giảm độ bền (95,5% còn 81–84%) | Chuyện ê buốt khi lộ ngà là kiến thức phổ thông, engine nói về độ bền dán |
| s01 · "Veneer mỏng như kính áp tròng, mài rất ít" | ✅ `db/05` dòng 258: *"lớp sứ mỏng như kính áp tròng (chỉ 0.3–0.5mm)"*; dòng 219: bảo tồn ≥ 80% men | Khớp |
| s01 · "Mão toàn sứ cần mài nhiều hơn" | ✅ `db/05` dòng 220: *"Mài cùi mão toàn sứ xâm lấn nhiều mô răng"* | Khớp |
| s01 · "Răng lệch nhiều có khi niềng trước để đỡ phải mài" | ✅ `db/05` dòng 254, 315: *"ưu tiên Chỉnh nha ngắn hạn… 3–6 tháng"*, *"bảo tồn được >85% lớp men"* | Khớp |
| s01 · "Thử mẫu lên răng trước, mài xuyên qua lớp mẫu với mũi khoan định độ sâu" | ✅ `db/05` dòng 239: *"Bơm nhựa Bis-acryl lên răng qua khóa Silicone… dùng mũi khoan định mức độ sâu"* | Khớp |
| s02 · "Scan răng → thiết kế nụ cười → thử mẫu nhựa gắn tạm, bạn nhìn, cười, nói thử" | ✅ `db/05` dòng 239: DSD + mock-up *"duyệt thẩm mỹ/phát âm"*; dòng 260: *"nhìn thấy trước nụ cười tương lai… qua bước thử mẫu"* | Khớp. Asia có máy scan iTero (website). **Cần xác nhận quy trình mock-up cho răng sứ** |
| s02 · "Mẫu là thước đo giúp mài vừa đủ" | ✅ `db/05` dòng 219: *"Sửa soạn răng qua Mock-up"* | Khớp |
| s03 · "Thuốc tẩy trắng chỉ tác động lên răng thật, răng sứ không đổi màu" | ⚪ | Kiến thức phục hình phổ thông. Engine chưa có |
| s03 · "Tẩy trắng trước, chờ màu ổn định rồi mới so màu làm sứ" | 🟡 `db/05` (veneer ITI + ADA): chỉ định veneer cho *"răng đổi màu không đáp ứng với tẩy trắng"*, tức là tẩy trắng trước | Mốc thời gian chờ (thường khoảng 2 tuần) chưa có trong engine. Lời đọc dùng "một thời gian" |
| s03 · "Chọn tông hài hòa với răng thật, màu da, gương mặt" | 🟡 `db/05` dòng 258–259: *"màu sắc trong bóng tự nhiên như răng thật"* | Phần chọn màu theo khuôn mặt chưa có trong engine |

## Tổng quát · Chữa tủy (đợt 2)

Nguồn: bản nháp `data/knowledge_drafts/ADA2019_khang_sinh_dau_rang_ap_xe.json` (đã có trên `main`). Các bản nháp Cochrane 2015, BDJ 2004, EFP 2023 nằm ở
nhánh `claude/magical-lamport-1vbznb` (PR #3), đang chờ bác sĩ duyệt.

| Video · câu | Đối chiếu engine | Ghi chú |
|---|---|---|
| g01 · "Đau do tủy viêm nằm trong buồng tủy kín; kháng sinh uống gần như không tới được, không giải quyết tận gốc" | ✅ ADA 2019 (bản nháp): *"nguồn gây đau nằm trong mô tuỷ nên kháng sinh toàn thân hầu như không tới được và không giải quyết nguyên nhân"* | Khớp |
| g01 · "Hướng dẫn của Hiệp hội Nha khoa Hoa Kỳ: đa số ca đau tủy không cần kháng sinh" | ✅ ADA 2019: khuyến nghị (có điều kiện) KHÔNG dùng kháng sinh cho đa số tình huống, ưu tiên điều trị dứt điểm | Khuyến nghị có điều kiện, bằng chứng chất lượng rất thấp. Lời đọc dùng "đa số", không dùng "tất cả" |
| g01 · "Khám, chụp phim → chữa tủy giữ răng → không giữ được mới nhổ" | ✅ ADA 2019 bước 1–2: chẩn đoán tủy, cuống; điều trị dứt điểm (lấy tủy, dẫn lưu, nhổ răng) | Khớp |
| g01 · "Sốt, mệt, sưng hạch; sưng lan ra má, cổ; khó há miệng, khó nuốt, khó thở → khám ngay" | ✅ ADA 2019: biểu hiện toàn thân (sốt, mệt, sưng hạch, khít hàm, sưng lan); dấu hiệu nguy hiểm: khó thở, khó nuốt, sưng sàn miệng/cổ | Khớp |
| g02 · "Răng chữa tủy yếu chủ yếu vì mất mô, không phải vì 'chết thì giòn'" | ✅ Cochrane 2015 (bản nháp PR #3): *"yếu đi chủ yếu do MẤT MÔ RĂNG… không phải do 'răng chết bị giòn'"* | Khớp |
| g02 · "Răng cửa còn gần nguyên vẹn thường chỉ cần trám kín; răng hàm mất nhiều mô nên có mão/onlay; nghiến răng càng nên che múi" | ✅ Cochrane 2015 (bản nháp): mục chỉ định | Khớp. Cochrane kết luận bằng chứng RCT còn yếu, nên lời đọc dùng "thường", "nên", không dùng "bắt buộc" |
| g02 · "Nứt dọc xuống chân răng thường không giữ được, phải nhổ" | ✅ Cochrane 2015 (bản nháp): *"nứt dọc chân răng — biến chứng thường khiến phải nhổ răng"* | Khớp |
| g03 · "Sâu vỡ lớn tới chân răng, không còn đủ mô để phục hồi" | ✅ `db/06` dòng 113: *"sâu răng phá hủy không thể bảo tồn"* | Khớp |
| g03 · "Viêm nha chu giai đoạn nặng, xương tiêu nhiều, răng lung lay" | ✅ `db/05` (EFP): viêm nha chu, tiêu xương; `db/06` dòng 113: *"viêm nha chu Stage IV"* | Khớp |
| g03 · "Phát hiện sớm thì trám, chữa tủy, điều trị nha chu vẫn giữ được răng" | 🟡 `db/05` (EFP): SRP *"giữ lại răng thật lâu dài"*; ADA 2019: chữa tủy là điều trị bảo tồn | Ý chung, khớp |
| g03 · "Đã nhổ thì nên tính sớm: Implant, cầu răng sứ, hàm tháo lắp; chọn theo xương và sức khỏe" | ✅ BDJ 2004 (bản nháp PR #3): *"Tư vấn phục hình sớm… (implant, cầu răng, hàm tháo lắp)"* | Bản nháp cũng ghi không phải khoảng mất răng nào cũng bắt buộc làm lại răng. Lời đọc dùng "nên tính sớm" |

## Đề xuất nạp thêm vào engine

Qua trang `/admin` → Thêm tài liệu PDF, hoặc bộ tra PubMed tự động:
1. Thời gian tích hợp xương cho Implant đơn lẻ (tải lực thường quy so với tải lực sớm).
2. Tẩy trắng răng trước phục hình: thời gian chờ ổn định màu trước khi so màu và gắn sứ.
