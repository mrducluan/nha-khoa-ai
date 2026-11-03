# Báo cáo QC — Bộ câu hỏi đánh giá & Bộ máy nhận diện ý định

## 1. Cách đánh giá

Có 2 bộ câu hỏi mô phỏng khách hàng thật, cả bệnh nhân lẫn bác sĩ:

| Bộ | Số câu | Vai trò |
|---|---|---|
| `evals/questions.jsonl` (dev) | 136 | Dùng để phát hiện lỗi và cải tiến bộ máy |
| `evals/holdout_questions.jsonl` (độc lập) | 49 | Viết **trước** khi cải tiến, cách diễn đạt khác hẳn bộ dev, **không** dùng để tinh chỉnh |

Hai bộ phủ các nhóm câu hỏi sau:
- bệnh nhân hỏi bằng ngôn ngữ đời thường, cho cả 9 chủ đề;
- bác sĩ hỏi bằng thuật ngữ chuyên môn (Ncm, RBH, Stage/Grade, TADs…);
- gõ không dấu, viết tắt kiểu chat (ko, dc, bn, ntn), sai chính tả (inplant, soang), từ vùng miền (lợi, răng cấm);
- chủ đề nha khoa mà CSDL **chưa có** (tẩy trắng, nghiến răng, bọc sứ, khớp thái dương hàm…);
- cấp cứu, và các câu "giống mà không phải" cấp cứu;
- câu ngoài lĩnh vực nha khoa;
- đối tượng đặc biệt: thai phụ, đang dùng thuốc chống đông, bisphosphonate, tiểu đường, xạ trị, bệnh tim, trẻ em.

Mỗi câu được chấm riêng ở từng khâu của hệ thống. Lệnh chấm: `python -m dental_ai eval --failures`.

> Lưu ý trung thực: bộ độc lập do cùng người viết bộ máy soạn (trước khi sửa), nên chưa độc lập hoàn toàn.
> Kiểm chứng tốt nhất là **câu hỏi thật của bệnh nhân**: xem tab "Hỏi đáp & phản hồi" ở `/admin`,
> rồi bổ sung các câu bị đánh giá 👎 vào bộ đánh giá.

## 2. Kết quả

| Khâu | Dev trước | Dev sau | **Độc lập trước** | **Độc lập sau** |
|---|---|---|---|---|
| Nhận diện bác sĩ / bệnh nhân | 95% | 100% | 89% | **96%** |
| Phát hiện cấp cứu | 80% | 100% | 33% | **100%** |
| Không báo cấp cứu nhầm | 99% | 100% | 98% | **100%** |
| Nhận ra câu ngoài nha khoa | 0% | 100% | 0% | **100%** |
| Nhận ra đối tượng đặc biệt | 0% | 100% | 0% | **100%** |
| Tìm đúng phác đồ (top-1) | 92% | 100% | 79% | **100%** |
| Nhận ra CSDL chưa có dữ liệu | 20% | 100% | 12% | **100%** |

Ngoài bộ đánh giá, kiểm thử trên trình duyệt thật còn phát hiện và sửa thêm một lỗi về **câu hỏi nối tiếp**.
Một câu hỏi mới có chủ đề riêng (VD: hỏi tẩy trắng ngay sau khi hỏi về chảy máu lợi) đã bị ghép nhầm với câu trước.

## 3. Đã bổ sung vào bộ máy

| Thành phần | File | Chức năng |
|---|---|---|
| Chuẩn hoá văn bản | `dental_ai/textnorm.py` | Hiểu chữ không dấu, viết tắt kiểu chat, lỗi gõ, từ vùng miền. Phân biệt "BN nam" (bệnh nhân nam) với "bn năm" (bao nhiêu năm), "lợi" với "lỗi" |
| Nhận diện ý định | `dental_ai/intents.py` | 26 chủ đề nha khoa, gồm cả chủ đề CSDL chưa có. Tự gắn chủ đề cho từng phác đồ, kể cả phác đồ mới được duyệt. Ưu tiên phác đồ cùng chủ đề và biết khi nào **CSDL chưa có dữ liệu** |
| Phạm vi & đối tượng đặc biệt | `dental_ai/scope.py` | Từ chối lịch sự câu ngoài nha khoa. Nhận diện 9 nhóm đối tượng đặc biệt, kèm lưu ý an toàn |
| Cảnh báo cấp cứu | `dental_ai/safety.py` | Bổ sung nhiều cách diễn đạt; xét chữ có dấu khi bỏ dấu dễ nhầm ("ngất" khác "ngạt") |
| Câu hỏi nối tiếp | `dental_ai/assistant.py` | "Còn nếu tôi bị tiểu đường thì sao?" được hiểu theo câu trước. Câu có chủ đề mới thì không bị ghép |
| Chỉ dẫn cho Claude | `dental_ai/llm.py` | Nói rõ khi CSDL chưa có dữ liệu, bắt buộc nêu lưu ý cho đối tượng đặc biệt, không đưa ra giá, chống thao túng prompt |
| Ngưỡng chất lượng trong CI | `tests/test_intent_engine.py` | Mỗi lần push, nếu chất lượng tụt dưới ngưỡng thì kiểm thử thất bại |

## 4. Giới hạn còn lại (cần biết)

- **Độ phủ kiến thức** mới có 9 phác đồ, nên với nhiều chủ đề hệ thống sẽ (đúng) báo "chưa có dữ liệu".
  Đây là giới hạn về **dữ liệu**, không phải về bộ máy. Cách mở rộng là tải PDF hướng dẫn ở `/admin`.
  Thứ tự ưu tiên: tẩy trắng, ê buốt, bọc sứ/cầu răng, trám răng, viêm quanh implant, nghiến răng/khớp thái dương hàm, vệ sinh răng miệng.
- Bộ đánh giá **chưa chấm chất lượng câu trả lời của Claude** (văn phong, độ chính xác lâm sàng), vì cần API key và bác sĩ chấm.
  Khi có key, nên lấy 30–50 câu thật để bác sĩ chấm theo thang 1–5.
- Câu hỏi rất mơ hồ, lẫn lộn ngôn ngữ bác sĩ và bệnh nhân (VD: "Bằng chứng về nhổ răng 8 dự phòng…"),
  có thể bị xếp vào chế độ bệnh nhân. Đây là lựa chọn an toàn hơn.

## 4b. Cập nhật 11/2026

Bổ sung 8 bản nháp tri thức, 6 chủ đề mới, bộ câu hỏi độc lập v2 (`evals/holdout_v2_questions.jsonl`) và sửa 8 lỗi engine
(trong đó có lỗi báo nhầm cấp cứu với câu "mất răng"). Chi tiết: [`BO_SUNG_TRI_THUC_2026_11.md`](BO_SUNG_TRI_THUC_2026_11.md).

## 5. Cách bổ sung câu hỏi đánh giá

Mỗi dòng trong `evals/questions.jsonl` là một câu:

```json
{"category": "A_patient_perio", "q": "Câu hỏi", "persona": "PATIENT", "topic": ["periodontitis-stage-1-3-stepwise-therapy"], "flags": [], "scope": "dental", "caution": []}
```

- `topic`: slug của phác đồ đúng, hoặc `["NONE"]` nếu CSDL chưa có chủ đề đó.
- `flags`: mã cấp cứu cần phát hiện (`AIRWAY`, `SPREADING_INFECTION`, `BLEEDING`, `TRAUMA`, `NERVE`, `SINUS_IMPLANT`, `ORAL_CANCER`, `SYSTEMIC`).
- `scope`: `"off"` với câu ngoài nha khoa.
- `caution`: `PREGNANCY`, `ANTICOAGULANT`, `BISPHOSPHONATE`, `DIABETES`, `RADIOTHERAPY`, `CARDIAC`, `IMMUNOCOMPROMISED`, `ALLERGY`, `CHILD`.

Khi một câu chưa đạt, cách sửa thường là thêm cách nói mới vào mẫu của chủ đề trong `dental_ai/intents.py`.
