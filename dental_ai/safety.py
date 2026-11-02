"""Phát hiện dấu hiệu cấp cứu (Red Flags) bằng quy tắc cố định.

Không phụ thuộc mô hình AI: nếu câu hỏi chứa dấu hiệu nguy hiểm, hệ thống LUÔN
hiển thị cảnh báo đi khám/cấp cứu ngay, trước mọi nội dung khác.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .textnorm import lower_nfc, normalize


@dataclass(frozen=True)
class RedFlag:
    code: str
    message: str


# (mã, mẫu regex trên văn bản ĐÃ CHUẨN HOÁ (textnorm.normalize), thông điệp)
_FEVER = r"(sot|nhiet do|than nhiet)\s*(cao|\d|tren)|sot\b|(3[89]|40)([.,]\d)?\s*(do|°)"
_RULES: list[tuple[str, str, str]] = [
    ("AIRWAY",
     r"kho tho|ngat tho|tho (rit|kho khe|gap)|kho nuot|khong nuot duoc|nuot (dau|vuong)|"
     r"sung (cung )?(o |vung )?(san mieng|duoi luoi|duoi ham|duoi cam|co)\b|luoi bi day len|noi khong ro",
     "Khó thở / khó nuốt / sưng sàn miệng, dưới hàm hoặc cổ có thể là nhiễm trùng lan toả hoặc phản vệ nguy hiểm tính mạng. "
     "Hãy đến khoa Cấp cứu NGAY hoặc gọi 115."),
    ("SPREADING_INFECTION",
     r"sung (lan|to|nhieu|vu|cung|ca mat|mat|ma|mi mat|len mat|xuong co|ca mat)|(mat|ma|mi mat|ma) (bi )?sung|"
     rf"sung .{{0,40}}({_FEVER})|({_FEVER}).{{0,40}}sung|sot cao|ret run|"
     r"kho ha mieng|khong ha (mieng )?duoc|ha mieng han che|kho mo mieng",
     "Sưng mặt lan rộng, kèm sốt hoặc há miệng hạn chế là dấu hiệu nhiễm trùng răng miệng đang lan. "
     "Cần khám nha khoa/cấp cứu trong hôm nay — không tự điều trị tại nhà."),
    ("BLEEDING",
     r"chay mau (khong|chua) (cam|ngung|dung|het)|chay mau (lien tuc|nhieu|o at|mai|hoai)|mau chay (mai|lien tuc|o at|nhieu|uot)|"
     r"uot (het )?gac|mau khong (cam|ngung|dung)|khong cam (duoc )?mau",
     "Chảy máu không cầm sau nhổ răng/phẫu thuật: cắn chặt gạc sạch liên tục 30 phút, ngồi đầu cao, không súc miệng. "
     "Nếu vẫn chảy hoặc đang dùng thuốc chống đông, đến cơ sở y tế NGAY."),
    ("TRAUMA",
     r"chan thuong|tai nan|gay (xuong )?ham|va dap|dap mat|nga .{0,30}(rang|mat|ham)|te nga|"
     r"rang .{0,30}(rot|bat|vang|bung|gay) (ra|mat|khoi)|(rot|bat|vang|mat|gay) (mat )?(ca )?(rang|chiec rang)|roi (mat )?rang|"
     r"bat (ca )?rang|gay (mat )?(1|mot) nua",
     "Chấn thương răng/hàm: nếu răng vĩnh viễn bị bật khỏi ổ, cầm phần thân răng (không chạm chân răng), rửa nhẹ, cắm lại vào ổ "
     "hoặc ngâm trong sữa tươi và đến nha sĩ trong vòng 60 phút. Nghi gãy xương hàm, chấn thương đầu: đến cấp cứu ngay."),
    ("NERVE",
     r"te (bi )?(moi|cam|luoi|mat).{0,40}(keo dai|nhieu ngay|khong het|chua het|mai|\d+ (ngay|tuan)|ca tuan|tuan)|"
     r"(moi|cam|luoi)( duoi| tren)? (bi )?te( bi)?.{0,40}(keo dai|nhieu ngay|khong het|chua het|mai|\d+ ngay|ca tuan|tuan)|"
     r"mat cam giac (moi|cam|luoi)",
     "Tê môi/cằm/lưỡi kéo dài sau điều trị có thể do tổn thương thần kinh — cần tái khám sớm (lý tưởng trong 24–48 giờ)."),
    ("SINUS_IMPLANT",
     r"(nuoc|thuc an|do uong).{0,30}(len|ra|chay len|vao) mui|chay mu (o )?mui|mui (hoi|chay mu)",
     "Dịch/thức ăn trào lên mũi hoặc chảy mủ mũi sau nhổ răng hàm trên / nâng xoang có thể là thông xoang hoặc nhiễm trùng xoang — "
     "cần tái khám sớm."),
    ("ORAL_CANCER",
     r"(vet loet|loet|mang trang|mang do|cuc|khoi u|u cuc|khoi cung|cuc cung).{0,40}"
     r"(khong lanh|lau lanh|hon (2|hai|3|ba) tuan|tren (2|hai) tuan|keo dai|ngay cang to|to dan|lon dan|khong dau)",
     "Vết loét/mảng trắng/mảng đỏ/khối u trong miệng không lành sau 2 tuần hoặc ngày càng to cần được bác sĩ khám và có thể sinh thiết "
     "để loại trừ ung thư miệng."),
    ("SYSTEMIC",
     r"ngat xiu|xiu|bat tinh|mat y thuc|co giat|phat ban|noi man (khap|toan)|noi me day|"
     r"(moi|hong|mat|luoi|mi mat) .{0,20}sung phu|sung phu .{0,20}(moi|hong|mat)|phu (moi|hong|mat)",
     "Dấu hiệu toàn thân (ngất, co giật, phản vệ, phát ban, sưng phù môi/họng) cần gọi cấp cứu 115 ngay."),
]
_COMPILED = [(code, re.compile(pat), msg) for code, pat, msg in _RULES]
# Từ dễ nhầm khi bỏ dấu: "ngất" ≠ "ngạt" (ngạt mũi) → kiểm tra trên văn bản CÓ dấu
_ACCENTED = [("SYSTEMIC", re.compile(r"\bngất\b|choáng (váng|ngất)|lịm đi"))]


def detect_red_flags(text: str) -> list[RedFlag]:
    normalized = normalize(text)
    accented = lower_nfc(text)
    found: dict[str, str] = {}
    for code, pattern, msg in _COMPILED:
        if pattern.search(normalized):
            found[code] = msg
    for code, pattern in _ACCENTED:
        if code not in found and pattern.search(accented):
            found[code] = next(m for c, _, m in _COMPILED if c == code)
    return [RedFlag(code, msg) for code, msg in found.items()]


PATIENT_DISCLAIMER = (
    "⚕️ *Thông tin mang tính tham khảo, giúp anh/chị hiểu rõ hơn về tình trạng răng miệng — "
    "không thay thế chẩn đoán và chỉ định của bác sĩ sau khi thăm khám trực tiếp.*"
)
DOCTOR_DISCLAIMER = (
    "*Hỗ trợ quyết định lâm sàng dựa trên bằng chứng. Bác sĩ điều trị chịu trách nhiệm đánh giá "
    "và cá thể hoá cho từng bệnh nhân; vui lòng đối chiếu trích dẫn gốc trước khi áp dụng.*"
)
