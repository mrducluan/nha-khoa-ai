# Bổ sung tri thức & nâng cấp engine — tháng 11/2026

## 1. Tóm tắt

| Hạng mục | Trước | Sau |
|---|---|---|
| Phác đồ trong CSDL gốc | 6 | 6 (giữ nguyên file gốc) |
| Bản nháp chờ bác sĩ duyệt | 3 | **11** (+8) |
| Chủ đề engine nhận diện | 26 | **31** (+6 mới, tách bọc sứ / cầu răng) |
| Câu hỏi đánh giá | 185 | **237** (+34 câu dev, +18 câu độc lập v2) |
| Kiểm thử tự động | 83 | **108** (tất cả đạt) |

Bốn chủ đề anh yêu cầu đều đã có bản nháp. Em bổ sung thêm 4 chủ đề nằm trong danh sách ưu tiên của báo cáo QC
(trước đây engine trả lời "chưa có dữ liệu").

## 2. Tám bản nháp mới (`data/knowledge_drafts/`)

Mọi trích dẫn dưới đây em đã **đối chiếu thư mục (tác giả, năm, tạp chí, DOI/PMID) qua tìm kiếm web**.
Em chỉ đọc được **tóm tắt (abstract)**, chưa đọc toàn văn: môi trường làm việc chặn truy cập trực tiếp Crossref/PubMed
và trang nhà xuất bản, và repo không có file PDF nào. Vì vậy mỗi file đều có trường `_ghi_chu` ghi rõ phần nào bác sĩ cần đối chiếu nguyên văn.

| # | Chủ đề | File | Nguồn chính (đã xác minh thư mục) | Mức bằng chứng |
|---|---|---|---|---|
| 1 | **Mất răng → răng bên cạnh nghiêng, răng đối diện trồi** | `BDJ2004_rang_nghieng_troi_sau_mat_rang.json` | Craddock & Youngson, *Br Dent J* 2004;196:341-348, doi:10.1038/sj.bdj.4811083; bổ trợ Kiliaridis 2000 (*Int J Prosthodont*, PMID 11203673) | Quan sát |
| 2 | **Viền xám sứ kim loại so với toàn sứ** | `DentMater2015_rang_su_kim_loai_vs_toan_su_vien_xam.json` | Sailer, Pjetursson và cs., *Dent Mater* 2015;31:603-623, doi:10.1016/j.dental.2015.02.011 (67 nghiên cứu; tồn tại 5 năm của sứ-kim loại 94.7%); bổ trợ Jung 2007 (*IJPRD*, đổi màu niêm mạc) | Tổng quan hệ thống |
| 3 | **Răng đã chữa tuỷ có cần bọc mão** | `Cochrane2015_rang_chua_tuy_boc_mao_su.json` | Cochrane CD009109.pub3 (2015); bổ trợ Aquilino & Caplan, *J Prosthet Dent* 2002, doi:10.1067/mpr.2002.122014 (không bọc mão → mất răng cao gấp ~6 lần) | Cochrane: rất thấp; trình bày trung thực |
| 4 | **Chọn màu & dáng răng theo khuôn mặt** | `JERD2015_chon_mau_dang_rang_theo_khuon_mat.json` | Paravina và cs., *J Esthet Restor Dent* 2015, doi:10.1111/jerd.12149 (ngưỡng ΔE00 0.8 / 1.8); bổ trợ Varjão 2006 (dáng răng trùng dáng mặt ~24%, thuyết Williams không được ủng hộ) | Đa trung tâm |
| 5 | Viêm quanh implant | `EFP2023_viem_quanh_implant.json` | **EFP S3** 2023, *J Clin Periodontol* 50(S26):4-76, doi:10.1111/jcpe.13823 | Hướng dẫn S3 |
| 6 | Kháng sinh dự phòng (khớp nhân tạo, bệnh tim) | `ADA2015_khang_sinh_du_phong_khop_nhan_tao_tim_mach.json` | **ADA** 2015, *JADA* 146(1):11-16, doi:10.1016/j.adaj.2014.11.012; phần tim mạch theo AHA 2021 | Hướng dẫn ADA |
| 7 | Nghiến răng | `JOR2018_nghien_rang_bruxism.json` | Đồng thuận quốc tế, Lobbezoo và cs., *J Oral Rehabil* 2018, doi:10.1111/joor.12663 | Đồng thuận |
| 8 | Tẩy trắng răng | `Cochrane2018_tay_trang_rang.json` | Cochrane CD006202.pub2 (2018, 71 thử nghiệm) | Cochrane: thấp |

Cả 8 file đều **đạt schema 02** (kiểm thử `test_drafts_are_valid`). Mỗi file có đủ PICO, cơ chế bệnh sinh, chỉ định/chống chỉ định,
quy trình từng bước kèm thông số, biến chứng, mẹo cho bác sĩ trẻ và **bản giải thích cho bệnh nhân**.

**Nguyên tắc em đã giữ khi soạn:**
- Không bịa số liệu. Số nào lấy từ tóm tắt bài gốc thì ghi rõ nguồn. Thông số theo thực hành phổ biến (VD: khoảng gần–xa ≥ 7 mm cho implant răng sau, tỷ lệ rộng/dài răng cửa 75–85%) được ghi "tham khảo thực hành".
- Nêu rõ giới hạn bằng chứng. VD: Cochrane 2015 kết luận **chưa đủ bằng chứng RCT** rằng bọc mão tốt hơn trám. Bản nháp không ghi "bắt buộc bọc"; nó giải thích quyết định dựa trên lượng mô răng còn lại và vị trí răng.
- Sửa các hiểu lầm phổ biến: thuyết "mặt vuông thì răng vuông" không có bằng chứng; "răng chết tuỷ thì giòn" không đúng (răng yếu do mất mô); mọi răng mất đối kháng đều trồi nhiều là sai (Kiliaridis: 18% không trồi, 58% trồi < 2 mm); "uống kháng sinh trước khi làm răng nếu có khớp nhân tạo" không được ADA khuyến nghị; clindamycin không còn trong phác đồ AHA 2021.

### Nạp vào hệ thống (bắt buộc qua bác sĩ duyệt)

```bash
make drafts                       # gửi toàn bộ bản nháp vào hàng chờ duyệt (Docker)
# hoặc: python -m dental_ai ingest data/knowledge_drafts/*.json --by "BS. ..."
```

Sau đó vào `/admin` → **Hàng chờ duyệt**, đối chiếu từng bản với nguyên văn rồi bấm **Duyệt**, rồi chạy `verify-citations`.
Theo đúng nguyên tắc của hệ thống, em **không** nạp thẳng nội dung y khoa vào CSDL khi chưa có bác sĩ duyệt.

## 3. Lỗi engine phát hiện khi rà soát & đã sửa

| # | Lỗi | Hậu quả | Cách sửa |
|---|---|---|---|
| 1 | Mẫu cảnh báo chấn thương chứa cụm "mất răng" | Mọi câu "mất răng lâu năm…" bị báo **🚨 cấp cứu chấn thương** | Bỏ "mất" khỏi mẫu, vẫn bắt "rơi/gãy **mất** răng" |
| 2 | Bỏ dấu khiến "**rồi** răng" trùng "**rơi** răng" | "mất răng 3 năm rồi răng bên cạnh…" bị báo cấp cứu | Kiểm tra "rơi răng" trên văn bản **có dấu** |
| 3 | "All-on-4" có gạch nối không được nhận ra | Câu bác sĩ về All-on-4 ra nhầm phác đồ | Chuẩn hoá `all-on-4`, `allon4`, `all on 4` |
| 4 | Gộp "bọc sứ" và "cầu răng" thành một chủ đề | Hỏi "cầu răng" sẽ được trả lời bằng phác đồ mão đơn lẻ | Tách thành `CROWN` và `BRIDGE` |
| 5 | Khi 2 phác đồ hoà số chủ đề trùng, engine chỉ dựa điểm tìm kiếm | "Van tim nhân tạo, cạo vôi có cần kháng sinh?" ra phác đồ nha chu | Ưu tiên chủ đề **đặc hiệu** hơn (trọng số kiểu IDF) |
| 6 | Bỏ dấu khiến "tẩy trắng **trong răng**" trùng "**trồng răng**" | Phác đồ tẩy trắng bị gán nhầm chủ đề implant | Sửa tiêu đề; thêm kiểm thử chống nhầm |
| 7 | Thiếu thuật ngữ chuyên môn mới (ferrule, nội nha, MOD, ΔE00, supraeruption…) | Câu hỏi của bác sĩ bị trả lời theo chế độ bệnh nhân | Bổ sung từ khoá và chuẩn hoá ký hiệu Δ |
| 8 | Mẫu "hàm giả tháo lắp" không chấp nhận chữ chen giữa | "Răng giả tháo lắp hàm dưới bị lỏng" không nhận ra là chủ đề chưa có dữ liệu | Nới mẫu |

Em có thử thêm một heuristic: coi chủ đề nêu trước trong câu là chủ đề chính. Heuristic này làm hỏng câu
"Răng ố vàng, thưa, có nên dán sứ không" (chủ đề chính là dán sứ dù nêu sau), nên em **bỏ**.

## 4. Kết quả đánh giá (`python -m dental_ai eval --failures`)

| Chỉ số | Dev (170 câu) | Độc lập cũ (49) | **Độc lập v2 (18) — lần chạy đầu** | Độc lập v2 sau sửa |
|---|---|---|---|---|
| Bác sĩ / bệnh nhân | 100% | 96% | 67% | 100% |
| Không báo cấp cứu nhầm | 100% | 100% | 100% | 100% |
| Tìm đúng phác đồ top-1 | 100% | 100% | **81%** | 100% |
| Nhận ra CSDL chưa có dữ liệu | 100% | 100% | 50% | 100% |

> **Lưu ý trung thực:** bộ v2 được viết **trước** khi chạy, và con số trung thực nhất là cột *lần chạy đầu* (top-1: 81%).
> Sau khi sửa engine dựa trên các câu sai của bộ này, bộ v2 không còn độc lập. Lần sau cần một bộ câu hỏi mới,
> tốt nhất là câu hỏi **thật** của bệnh nhân lấy từ tab "Hỏi đáp & phản hồi".

## 5. Việc bác sĩ cần làm trước khi duyệt

1. Đối chiếu **nguyên văn** các con số định lượng được ghi trong `_ghi_chu` của từng file.
2. Phác đồ kháng sinh dự phòng: đối chiếu liều với AHA 2021 **và hướng dẫn của Bộ Y tế Việt Nam** (nếu có).
3. Phác đồ tẩy trắng: kiểm tra quy định nồng độ peroxide được phép lưu hành tại Việt Nam.
4. Chạy `verify-citations` sau khi duyệt.

## 6. Đề xuất bổ sung tiếp (theo thứ tự ưu tiên)

Các chủ đề engine đã nhận diện được nhưng vẫn **chưa có phác đồ**. Hiện engine trả lời trung thực "chưa có dữ liệu" và tra PubMed bổ sung.

| Ưu tiên | Chủ đề | Nguồn nên tìm PDF để nạp bằng `/admin` → Tải PDF |
|---|---|---|
| 1 | Ê buốt ngà / mòn cổ răng | Tổng quan Cochrane về kem chống ê; đồng thuận quốc tế về ê buốt ngà |
| 2 | Cầu răng sứ (BRIDGE) | Pjetursson/Sailer 2015 *Dent Mater* Part II (FDPs), cùng nhóm tác giả với bản nháp số 2 |
| 3 | Bệnh nhân dùng thuốc chống đông khi nhổ răng | SDCEP *Management of Dental Patients Taking Anticoagulants or Antiplatelet Drugs* |
| 4 | Khớp thái dương hàm (TMD) | DC/TMD (Schiffman 2014, *J Oral Facial Pain Headache*) |
| 5 | Hoại tử xương hàm do thuốc (MRONJ) | AAOMS Position Paper 2022 |
| 6 | Implant: các hướng dẫn **ITI** và **EAO** gốc | ITI Treatment Guide là sách (không có DOI), cần anh cung cấp PDF; các tuyên bố đồng thuận EAO đăng trên *Clin Oral Implants Res* |
| 7 | Khô miệng, nhiệt miệng/niêm mạc, hàm giả tháo lắp, vệ sinh răng miệng | Cochrane Oral Health |

Danh sách nguồn của schema 02 chưa có SDCEP, AHA, AAOMS, AAE. Khi cần, nên bổ sung các mã này vào `organization_code`
(schema 02, ràng buộc CHECK trong db/01 qua file nâng cấp db/08).


---

# Đợt 2 — ê buốt ngà, cầu răng và bệnh lý nha khoa

## 7. Sáu bản nháp mới

Cách xác minh giống đợt 1: thư mục được đối chiếu qua tìm kiếm web, nội dung dựa trên tóm tắt (chưa đọc toàn văn); mỗi file có `_ghi_chu`.

| # | Chủ đề | File | Nguồn chính (đã xác minh thư mục) |
|---|---|---|---|
| 9 | **Ê buốt ngà** | `JDent2018_e_buot_nga.json` | Tổng quan hệ thống *J Dent* 2018;75:12-21, doi:10.1016/j.jdent.2018.05.012 (53 RCT, 4796 bệnh nhân) |
| 10 | **Cầu răng sứ** | `DentMater2015_cau_rang_su.json` | Pjetursson, Sailer và cs., *Dent Mater* 2015;31:624-639, doi:10.1016/j.dental.2015.02.013 (tồn tại 5 năm của cầu sứ-kim loại 94.4%, zirconia 90.4%) |
| 11 | Nhiệt miệng (loét áp-tơ) | `Cochrane2012_nhiet_mieng_loet_apto.json` | Cochrane CD005411.pub2 (2012): chưa có thuốc toàn thân nào được chứng minh hiệu quả |
| 12 | Khớp thái dương hàm | `JOFPH2014_khop_thai_duong_ham_TMD.json` | Tiêu chí DC/TMD, Schiffman và cs., *J Oral Facial Pain Headache* 2014, doi:10.11607/jop.1151 |
| 13 | Hoại tử xương hàm do thuốc (MRONJ) | `AAOMS2022_hoai_tu_xuong_ham_do_thuoc_MRONJ.json` | AAOMS Position Paper 2022, *J Oral Maxillofac Surg* 80:920-943, doi:10.1016/j.joms.2022.02.008 |
| 14 | Tổn thương tiền ung thư / ung thư miệng | `ADA2017_ton_thuong_tien_ung_thu_mieng.json` | **ADA** 2017, *JADA* 148:712-727, doi:10.1016/j.adaj.2017.07.032 (đã có bản cập nhật 2026 — cần đối chiếu) |

Lưu ý riêng:
- Tên tác giả bài J Dent 2018 chưa đối chiếu được, nên file ghi "đối chiếu PubMed".
- AAOMS ban đầu tạm ghi theo nhà xuất bản (ELSEVIER); đợt 3 đã bổ sung mã tổ chức `AAOMS` (xem mục 11).

## 8. Lỗi engine phát hiện thêm & đã sửa

| # | Lỗi | Hậu quả | Cách sửa |
|---|---|---|---|
| 9 | Bỏ dấu khiến "**ngà** răng" và "răng **ngả**" trùng "**ngã**" | Câu về nhạy cảm ngà, răng nghiêng bị báo 🚨 **cấp cứu chấn thương** | Kiểm tra "ngã" trên văn bản có dấu; mẫu không dấu "bị ngã" chỉ áp dụng khi người dùng gõ hoàn toàn không dấu |
| 10 | Chủ đề "niêm mạc miệng" gộp nhiệt miệng với nấm miệng, lưỡi bản đồ | Có phác đồ nhiệt miệng thì engine tưởng đã có dữ liệu về nấm miệng | Tách `APHTHOUS` (nhiệt miệng) khỏi `MUCOSA` |
| 11 | "răng **trụ**" (trụ cầu) hiểu thành "trụ implant" | Phác đồ cầu răng bị gán chủ đề implant | Loại trừ "răng trụ", "trụ cầu" |
| 12 | "cầu răng sứ" chứa "răng sứ" | Câu về cầu răng bị coi là câu về bọc mão | Loại trừ "cầu răng sứ" khỏi chủ đề bọc sứ |
| 13 | Thiếu cách nói: "cầu 3 răng", "buốt lên tận óc", "nốt loét trắng trong má", "đau mang tai khi nhai", "thuốc huyết áp", "ung thư di căn" | Không nhận ra chủ đề hoặc đối tượng đặc biệt | Bổ sung mẫu; thêm chủ đề `MRONJ`, `ORAL_LESION` |

## 9. Kết quả đánh giá đợt 2

| Chỉ số | Dev (186) | Độc lập cũ (49) | v2 (18) | **v3 (19) — lần chạy đầu** | v3 sau sửa |
|---|---|---|---|---|---|
| Bác sĩ / bệnh nhân | 100% | 96% | 100% | 75% | 100% |
| Không báo cấp cứu nhầm | 100% | 100% | 100% | 94% | 100% |
| Tìm đúng phác đồ top-1 | 100% | 100% | 100% | **81%** | 100% |
| Nhận ra CSDL chưa có dữ liệu | 100% | 100% | 100% | 100% | 100% |

Bộ v3 được viết trước khi chạy; con số trung thực là cột *lần chạy đầu*. Kiểm thử tự động: **126 test, tất cả đạt**.

## 10. Còn thiếu (đề xuất đợt 3)

Thuốc chống đông khi nhổ răng (SDCEP), khô miệng, nấm miệng, hàm giả tháo lắp, nha khoa trẻ em (mọc răng, thói quen mút tay),
trám composite, cười hở lợi, vệ sinh răng miệng, và các hướng dẫn ITI/EAO gốc (cần anh cung cấp PDF).


---

# Đợt 3 — các chủ đề còn thiếu

## 11. Về việc tự tìm PDF để nạp

Em đã thử cho công cụ đọc web mở toàn văn từ sdcep.org.uk, aapd.org, pubmed.ncbi.nlm.nih.gov, cochrane.org,
cochranelibrary.com và academic.oup.com. **Tất cả đều bị chặn** bởi chính sách mạng của môi trường cloud
(lỗi phân giải tên miền). Vì vậy đợt 3 vẫn chỉ dựa vào thông tin đã đối chiếu qua tìm kiếm web (thư mục và tóm tắt).
Với 3 tài liệu không đọc được cả phần tóm tắt khuyến nghị (SDCEP, IDSA, AAPD), `_ghi_chu` của từng file ghi rõ
**"AI CHƯA đọc được"** và bắt buộc bác sĩ đối chiếu.

Cách mở để lần sau em đọc được toàn văn: vào menu môi trường cloud trên thanh tiêu đề phiên → **Edit** → **Network access**.
Chọn mức truy cập rộng hơn, hoặc thêm các tên miền trên vào **Allowed domains**
(hướng dẫn: https://code.claude.com/docs/en/cloud-environments#network-access).
Cách khác: anh tải PDF lên trang `/admin` → **Tải PDF**. Công cụ bóc tách sẵn có sẽ dùng Claude API để chuyển PDF thành JSON chuẩn schema 02.

**Danh mục tổ chức:** file nâng cấp `db/08_more_source_organizations.sql` (chạy lại an toàn) và schema 02 bổ sung
`SDCEP`, `AAPD`, `ACP`, `IDSA`, `AAOMS`, `AHA`, `AAE`, `WHO`. Tài liệu không có DOI dùng mã định danh (VD: `SDCEP-ANTICOAG-2022`).

## 12. Bảy bản nháp mới

| # | Chủ đề | File | Nguồn | Mức đã đọc |
|---|---|---|---|---|
| 15 | **Thuốc chống đông / chống kết tập tiểu cầu khi làm răng** | `SDCEP2022_thuoc_chong_dong_nho_rang.json` | SDCEP, bản 2 (3/2022) | ⚠️ Chỉ thư mục — **chưa đọc được nội dung**; ngưỡng INR, cách bỏ/hoãn liều DOAC bắt buộc đối chiếu |
| 16 | Khô miệng | `Cochrane2011_kho_mieng.json` | Cochrane CD008934 (2011): 36 RCT, không có bằng chứng mạnh cho điều trị tại chỗ nào | Tóm tắt |
| 17 | Nấm miệng / viêm miệng do hàm giả | `IDSA2016_nam_mieng_candida.json` | IDSA 2016, doi:10.1093/cid/civ933 | ⚠️ Chỉ thư mục — liều thuốc bắt buộc đối chiếu |
| 18 | Chăm sóc hàm giả tháo lắp | `ACP2011_cham_soc_ham_gia_thao_lap.json` | ACP 2011 (15 khuyến nghị; Felton và cs.) | Tóm tắt (PMID cần đối chiếu) |
| 19 | Trẻ mọc răng, mút tay, ti giả | `AAPD2024_moc_rang_thoi_quen_mut_tay_ti_gia.json` | AAPD Policy on Pacifiers 2024, Policy on Oral Habits | ⚠️ Trích đoạn — mốc tuổi bắt buộc đối chiếu |
| 20 | Trám composite so với amalgam | `Cochrane2021_tram_rang_composite_amalgam.json` | Cochrane CD005620.pub3 (2021): composite thất bại RR 1.89, sâu tái phát RR 2.14 | Tóm tắt |
| 21 | Vệ sinh răng miệng | `Cochrane2014_ve_sinh_rang_mieng_ban_chai.json` | Cochrane CD002281 (2014): bàn chải điện giảm mảng bám 11–21% | Tóm tắt |

## 13. Lỗi engine phát hiện thêm & đã sửa

| # | Lỗi | Cách sửa |
|---|---|---|
| 14 | Câu hỏi giả định "uống warfarin cạo vôi **có bị chảy máu nhiều không**" bị báo 🚨 cấp cứu chảy máu | Phân biệt câu hỏi với tình trạng đang chảy máu; vẫn bắt "chảy máu nhiều không cầm" |
| 15 | "há **miệng hạn** chế" khớp với "**miếng hàn**" | Thu hẹp mẫu "miếng hàn" |
| 16 | "đẹn" (nấm miệng trẻ sơ sinh) chưa được nhận ra; "bé **mới** 2 tháng" không được coi là trẻ em | Bổ sung mẫu |
| 17 | Chủ đề trẻ em gộp "đang mọc răng" với "chậm mọc răng" | Tách `TEETHING_HABITS` khỏi `PEDIATRIC_DEV` |
| 18 | Nấm miệng gộp chung với lưỡi bản đồ, lichen | Tách `CANDIDA` khỏi `MUCOSA` |
| 19 | Từ khoá có ký tự regex (`\d`, `\w`) bị escape nên không bao giờ khớp (lỗi em đưa vào ở đợt 2) | Viết lại đúng dạng regex; chạy test với `-W error::SyntaxWarning` |
| 20 | Thiếu thuật ngữ bác sĩ: "INR 3.2", "Newton type II", "thủ thuật nguy cơ chảy máu" | Bổ sung |

## 14. Kết quả đánh giá đợt 3

| Chỉ số | Dev (197) | Độc lập cũ | v2 | v3 | **v4 (18) — lần chạy đầu** | v4 sau sửa |
|---|---|---|---|---|---|---|
| Bác sĩ / bệnh nhân | 100% | 96% | 100% | 100% | **0/3** | 100% |
| Không báo cấp cứu nhầm | 100% | 100% | 100% | 100% | 100% | 100% |
| Tìm đúng phác đồ top-1 | 100% | 100% | 100% | 100% | **94%** | 100% |
| Nhận ra CSDL chưa có dữ liệu | 100% | 100% | — | 100% | 50% | 100% |

Engine nhận diện **37 chủ đề**. Tổng **23 bản nháp** chờ duyệt, **141 kiểm thử tự động** đều đạt.

## 15. Còn thiếu

Cười hở nướu, khe hở môi – vòm miệng, lưỡi bản đồ/lichen/hội chứng rát miệng, trẻ chậm mọc răng – thay răng,
chỉnh nha mắc cài (hiện mới có khay trong suốt), và các hướng dẫn ITI/EAO gốc (cần PDF hoặc mở mạng).
