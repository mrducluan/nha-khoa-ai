"""Mở rộng truy vấn: ngôn ngữ đời thường của bệnh nhân → thuật ngữ chuyên môn.

Bệnh nhân hiếm khi nói "viêm nha chu giai đoạn III"; họ nói "chảy máu chân răng, hôi miệng,
răng lung lay". Bảng ánh xạ này bổ sung thuật ngữ chuyên môn vào câu truy vấn TÌM KIẾM
(không thay đổi câu hỏi gửi cho AI), giúp cả tìm kiếm vector lẫn từ khoá chính xác hơn.

Bác sĩ có thể bổ sung dòng mới khi thêm phác đồ mới vào cơ sở dữ liệu.
"""

from __future__ import annotations

import re

from .embeddings import strip_accents

# (mẫu regex trên văn bản đã bỏ dấu, thuật ngữ bổ sung)
LAY_TO_CLINICAL: list[tuple[str, str]] = [
    (r"chay mau (nuou|chan rang|loi|khi danh rang)|hoi mieng|lung lay|tut loi|tut nuou|vien loi|viem nuou|"
     r"cao rang|voi rang|nha chu|sung loi|sung nuou|tieu xuong rang",
     "viêm nha chu periodontitis nha chu học cạo vôi xử lý mặt gốc răng túi nha chu tiêu xương ổ răng"),
    (r"nieng|chinh nha|rang ho|rang mom|rang khap khenh|khay trong suot|invisalign|mac cai",
     "chỉnh nha khay trong suốt clear aligner orthodontics di chuyển răng"),
    (r"dan su|mat dan|veneer|rang (o|xin) vang|rang thua|thay doi mau rang|rang me nho",
     "mặt dán sứ veneer phục hình thẩm mỹ dán dính adhesive"),
    (r"mat (het|toan bo|ca) rang|rang gia thao lap|ham gia|rang co dinh toan ham|all.?on|toan ham",
     "mất răng toàn bộ edentulous all-on-4 all-on-6 phục hình toàn hàm cố định implant"),
    (r"nang xoang|xoang ham|thieu xuong ham tren|xuong ham tren mong",
     "nâng xoang hàm trên sinus floor elevation ghép xương"),
    (r"(cam|trong|dat) implant ngay|implant tuc thi|ngay sau (khi )?nho|rang cua.{0,20}implant|implant.{0,20}rang cua",
     "implant tức thì immediate implant vùng thẩm mỹ răng cửa hàm trên"),
    (r"viem quanh implant|implant (bi )?(viem|chay mau|lung lay|dau)",
     "viêm quanh implant peri-implantitis bảo trì implant"),
    (r"trong rang|cay ghep|implant",
     "cấy ghép implant implantology"),
]
_COMPILED = [(re.compile(p), terms) for p, terms in LAY_TO_CLINICAL]


def expand_query(question: str) -> str:
    """Trả về câu truy vấn đã bổ sung thuật ngữ chuyên môn (nếu có)."""
    normalized = strip_accents(question)
    extra = [terms for pattern, terms in _COMPILED if pattern.search(normalized)]
    return question if not extra else f"{question} {' '.join(extra)}"
