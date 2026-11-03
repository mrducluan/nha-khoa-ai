# 6 video ngắn Nha khoa Tâm Đức Smile — 3 Implant · 3 Răng sứ

Soạn 2026-11-02 · Dọc 9:16, 1080×1920, 30 fps · 50–67 giây · Dựng bằng **HyperFrames** (HTML + GSAP → MP4),
giọng **ElevenLabs v3 — Hanh - NhaKhoa** (nữ, giọng Bắc; ổn định 0,5 · tốc độ 1,05 · tag cảm xúc), nhạc nền
ElevenLabs Music không lời (thấp hơn giọng ~10 dB), tổng −14,7 LUFS.

Nguồn đúng/sai: DNA thương hiệu `data/brand/DNA_Tam_Duc_Smile.md` (PR #1). Bản dựng: `kich-ban.mjs` (cùng thư mục) — lời
trong tài liệu này và trong `kich-ban.mjs` phải giống nhau từng chữ.

**Trạng thái: CHỜ ANH DUYỆT** chuyên môn (bác sĩ) và pháp lý quảng cáo dịch vụ y tế trước khi đăng.

---

## 0. Cách làm cho video "viral" hơn mà vẫn an toàn

| # | Video | Cách tiếp cận | Nỗi đau / ý định người xem | Kiểu tương tác xin |
|---|---|---|---|---|
| i01 | Mất 1 răng hàm, để lâu có sao không? | Hiệu ứng domino + "bên dưới nướu mới đáng lo" | Mất răng lâu, ngại làm | Comment "mất răng bao lâu" |
| i02 | Giá trụ Implant = giá cả cái răng? | Checklist **lưu lại** 4 câu hỏi | Sợ phát sinh chi phí, sợ bị "báo giá trụ" | Lưu + gửi người nhà |
| i03 | Có những điều mẹ chẳng nói… | Chuyện gia đình, cảm xúc | Con cái lo cho ba mẹ mất răng | **Gửi video cho anh chị em** |
| s01 | Không phải răng xấu nào cũng cần bọc sứ | Phá hiểu lầm, "Khoan!" | Sợ mài răng thật, sợ làm thừa | Comment vấn đề răng |
| s02 | Viền đen ở chân răng sứ — vì sao? | Giải mã hiện tượng ai cũng thấy | Sứ cũ lộ viền xám, ngại cười | Comment "sứ làm mấy năm" |
| s03 | Răng sứ trắng như gạch men? | Hài nhẹ + 3 bí mật | Sợ răng giả trân | Comment **A hoặc B** |

Nguyên tắc chung: hook trong 2 giây đầu (tiêu đề hiện ngay khung 0 để làm ảnh bìa) · mỗi video 1 vấn đề · luôn có câu
"phải khám / chụp phim mới biết" · có một đoạn `[warmly]` để lắng · CTA nhẹ: comment + **nút "INBOX ĐẶT LỊCH — Gặp bác sĩ tư vấn riêng cho bạn"** có ngón tay bấm; lời đọc cuối mỗi video gắn đúng nội dung video đó (không hiện hotline, không ghi chữ chủ đề trên đầu khung) · dòng miễn trừ
cuối video: *"Thông tin tham khảo. Chỉ định điều trị cần bác sĩ thăm khám trực tiếp."*

**Không dùng** (rà tự động bằng `node kiem-tra.mjs`, cùng quy tắc `dental_ai/content_compliance.py`): không đau, vĩnh viễn,
trọn đời, 100%, số 1, tốt nhất, rẻ nhất, cam kết kết quả · không giá, ưu đãi, trả góp, số chi nhánh, số năm kinh nghiệm
(chưa có xác nhận của doanh nghiệp) · không ảnh người thật, không lời chứng thực giả — bối cảnh gia đình ở i03 có nhãn
"Tình huống minh họa".

**Hình ảnh:**
- **Ảnh thật của Tâm Đức Smile** (`anh/td-*.jpg`, lấy từ kho Drive truyền thông): quầy lễ tân có bảng hiệu, sảnh chờ, phòng điều trị, máy CT Cone Beam, mặt tiền chi nhánh, bác sĩ làm Implant.
  - Dùng cho các cảnh "khám, chụp phim, scan", cảnh 4 câu hỏi, và tất cả cảnh cuối.
- **Video thật của Tâm Đức Smile** (`clip/*.mp4`, cắt từ video truyền thông trên Drive; doanh nghiệp xác nhận khách đã đồng ý dùng hình ảnh):
  - Cảnh quay sạch: không chữ giá/ưu đãi, không ảnh trước/sau.
  - Gồm: cụ bà cười, ông cụ được tư vấn, hàng trụ Implant, bác sĩ làm Implant, cận cảnh nụ cười, so màu răng, thiết kế CAD/CAM, bác sĩ khám, khách ăn uống.
  - Ghép theo cảnh trong `anh-kho.mjs`, chiếu chậm 1,4 lần, cắt 8% mép trên để bỏ logo nhỏ có sẵn trong video gốc.
- **Ảnh kho Pexels** (giấy phép thương mại miễn phí, danh sách ở `anh/NGUON.md`, ghép theo cảnh trong `anh-kho.mjs`):
  - Cảnh mở đầu: 1,2 giây đầu ảnh người thật hiện sáng cùng tiêu đề, dùng làm ảnh bìa.
  - Cảnh chữ lớn và cảnh cuối: ảnh hiện rõ phía sau.
  - Cảnh minh họa và danh sách: ảnh mờ tối làm nền.
  - Video i03 (chuyện gia đình) cố ý không dùng ảnh người lạ.
- **Minh họa nha khoa tự vẽ bằng SVG** có khối 3D: men răng bóng, đổ bóng, ánh kim trên trụ Implant, quầng sáng, máy quay đẩy chậm.
- **Logo:** dùng logo gốc của Tâm Đức Smile (`logo/logo-1.png`).
- **Lưu ý:** người trong ảnh kho không phải bác sĩ hay bệnh nhân của phòng khám. Không viết chú thích ngụ ý điều đó, và không dùng các ảnh này làm "trước/sau điều trị".

**Bố cục cố định** (chữ và hình không bao giờ chồng nhau): thương hiệu y 150–215 · tiêu đề y 250–470 · hình y 490–1130 ·
phụ đề karaoke y 1190–1370 · lề trái/phải ≥ 90 px (tránh cột nút TikTok).

---

## i01 — "Mất 1 răng hàm, để lâu có sao không?" (Implant · 67s)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Hàng răng, một răng hàm bật ra, dấu **?** ở chỗ trống · tiêu đề **Mất 1 răng hàm — kệ nó được không?** | `[curious]` Mất một cái răng hàm... bạn có định cứ để vậy luôn không? `[mischievously]` Khoan đã, xem hết video này rồi hãy quyết nha. |
| Xô lệch | Răng kế bên **nghiêng dần**, răng đối diện **trồi xuống** | `[dramatic]` Chỗ trống đó không đứng yên đâu. Răng bên cạnh có thể nghiêng dần vào khoảng trống. Còn răng đối diện thì trồi xuống, vì không còn gì để cắn vào. |
| Xương | Mặt cắt xương hàm, xương dưới chỗ mất răng **tiêu dần** | `[curious]` Còn bên dưới nướu... mới là chuyện ít ai để ý. Mất chân răng, xương hàm ở đó không còn được kích thích khi nhai, nên có thể tiêu dần theo thời gian. Xương càng mỏng, sau này làm răng lại càng phức tạp hơn. |
| Hệ quả | 3 thẻ: Quen nhai một bên · Thức ăn hay giắt · Khớp cắn thay đổi | `[playfully]` Rồi dần dần, bạn quen nhai một bên. Thức ăn hay giắt vào kẽ răng. Khớp cắn cũng thay đổi theo lúc nào không hay. |
| Implant | Trụ Implant cắm vào xương → khớp nối → mão sứ; lực nhai truyền xuống xương; khung "Chụp phim: xương còn đủ?" | `[enthusiastic]` Implant là cách thay luôn cả chân răng: một trụ nhỏ đặt vào xương hàm, bên trên là mão sứ. Có chân răng thay thế, lực nhai được truyền xuống xương, góp phần hạn chế tiêu xương. `[warmly]` Nhưng làm được ngay hay chưa thì phải chụp phim, xem xương còn đủ không đã nha. |
| CTA | Logo · INBOX ĐẶT LỊCH · Khám & chụp phim · Tư vấn phương án | `[cheerfully]` Bạn mất răng bao lâu rồi? Comment cho mình biết, bác sĩ Tâm Đức Smile sẽ giải đáp nha! `[excited]` Hoặc inbox Tâm Đức Smile, đặt lịch để bác sĩ chụp phim, xem xương hàm của bạn nha! |

## i02 — "Giá trụ Implant có phải giá cả cái răng? 4 câu nên hỏi" (Implant · 53s)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Trụ Implant treo thẻ giá **"GIÁ TRỤ ???"**, dấu đóng **4 CÂU NÊN HỎI** | `[curious]` Thấy giá trụ Implant... rồi tưởng đó là giá của cả một cái răng? `[mischievously]` Lưu lại bốn câu hỏi này trước khi làm nha! |
| Cấu tạo | Tách 3 phần: Mão sứ · Khớp nối (abutment) · Trụ Implant | `[enthusiastic]` Một răng Implant hoàn chỉnh có ba phần. Trụ Implant nằm trong xương, thay cho chân răng. Khớp nối ở giữa, giữ chặt phần răng bên trên. Và mão sứ, là phần bạn nhìn thấy khi cười. |
| 4 câu | Checklist tích dần: Báo giá gồm đủ 3 phần? · Có cần ghép xương? · Bảo hành thế nào? · Mấy lần hẹn, bao lâu? | `[cheerfully]` Một: báo giá đã gồm đủ trụ, khớp nối và mão sứ chưa? Hai: trường hợp của mình có cần ghép xương không? Cái này phải chụp phim CT mới biết. `[curious]` Ba: chính sách bảo hành ra sao, cần tái khám thế nào? Bốn: cả quá trình cần mấy lần hẹn, kéo dài bao lâu? |
| Lật | Chữ lớn **Hỏi kỹ — không phải khó tính** | `[warmly]` Hỏi kỹ không phải là khó tính đâu. Biết rõ từ đầu thì mình yên tâm hơn nhiều. |
| CTA | Logo · INBOX ĐẶT LỊCH · Giải thích từng hạng mục | `[cheerfully]` Gửi video này cho người nhà đang tính làm Implant nha! `[excited]` Inbox Tâm Đức Smile để đặt lịch, bác sĩ giải thích rõ từng hạng mục trước khi bạn quyết định. |

## i03 — "Có những điều mẹ chẳng nói…" (Implant · gia đình · 57s · nhạc piano ấm)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Bát cơm, đôi đũa, bóng thoại "Mẹ ăn vậy được rồi con…" · nhãn *Tình huống minh họa* | `[softly]` Bữa cơm nào mẹ cũng bảo: mẹ ăn vậy được rồi con. `[curious]` Nhưng bạn có để ý... mẹ đang né món gì không? |
| 3 dấu hiệu | Chỉ nhai một bên · Né đồ dai, đồ cứng · Hàm giả lỏng, phải tháo ra | `[warmly]` Ba dấu hiệu nhỏ mà con cái hay bỏ qua. Mẹ chỉ nhai một bên. Mẹ né thịt dai, đồ cứng, chỉ ăn món mềm. Hoặc hàm giả lỏng, mẹ phải lén tháo ra mới ăn được. |
| Lý do | **Mẹ không nói vì sợ con lo** | `[softly]` Mẹ không nói, vì sợ con lo, sợ con tốn kém. `[warmly]` Nên người mở lời... thường phải là mình. |
| Giải pháp | Implant · Cầu răng sứ · Hàm tháo lắp → *Khám, chụp phim → chọn cách phù hợp* | `[enthusiastic]` Mất răng bây giờ có nhiều cách: Implant, cầu răng sứ, hay hàm tháo lắp. Chọn cách nào, bác sĩ sẽ khám, chụp phim, xem xương hàm và sức khỏe tổng quát của mẹ trước. Không phải ai cũng cần làm Implant, cứ đưa mẹ đi khám là biết. |
| Món quà | Hai bát cơm + trái tim, "Cuối tuần con đưa mẹ đi khám nha!" | `[warmly]` Một cuộc hẹn khám răng... có khi là món quà mẹ cần nhất, mà chẳng bao giờ nói ra. |
| CTA | Logo · INBOX ĐẶT LỊCH · Đặt lịch cho ba mẹ | `[cheerfully]` Gửi video này cho anh chị em, cuối tuần mình cùng đưa mẹ đi khám nha! `[excited]` Inbox Tâm Đức Smile, đặt lịch cho mẹ gặp bác sĩ tư vấn nha! |

## s01 — "Không phải răng xấu nào cũng cần bọc sứ" (Răng sứ · 53s)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Mũi khoan tiến tới răng cửa — biển **cấm** đập xuống · **Khoan! Đừng vội mài răng** | `[dramatic]` Khoan! Đừng vội mài răng thật để bọc sứ... `[curious]` khi chưa biết răng mình thật ra đang gặp vấn đề gì. |
| 4 trường hợp | Ố vàng → Tẩy trắng · Mẻ góc nhỏ → Trám thẩm mỹ · Thưa, dáng chưa đẹp → Cân nhắc veneer · Vỡ lớn, đã chữa tủy → Mão sứ | `[cheerfully]` Răng chỉ ố vàng? Nhiều khi tẩy trắng là đủ. Mẻ một góc nhỏ? Có thể trám thẩm mỹ. Răng thưa, dáng chưa đẹp? Có thể cân nhắc veneer, thường mài ít hơn bọc sứ. Còn răng vỡ lớn hoặc đã chữa tủy, lúc đó mão sứ mới giúp bảo vệ răng. |
| Vì sao | Răng thật (lớp men) vs Sau khi mài — **Không mọc lại** | `[warmly]` Vì men răng đã mài đi thì không mọc lại được. Nên mài ít hay nhiều, làm hay không làm, phải dựa vào tình trạng thật của răng. |
| Quy trình | Khám & chụp phim → Scan răng → Giải thích từng phương án → Bạn chọn, rồi mới làm | `[enthusiastic]` Ở Tâm Đức Smile, bác sĩ khám và chụp phim trước. Scan răng để quan sát rõ hơn. Rồi giải thích từng phương án, ưu và nhược điểm. `[warmly]` Bạn hiểu rõ, chọn xong, rồi mới bắt đầu làm. |
| CTA | Logo · INBOX ĐẶT LỊCH · Đúng chỉ định | `[mischievously]` Răng bạn đang gặp chuyện gì? Comment để bác sĩ giải đáp nha! `[excited]` Hoặc inbox Tâm Đức Smile, đặt lịch để bác sĩ xem răng và tư vấn đúng cách cho bạn. |

## s02 — "Viền đen ở chân răng sứ — vì sao?" (Răng sứ · 50s)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Nụ cười, viền xám ở 2 răng cửa được khoanh đỏ | `[curious]` Cười lên lại thấy một viền đen mờ ở chân răng sứ? `[playfully]` Đừng ngại, chuyện này gặp nhiều lắm. |
| Mặt cắt | Lớp sứ · Sườn kim loại · Nướu; nướu co lại → **lộ viền xám**; tia sáng bị chặn | `[enthusiastic]` Nhiều răng sứ đời cũ có một lớp sườn kim loại bên trong. Khi nướu co lại theo thời gian, viền ở chân răng có thể lộ ra màu xám tối. Kim loại cũng cản ánh sáng, nên răng trông đục hơn răng thật. |
| Toàn sứ | Sườn kim loại vs Toàn sứ — ánh sáng xuyên qua, răng sáng tự nhiên | `[cheerfully]` Răng toàn sứ thì không có lớp kim loại đó. Ánh sáng xuyên qua được một phần, nên màu răng trông tự nhiên hơn, chân răng cũng không bị ánh xám của kim loại. |
| Lưu ý | Mão sứ bị hở · Sâu ở chân răng · Nướu bị viêm → **Đừng tự đoán — đi khám nha!** | `[warmly]` Nhưng viền tối cũng có thể do mão sứ bị hở, sâu ở chân răng, hay nướu bị viêm. Vì vậy đừng tự đoán, cũng đừng tự tháo nha. Đi khám để bác sĩ kiểm tra đúng nguyên nhân. |
| CTA | Logo · INBOX ĐẶT LỊCH · Kiểm tra răng sứ cũ | `[cheerfully]` Răng sứ của bạn làm được mấy năm rồi? Comment cho mình biết nha! `[excited]` Inbox Tâm Đức Smile, đặt lịch để bác sĩ kiểm tra răng sứ cũ cho bạn nha. |

## s03 — "Răng sứ trắng như gạch men? 3 bí mật nụ cười tự nhiên" (Răng sứ · 52s)

| Cảnh | Hình | Lời đọc |
|---|---|---|
| Hook | Nụ cười A trắng bóc lấp lánh "Gạch men?" vs nụ cười B "Tự nhiên" | `[playfully]` Làm răng sứ xong... cười lên trắng như gạch men nhà tắm? `[laughs]` Đẹp kiểu đó thì ai nhìn cũng biết là răng làm liền! |
| Bí mật 1 | Bảng so màu: con trỏ từ "Quá trắng, lệch tông" sang "Hài hòa với bạn ✓", nối với màu da + lòng trắng mắt | `[playfully]` Bí mật thứ nhất: màu răng. Răng đẹp là răng hợp với màu da và lòng trắng mắt của bạn, chứ không phải càng trắng càng tốt. |
| Bí mật 2 | Mặt tròn · Mặt vuông · Mặt dài — mỗi mặt một dáng răng | `[enthusiastic]` Thứ hai: dáng răng. Mặt tròn, mặt vuông hay mặt dài, mỗi người hợp một kiểu dáng và độ dài răng khác nhau. |
| Bí mật 3 | "Một màu, đục" vs "Có độ trong" — vệt sáng quét qua rìa cắn | `[cheerfully]` Thứ ba: độ trong ở rìa răng. Răng thật hơi trong ở mép cắn, nên răng sứ đẹp cũng cần có lớp chuyển màu đó. |
| Thử trước | Scan răng → Thiết kế nụ cười → Thử mẫu trước → *Bạn góp ý → rồi mới quyết định* | `[enthusiastic]` Vì vậy, trước khi làm, bác sĩ sẽ scan răng, thiết kế nụ cười, và có thể cho bạn thử mẫu trước. `[warmly]` Bạn được nhìn, được góp ý, rồi mới quyết định. |
| CTA | A · Trắng sáng / B · Tự nhiên · INBOX ĐẶT LỊCH | `[mischievously]` Bạn thích trắng sáng hay tự nhiên? Comment A hoặc B nha! `[excited]` Inbox Tâm Đức Smile, đặt lịch để bác sĩ tư vấn nụ cười hợp với riêng bạn! |

---

## a01 — "Cốc nước đầu giường của bố" (Implant All-on-4 · 80s · nhạc piano ấm)

Nguồn chuyên môn lấy từ engine: `db/06`, phác đồ "Phục hình toàn hàm cố định tải lực tức thì trên 4–6 Implant" (ITI 7th Consensus, EAO, ADA).
Không dùng các câu tuyệt đối trong bản dành cho bệnh nhân của engine ("hơn 90% sức nhai", "loại bỏ hoàn toàn"), vì DNA thương hiệu cấm.
Có 3 cảnh chèn video thật "sau điều trị", toàn khung, không chữ hay logo chồng lên (khách đã đồng ý dùng hình ảnh).

| Cảnh | Hình | Lời đọc | Đối chiếu engine |
|---|---|---|---|
| Hook | Cốc nước đầu giường, hàm giả chìm dần, ánh trăng · *Tình huống minh họa* | `[softly]` Mỗi tối, hàm răng của bố nằm trong một cốc nước. `[curious]` Và đã lâu lắm rồi... bố không cười thật to. | — |
| Hàm tháo lắp | Lỏng, cộm khi ăn nhai · Tháo ra vệ sinh mỗi ngày · Xương hàm vẫn tiêu dần | `[warmly]` Hàm tháo lắp giúp được nhiều người, nhưng hay gặp ba chuyện. Lỏng và cộm khi ăn nhai. Phải tháo ra vệ sinh mỗi ngày. Và xương hàm bên dưới vẫn tiêu dần theo thời gian. | Tiêu xương ở người mất răng toàn hàm (Cawood & Howell, `db/06`) |
| **Video thật 1** | Chị áo xanh cười tươi | `[warmly]` Cho đến ngày... nụ cười ấy quay trở lại. | — |
| All-on-4 | 4 trụ: 2 thẳng, 2 nghiêng 30–45° né dây thần kinh; cả dãy răng bắt vít | `[enthusiastic]` All on Four là trồng lại cả một hàm răng cố định, chỉ trên bốn trụ Implant. Hai trụ phía sau được đặt nghiêng, để tận dụng vùng xương chắc, nhiều trường hợp không cần ghép xương phức tạp. Cả dãy răng được bắt vít lên các trụ, không phải tháo ra mỗi tối nữa. | ✅ Trụ sau nghiêng 30–45°, tránh xoang/lỗ cằm, hạn chế ghép xương; cầu bắt vít |
| **Video thật 2** | Chú áo trắng giơ ngón cái | `[cheerfully]` Ăn ngon miệng, cười thật tươi. | — |
| Hành trình | Chụp CT, lên kế hoạch · Cấy trụ, gắn răng tạm cố định · 4–6 tháng: răng chính thức | `[enthusiastic]` Bác sĩ chụp phim CT, lên kế hoạch trên máy tính trước khi cấy. Nếu trụ đủ chắc, có thể gắn răng tạm cố định chỉ sau một đến ba ngày. Khoảng bốn đến sáu tháng sau, răng tạm được thay bằng răng sứ chính thức. | ✅ CBCT và kế hoạch 3D; răng tạm trong 24–72 giờ khi trụ đủ ổn định; phục hình chính thức sau 4–6 tháng |
| Phù hợp | Xương hàm phía trước đủ · Bệnh nền được kiểm soát · Có khi cần 6 trụ | `[warmly]` Nhưng không phải ai cũng hợp All on Four. Xương hàm phía trước phải đủ chiều cao và độ dày. Bệnh nền như tiểu đường cần được kiểm soát tốt. Có trường hợp bác sĩ sẽ khuyên làm sáu trụ cho chắc hơn. | ✅ Chống chỉ định: xương phía trước < 10 mm cao / < 5 mm rộng, HbA1c > 8,5%; xương xốp D3–D4 nên chọn All-on-6 |
| **Video thật 3** | Cô áo xanh lá cười nói | `[warmly]` Để nụ cười của bố mẹ... không phải giấu đi nữa. | — |
| CTA | Logo · thẻ giá **TRỒNG RĂNG IMPLANT ALL-ON-4 · chỉ 30 triệu đồng** · INBOX ĐẶT LỊCH | `[cheerfully]` Trồng răng Implant All on Four, chỉ ba mươi triệu đồng. `[excited]` Inbox Tâm Đức Smile để bác sĩ khám và tư vấn cho bố mẹ nha! | Giá do chủ dự án xác nhận ngày 2026-11-03 |

## Cần anh / phòng khám xác nhận trước khi đăng

1. Fanpage/TikTok có người trực inbox để nhận lịch (CTA duy nhất là inbox).
2. Quy trình "scan răng", "thiết kế nụ cười", "thử mẫu trước" (s01, s03) có ở mọi chi nhánh không — nếu không, sửa thành "có thể".
3. Bác sĩ duyệt câu chuyên môn: tiêu xương sau mất răng (i01), chỉ định veneer / mão sứ (s01), nguyên nhân viền tối (s02).
4. Logo gốc đã có tại `video-ngan/logo/logo-1.png` (tải từ cms.nhakhoatamducsmile.com). Nếu có bản đẹp hơn, chỉ cần thay file này.

## Đo lường gợi ý

Link bio `nhakhoatamducsmile.com/?utm_source=<kênh>&utm_campaign=nk-i01…nk-s03`. Sau 2 tuần so: tỷ lệ xem 3 giây,
xem hết, lưu/chia sẻ, số comment đúng đối tượng, tin nhắn và lịch hẹn có mặt (DNA mục 8). Giữ 2–3 cách tiếp cận tốt nhất
làm khuôn đợt sau. Ý tưởng tăng inbox: **"Comment chữ KHÁM, Tâm Đức Smile inbox tư vấn riêng"** — chỉ dùng khi fanpage/TikTok đã bật trả lời tự động hoặc có người trực, nếu không người comment sẽ bị bỏ lỡ (gợi ý đợt 2: niềng răng, Việt kiều về nước làm răng, "răng ba mẹ").

## Chạy lại

```bash
cd video-ngan && npm install
node kiem-tra.mjs                               # soát kịch bản: phụ đề khớp lời, không cụm từ cấm
ELEVENLABS_API_KEY=... node tao-giong.mjs       # lên giọng (chỉ gọi lại cảnh đổi lời)
ELEVENLABS_API_KEY=... node kiem-giong.mjs      # nghe lại bằng Speech-to-Text, so với lời gốc
ELEVENLABS_API_KEY=... node tao-nhac.mjs        # nhạc nền (đã có sẵn trong nhac/)
node dung.mjs && node render.mjs                # dựng + xuất xuat/<ma>.mp4
```
