"""Phạm vi câu hỏi (có thuộc nha khoa không) & nhận diện đối tượng đặc biệt."""

from __future__ import annotations

import re
from dataclasses import dataclass

from .intents import detect_intents
from .safety import detect_red_flags
from .textnorm import lower_nfc, normalize

# Từ có dấu đặc trưng nha khoa (không nhầm nghĩa khi giữ dấu)
_DENTAL_ACCENTED = re.compile(
    r"răng|nướu|lợi|hàm|miệng|lưỡi|môi|nha khoa|nha sĩ|nha chu|tủy|tuỷ|nhổ|trám|niềng|implant|cao răng|khớp cắn|xoang"
)
# Cụm không dấu đủ đặc trưng (gõ không dấu)
_DENTAL_PLAIN = re.compile(
    r"\brang (sua|khon|cua|ham|nanh|bi|toi|em|con|be|minh|gia|su)\b|\b(dau|nho|tram|nieng|danh|trong|boc|tay trang|e) rang\b|"
    r"\bnuou\b|\bmieng\b|\bnha khoa\b|\bnha si\b|\bimplant\b|\bham (tren|duoi|gia|rang)\b|\bluoi\b"
)


def is_dental_question(text: str) -> bool:
    """True nếu câu hỏi thuộc lĩnh vực răng hàm mặt (hoặc có dấu hiệu cấp cứu răng miệng)."""
    if detect_red_flags(text):
        return True
    if any(i.clinical for i in detect_intents(text)):
        return True
    return bool(_DENTAL_ACCENTED.search(lower_nfc(text)) or _DENTAL_PLAIN.search(normalize(text)))


OFF_TOPIC_ANSWER = (
    "Xin lỗi, tôi là trợ lý chuyên về **răng hàm mặt** nên không thể tư vấn nội dung này. "
    "Anh/chị có thể hỏi tôi về đau răng, chảy máu nướu, niềng răng, implant, răng khôn, chăm sóc răng cho trẻ…"
)


@dataclass(frozen=True)
class Caution:
    code: str
    label: str
    message: str


# (mã, nhãn, mẫu regex trên văn bản đã chuẩn hoá, lưu ý)
_CAUTIONS: list[tuple[str, str, str, str]] = [
    ("PREGNANCY", "Thai kỳ",
     r"mang thai|co thai|\bbau\b|thai ky|thai (\d+|mot|hai|ba) (tuan|thang)|dang (co )?bau|thai phu|cho con bu",
     "Đang mang thai/cho con bú: báo bác sĩ trước mọi điều trị. Điều trị nha khoa cần thiết thường an toàn nhất ở 3 tháng giữa; "
     "chụp phim, thuốc tê, thuốc giảm đau và kháng sinh phải được bác sĩ chọn phù hợp thai kỳ — không tự dùng thuốc."),
    ("ANTICOAGULANT", "Thuốc chống đông / chống kết tập tiểu cầu",
     r"chong dong|loang mau|warfarin|sintrom|acenocoumarol|aspirin|clopidogrel|plavix|ticagrelor|brilinta|"
     r"xarelto|rivaroxaban|apixaban|eliquis|dabigatran|pradaxa|heparin|chong ket tap",
     "Đang dùng thuốc chống đông/chống kết tập tiểu cầu: KHÔNG tự ý ngưng thuốc. Báo nha sĩ tên thuốc, liều; với thuốc kháng vitamin K "
     "cần xét nghiệm INR gần thời điểm điều trị. Nha sĩ sẽ phối hợp bác sĩ tim mạch và dùng biện pháp cầm máu tại chỗ."),
    ("BISPHOSPHONATE", "Thuốc chống loãng xương / chống tiêu xương",
     r"bisphosphonate|alendronate|fosamax|risedronate|ibandronate|zoledron|aclasta|zometa|denosumab|prolia|xgeva|"
     r"(thuoc|tiem|truyen) (chong |dieu tri )?loang xuong",
     "Dùng thuốc nhóm bisphosphonate/denosumab: có nguy cơ hoại tử xương hàm do thuốc (MRONJ) khi nhổ răng hoặc cấy implant — "
     "nguy cơ cao hơn với dạng tiêm/truyền và dùng lâu năm. Phải báo nha sĩ để đánh giá trước khi can thiệp."),
    ("DIABETES", "Đái tháo đường",
     r"tieu duong|dai thao duong|duong huyet|duong mau|hba1c|insulin|metformin",
     "Đái tháo đường: kiểm soát đường huyết tốt giúp điều trị nha chu và implant thành công hơn; đường huyết cao làm tăng nguy cơ "
     "nhiễm trùng và chậm lành. Báo nha sĩ chỉ số HbA1c gần nhất."),
    ("RADIOTHERAPY", "Xạ trị / hoá trị",
     r"xa tri|hoa tri|ung thu (vom|vung)? ?(dau|co|hong|luoi|mieng)|ung thu .{0,30}di can|dang (dieu tri|chua) ung thu|chemo|radiotherapy",
     "Từng xạ trị vùng đầu cổ: nhổ răng/phẫu thuật có nguy cơ hoại tử xương do tia xạ — cần nha sĩ đánh giá và phối hợp bác sĩ ung bướu. "
     "Đang hoá trị: cần kiểm tra công thức máu trước can thiệp."),
    ("CARDIAC", "Bệnh tim mạch",
     r"van tim|benh tim|viem noi tam mac|tim bam sinh|stent|may tao nhip|suy tim|nhoi mau co tim|cao huyet ap|tang huyet ap|huyet ap cao|thuoc (ha |tri |dieu tri )?huyet ap",
     "Bệnh tim mạch: báo nha sĩ bệnh và thuốc đang dùng. Một số trường hợp (van tim nhân tạo, tiền sử viêm nội tâm mạc, một số bệnh tim "
     "bẩm sinh) có thể cần kháng sinh dự phòng trước thủ thuật — do bác sĩ quyết định. Huyết áp cao cần được kiểm soát trước điều trị."),
    ("IMMUNOCOMPROMISED", "Suy giảm miễn dịch",
     r"\bhiv\b|ghep tang|ghep than|corticoid|prednisolon|suy giam mien dich|ung thu mau",
     "Suy giảm miễn dịch: nguy cơ nhiễm trùng cao hơn — cần nha sĩ đánh giá và phối hợp bác sĩ điều trị trước can thiệp."),
    ("ALLERGY", "Tiền sử dị ứng thuốc",
     r"di ung (thuoc|khang sinh|penicillin|amoxicillin|thuoc te|latex)|tung bi soc (thuoc|phan ve)",
     "Có tiền sử dị ứng thuốc: luôn báo nha sĩ tên thuốc và biểu hiện dị ứng trước khi kê đơn hoặc gây tê."),
    ("CHILD", "Trẻ em",
     r"\b(be|tre|con|chau|em be)( nha| toi| em| minh)? (\d+|mot|hai|ba|bon|nam|sau) (tuoi|thang)\b|\btre (em|nho|so sinh)\b|\bem be\b|"
     r"\bbe (nha|toi|minh)\b|\bcon (toi|em|minh)\b",
     "Trẻ em: liều thuốc và kem đánh răng có fluoride tính theo tuổi (trẻ dưới 3 tuổi dùng lượng bằng hạt gạo, 3–6 tuổi bằng hạt đậu). "
     "Không tự ý dùng thuốc người lớn cho trẻ; nên khám nha khoa nhi định kỳ."),
]
_COMPILED_CAUTIONS = [(c, l, re.compile(p), m) for c, l, p, m in _CAUTIONS]


def detect_caution(text: str) -> list[Caution]:
    t = normalize(text)
    return [Caution(code, label, msg) for code, label, pattern, msg in _COMPILED_CAUTIONS if pattern.search(t)]
