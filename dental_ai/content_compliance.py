"""Rà soát tuân thủ cho kịch bản video (Chế độ C) bằng quy tắc cố định.

Không phụ thuộc mô hình AI: sau khi Claude viết kịch bản, hệ thống quét các cụm từ
bị cấm theo Mục 9 DNA Tâm Đức Smile (tuyên bố tuyệt đối, so sánh nhất) và các dữ liệu
thương mại phải được doanh nghiệp xác nhận trước khi đăng (giá, ưu đãi, trả góp, thời hạn).
Kết quả là danh sách "cần rà soát", không tự sửa nội dung.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

BANNED, NEEDS_CONFIRMATION = "CAM", "CAN_XAC_NHAN"


@dataclass(frozen=True)
class ClaimFlag:
    level: str      # CAM | CAN_XAC_NHAN
    code: str
    message: str
    matches: tuple[str, ...]


# (mức, mã, regex trên văn bản đã bỏ dấu + viết thường, thông điệp)
_RULES: list[tuple[str, str, str, str]] = [
    (BANNED, "NO_PAIN", r"(100 ?%|hoan toan|tuyet doi|cam ket|dam bao)? ?khong (he )?(dau|e buot)\b",
     "Tuyên bố “không đau / không ê buốt” — chỉ được nói về trải nghiệm có kiểm soát, không khẳng định cho mọi người."),
    (BANNED, "ABSOLUTE", r"100 ?%|vinh vien|tron doi|an toan tuyet doi|chac chan (dep|thanh cong|hieu qua|khoi)|"
                         r"khong (co |gay )?bien chung|khong (can )?mai rang|chinh xac 99",
     "Tuyên bố tuyệt đối (100%, vĩnh viễn, trọn đời, chắc chắn, không biến chứng, không mài răng…)."),
    (BANNED, "SUPERLATIVE", r"\bso (1|mot)\b|hang dau|tot nhat|re nhat|uy tin nhat|dep nhat|duy nhat",
     "So sánh nhất (số 1, hàng đầu, tốt nhất, rẻ nhất…) — không được tự tuyên bố."),
    (BANNED, "GUARANTEE", r"(cam ket|dam bao|bao dam) (ket qua|thanh cong|dep|hieu qua|100)",
     "Cam kết/bảo đảm kết quả điều trị."),
    (NEEDS_CONFIRMATION, "PRICE", r"\d[\d.,]*\s*(d|dong|vnd|vnđ|k|tr|trieu)\b(\s*/\s*\w+)?",
     "Giá cụ thể — chỉ đăng khi bộ phận kinh doanh xác nhận giá, phạm vi áp dụng và chú giải."),
    (NEEDS_CONFIRMATION, "PROMO", r"giam (gia )?\d+ ?%|tra gop 0|0 ?(d|dong) tra truoc|qua tang|tang kem|mien phi|"
                                  r"uu dai|khuyen mai|tuan nay|chi con \d+|so luong co han",
     "Ưu đãi / trả góp / quà tặng / thời hạn — cần xác nhận chương trình đang hiệu lực."),
    (NEEDS_CONFIRMATION, "CREDENTIAL", r"(hon|tren) \d+ nam (kinh nghiem|hoat dong|thanh lap)|\d+ nam kinh nghiem|"
                                       r"doi tac (kim cuong|diamond)|diamond|\d+ chi nhanh|\d+ co so",
     "Số năm kinh nghiệm / cấp đối tác / số chi nhánh — thuộc danh sách [CẦN XÁC NHẬN] của DNA."),
]
_COMPILED = [(lvl, code, re.compile(pat), msg) for lvl, code, pat, msg in _RULES]


def _normalize_with_map(text: str) -> tuple[str, list[int]]:
    """Bỏ dấu từng ký tự, giữ bản đồ vị trí để trích lại đoạn gốc có dấu."""
    out, index = [], []
    for i, ch in enumerate(text):
        base = unicodedata.normalize("NFD", ch.lower()).replace("đ", "d")
        for b in base:
            if unicodedata.category(b) != "Mn":
                out.append(b)
                index.append(i)
    return "".join(out), index


def scan_claims(text: str) -> list[ClaimFlag]:
    norm, index = _normalize_with_map(text)
    flags = []
    for lvl, code, pattern, msg in _COMPILED:
        found: list[str] = []
        for m in pattern.finditer(norm):
            if m.end() == m.start():
                continue
            original = text[index[m.start()]: index[m.end() - 1] + 1].strip()
            if original and original not in found:
                found.append(original)
        if found:
            flags.append(ClaimFlag(lvl, code, msg, tuple(found[:6])))
    return flags


def render_compliance_report(flags: list[ClaimFlag]) -> str:
    if not flags:
        return ("### ✅ Rà soát tự động\nKhông phát hiện cụm từ cấm hay dữ liệu thương mại cần xác nhận. "
                "Vẫn phải duyệt chuyên môn và pháp lý trước khi đăng.")
    lines = ["### 🔎 Rà soát tự động — cần xử lý trước khi đăng"]
    for f in flags:
        icon = "⛔" if f.level == BANNED else "⚠️"
        quoted = ", ".join(f"“{m}”" for m in f.matches)
        lines.append(f"- {icon} **{f.message}** Xuất hiện: {quoted}")
    return "\n".join(lines)
