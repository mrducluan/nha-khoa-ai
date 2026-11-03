# Đối chiếu kiến thức chuyên môn trong 6 video với dữ liệu engine Nha Khoa AI

**Cách viết kịch bản lúc đầu:** lời thoại do Claude viết dựa trên:
- kiến thức nha khoa phổ thông (giáo trình phục hình, Implant);
- quy tắc truyền thông trong DNA Tâm Đức Smile (`data/brand/DNA_Tam_Duc_Smile.md`).

Lúc soạn **chưa đối chiếu có hệ thống** với dữ liệu chuẩn của engine (`db/05_seed_core_dental_knowledge.sql`,
`db/06_seed_advanced_implant_prostho_sinus.sql`: ITI, ADA, EAO, EFP, FDI, CGDent, Cochrane). Bảng dưới là phần đối chiếu
làm sau.

Ký hiệu:
- ✅ có trong engine
- 🟡 engine có nội dung liên quan nhưng diễn đạt / cơ chế khác
- ⚪ chưa có trong engine (kiến thức phổ thông, cần bác sĩ duyệt hoặc nạp thêm nguồn)

## Implant

| Video · câu | Đối chiếu engine | Ghi chú |
|---|---|---|
| i01 · "Mất chân răng, xương hàm… có thể tiêu dần theo thời gian" | 🟡 `db/05` dòng 34 (ITI Consensus 7 + ADA, Implant tức thì): *"Sau nhổ răng, bó xương (bundle bone) ở vách xương mặt ngoài bị tiêu đi do mất nguồn cấp máu từ dây chằng nha chu (PDL)"*; `db/06` (EAO/ITI): phân loại tiêu xương Cawood & Howell | Kết luận "xương tiêu dần" đúng với engine. Lời đọc giải thích bằng "không còn được kích thích khi nhai" (teo xương do không chịu lực). Engine nêu cơ chế mất mạch máu từ dây chằng nha chu. Nên để bác sĩ chọn cách diễn đạt |
| i01 · "Răng bên cạnh nghiêng dần, răng đối diện trồi xuống" | ⚪ | Kiến thức phục hình phổ thông (drifting / supra-eruption sau mất răng). Engine chưa có protocol mất răng đơn lẻ không phục hồi |
| i01 · "lực nhai được truyền xuống xương, góp phần hạn chế tiêu xương" | 🟡 `db/05` dòng 31: tỷ lệ tồn tại Implant 5 năm 97,4%, tiêu xương rìa trung bình 0,42 mm (ITI) | Engine có số liệu ổn định xương quanh Implant, chưa có câu so sánh trực tiếp với để trống |
| i01, i02 · "phải chụp phim (CT) xem xương còn đủ không"; "có cần ghép xương không" | ✅ `db/05` (CBCT: vách xương ngoài ≥ 1 mm), `db/06` (CBCT, ghép xương GBR, nâng xoang) | Khớp |
| i02 · "Một răng Implant có 3 phần: trụ, khớp nối (abutment), mão sứ" | ✅ `db/05`, `db/06` (abutment, healing abutment, MUA, mão Zirconia) | Khớp |
| i03 · "Implant, cầu răng sứ, hàm tháo lắp; không phải ai cũng cần Implant" | 🟡 `db/06` (All-on-4/6 so với hàm tháo lắp; chống chỉ định) | Engine chưa có protocol cầu răng sứ riêng |

## Răng sứ

| Video · câu | Đối chiếu engine | Ghi chú |
|---|---|---|
| s01 · "Ố vàng → nhiều khi tẩy trắng là đủ" | ✅ `db/05` protocol Veneer (ITI + ADA): chỉ định veneer cho *"răng đổi màu không đáp ứng với tẩy trắng"* | Khớp: tẩy trắng trước, veneer khi không đáp ứng |
| s01 · "Veneer thường mài ít hơn bọc sứ" | ✅ `db/05` dòng 219–220: veneer bảo tồn ≥ 80% men răng, so với *"mài cùi mão toàn sứ xâm lấn nhiều mô răng"* | Khớp |
| s01 · "Men răng đã mài đi thì không mọc lại" | ✅ `db/05` dòng 250: *"lớp men răng quý giá ở 1/3 cổ răng (chỉ dày 0,3–0,4 mm)"*, sai lầm mài không qua mock-up | Khớp |
| s01 · "Vỡ lớn hoặc đã chữa tủy → mão sứ" | ⚪ | Engine chưa có protocol mão sứ cho răng đã chữa tủy |
| s01, s03 · "Khám, chụp phim, scan, thiết kế nụ cười, thử mẫu (mock-up) trước khi làm" | ✅ `db/05` dòng 239, 260: DSD + mock-up, *"nhìn thấy trước nụ cười tương lai… qua bước thử mẫu (Mock-up)"* | Khớp |
| s02 · "Sứ đời cũ có sườn kim loại; nướu co lại lộ viền xám; kim loại cản ánh sáng; toàn sứ cho ánh sáng xuyên qua" | ⚪ | Kiến thức phục hình phổ thông (PFM so với toàn sứ). Engine chưa có |
| s02 · "Viền tối còn do mão hở, sâu chân răng, viêm nướu" | 🟡 `db/05` (EFP: viêm nha chu, tụt nướu) | Engine chưa có mục chẩn đoán phân biệt viền tối quanh mão |
| s03 · "Màu răng hợp màu da / lòng trắng mắt; dáng răng theo khuôn mặt; độ trong ở rìa cắn" | 🟡 `db/05` dòng 258–259: veneer *"màu sắc trong bóng tự nhiên như răng thật"* | Phần chọn màu và dáng theo khuôn mặt chưa có trong engine |

## Đề xuất

1. **Bác sĩ duyệt các dòng 🟡 và ⚪** trước khi đăng. Đặc biệt là câu cơ chế tiêu xương ở i01: có thể đổi lời thành
   "sau mất răng, xương ổ răng thường tiêu dần, nhất là năm đầu" cho sát nguồn ITI. Nếu đổi, phải tạo lại giọng 1 cảnh.
2. **Nạp thêm nguồn vào engine** qua trang quản trị (`/admin` → Thêm tài liệu PDF) hoặc bộ tra PubMed tự động, cho 3 chủ đề
   chưa có:
   - răng di lệch / trồi sau mất răng không phục hồi;
   - so sánh mão sứ kim loại (PFM) với toàn sứ về thẩm mỹ viền nướu;
   - chọn màu và hình dáng răng theo khuôn mặt.
3. Có thể thêm dòng nguồn nhỏ ở cảnh liên quan, ví dụ "Theo ITI Consensus & ADA", để tăng uy tín.
