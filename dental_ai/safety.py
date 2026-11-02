"""Phát hiện dấu hiệu cấp cứu (Red Flags) bằng quy tắc cố định.

Không phụ thuộc mô hình AI: nếu câu hỏi chứa dấu hiệu nguy hiểm, hệ thống LUÔN
hiển thị cảnh báo đi khám/cấp cứu ngay, trước mọi nội dung khác.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .embeddings import strip_accents


@dataclass(frozen=True)
class RedFlag:
    code: str
    message: str


# (mã, mẫu regex trên văn bản đã bỏ dấu, thông điệp)
_RULES: list[tuple[str, str, str]] = [
    ("AIRWAY", r"kho tho|ngat tho|tho rit|kho nuot|khong nuot duoc|sung (o |vung )?(san mieng|duoi luoi|co)\b|luoi bi day len",
     "Khó thở / khó nuốt / sưng sàn miệng hoặc cổ có thể là nhiễm trùng lan toả nguy hiểm tính mạng (VD: viêm mô tế bào, Ludwig). Hãy đến khoa Cấp cứu NGAY."),
    ("SPREADING_INFECTION", r"sung (lan|to|nhieu|ca mat|mat|ma|mi mat|len mat)|sung .{0,30}sot|sot .{0,30}sung|sot cao|ret run|kho ha mieng|khong ha mieng duoc|ha mieng han che",
     "Sưng mặt lan rộng, kèm sốt hoặc há miệng hạn chế là dấu hiệu nhiễm trùng răng miệng đang lan. Cần khám nha khoa/cấp cứu trong hôm nay."),
    ("BLEEDING", r"chay mau (khong|ko) (cam|ngung|dung|het)|chay mau (lien tuc|nhieu|o at)|mau chay mai",
     "Chảy máu không cầm sau nhổ răng/phẫu thuật: cắn chặt gạc sạch liên tục 30 phút, ngồi đầu cao. Nếu vẫn chảy hoặc đang dùng thuốc chống đông, đến cơ sở y tế NGAY."),
    ("TRAUMA", r"chan thuong|tai nan|gay (rang|ham|xuong ham)|va dap|rang (bi )?(rot|bat|vang) ra|bat (ca )?rang|rot ca rang",
     "Chấn thương răng/hàm: nếu răng vĩnh viễn bị bật khỏi ổ, cầm phần thân răng (không chạm chân răng), rửa nhẹ, cắm lại vào ổ hoặc ngâm trong sữa tươi và đến nha sĩ trong vòng 60 phút. Nghi gãy xương hàm, chấn thương đầu: đến cấp cứu ngay."),
    ("NERVE", r"te (moi|cam|luoi|mat).{0,40}(keo dai|nhieu ngay|khong het|mai)|mat cam giac (moi|cam|luoi)",
     "Tê môi/cằm/lưỡi kéo dài sau điều trị có thể do tổn thương thần kinh — cần tái khám sớm (lý tưởng trong 24–48 giờ)."),
    ("SINUS_IMPLANT", r"(nuoc|thuc an|do uong).{0,30}(len|ra) mui|chay mu (o )?mui|mui (hoi|chay mu).{0,30}(implant|nang xoang)",
     "Dịch/thức ăn trào lên mũi hoặc chảy mủ mũi sau nhổ răng hàm trên / nâng xoang có thể là thông xoang hoặc nhiễm trùng xoang — cần tái khám sớm."),
    ("ORAL_CANCER", r"(vet loet|loet|mang trang|mang do|cuc|khoi u).{0,40}(khong lanh|lau lanh|hon 2 tuan|hon hai tuan|tren 2 tuan|keo dai|ngay cang to)",
     "Vết loét/mảng trắng/mảng đỏ/khối u trong miệng không lành sau 2 tuần cần được bác sĩ khám và có thể sinh thiết để loại trừ ung thư miệng."),
    ("SYSTEMIC", r"ngat|choang|mat y thuc|di ung (nang|thuoc)|phat ban toan than|sung moi.{0,20}(mat|hong)",
     "Dấu hiệu toàn thân (ngất, phản vệ, phát ban, sưng môi họng) cần gọi cấp cứu 115 ngay."),
]
_COMPILED = [(code, re.compile(pat), msg) for code, pat, msg in _RULES]


def detect_red_flags(text: str) -> list[RedFlag]:
    normalized = strip_accents(text)
    return [RedFlag(code, msg) for code, pattern, msg in _COMPILED if pattern.search(normalized)]


PATIENT_DISCLAIMER = (
    "⚕️ *Thông tin mang tính tham khảo, giúp anh/chị hiểu rõ hơn về tình trạng răng miệng — "
    "không thay thế chẩn đoán và chỉ định của bác sĩ sau khi thăm khám trực tiếp.*"
)
DOCTOR_DISCLAIMER = (
    "*Hỗ trợ quyết định lâm sàng dựa trên bằng chứng. Bác sĩ điều trị chịu trách nhiệm đánh giá "
    "và cá thể hoá cho từng bệnh nhân; vui lòng đối chiếu trích dẫn gốc trước khi áp dụng.*"
)
