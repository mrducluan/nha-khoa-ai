"""Bộ nhận diện ý định (intent) nha khoa.

Mỗi chủ đề (intent) được mô tả bằng các cách nói thực tế của bệnh nhân và bác sĩ
(đã chuẩn hoá: không dấu, đã thay viết tắt — xem textnorm.normalize).

Dùng để:
  1. Mở rộng truy vấn tìm kiếm bằng thuật ngữ chuyên môn của chủ đề.
  2. Xếp hạng lại: phác đồ cùng chủ đề với câu hỏi được ưu tiên.
  3. Biết CSDL đã có phác đồ cho chủ đề hay CHƯA — nếu chưa, hệ thống nói thật và
     tra cứu y văn bổ sung thay vì trả lời bằng một phác đồ không liên quan.

Chủ đề của mỗi phác đồ được TỰ ĐỘNG suy ra từ tên + slug + PICO, nên phác đồ mới do
bác sĩ duyệt cũng được nhận diện ngay. Bác sĩ có thể bổ sung chủ đề / cách nói mới vào INTENTS.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Iterable

from .textnorm import normalize


@dataclass(frozen=True)
class Intent:
    code: str
    label: str
    pattern: str
    expansion: str = ""
    clinical: bool = True   # False: câu hỏi không mang nội dung lâm sàng (VD: chi phí)


INTENTS: list[Intent] = [
    Intent("PERIO", "viêm nướu / viêm nha chu",
           r"chay mau (nuou|chan rang|khi (danh|chai) rang)|mau (o|khi|lan) .{0,20}(danh rang|chai rang|nuoc bot)|lan mau|"
           r"hoi mieng|hoi tho (co mui|hoi)|mieng co mui|lung lay|tut nuou|nuou tut|lo chan rang|ho chan rang|"
           r"viem nuou|nuou (bi )?(sung|do|viem|teo|tut)|sung nuou|cao rang|voi rang|lay voi|cao voi|nha chu|tui nha chu|"
           r"tieu xuong (rang|o rang)|rang thua dan|\bsrp\b|scaling|root planing|periodont\w*|\bperio\b|\befp\b",
           "viêm nha chu periodontitis viêm nướu cạo vôi xử lý mặt gốc răng túi nha chu tiêu xương ổ răng"),
    Intent("ORTHO", "chỉnh nha / niềng răng",
           r"nieng|chinh nha|mac cai|khay (trong suot|nieng)|invisalign|aligner|"
           r"rang (bi )?(ho|mom|khap khenh|lech lac|chen chuc|vau)|khap khenh|\bcat\b|\bipr\b|attachment|\btads?\b|mini.?vis",
           "chỉnh nha khay trong suốt clear aligner orthodontics di chuyển răng mắc cài"),
    Intent("VENEER", "mặt dán sứ veneer",
           r"dan su|mat dan|veneer|laminate|rang (bi )?me|rang (bi )?thua(?! dan)|thua rang|ke thua|rang cua (bi )?me",
           "mặt dán sứ veneer phục hình thẩm mỹ dán dính adhesive"),
    Intent("CROWN_BRIDGE", "bọc răng sứ / cầu răng / inlay-onlay",
           r"boc (rang )?su|mao su|cau rang|chup su|rang su (toan su|kim loai|zirconia)|\bcrown\b|\binlay\b|\bonlay\b",
           "mão răng sứ crown cầu răng bridge"),
    Intent("WHITENING_COLOR", "tẩy trắng / đổi màu răng",
           r"tay trang|trang rang|lam trang|than hoat tinh|o vang|xin mau|nhiem mau|tetracycline|rang (bi )?(xam|den|vang) (mau|di)",
           "tẩy trắng răng whitening đổi màu răng"),
    Intent("FULL_ARCH", "mất răng toàn hàm / phục hình toàn hàm trên implant",
           r"mat (het|toan bo|ca|gan het|nhieu) rang|rung (gan )?het rang|toan ham|nguyen ham|ca ham|all on|"
           r"\b(4|6|bon|sau) tru\b|pro.?arch|edentul\w*|full.?arch|multi.?unit|cantilever|a.?p spread|"
           r"(ham|rang) (gia )?(thao lap|thao ra).{0,40}co dinh|co dinh.{0,40}(ham|rang) (gia )?thao lap",
           "mất răng toàn bộ edentulous all-on-4 all-on-6 phục hình toàn hàm cố định implant"),
    Intent("IMPLANT", "cấy ghép implant",
           r"implant|cay ghep|trong rang|\btru\b|osseointegration|tich hop xuong",
           "cấy ghép implant implantology"),
    Intent("SINUS", "nâng xoang hàm trên",
           r"nang xoang|xoang (ham|thap)|schneider|sinus|transcrestal|lateral window|osteotome|\brbh\b|lindhe",
           "nâng xoang hàm trên sinus floor elevation ghép xương màng Schneider"),
    Intent("IMMEDIATE_IMPLANT", "implant tức thì sau nhổ",
           r"implant (tuc thi|ngay|luon)|(cam|trong|dat|cay) (implant|tru|rang)( luon| ngay)|ngay sau (khi )?nho|"
           r"ngay (hom|trong ngay) (do|nho)|(dat|cay|trong|cam) .{0,15}tuc thi|immediate (implant|placement)|jumping gap|type 1a|trong ngay",
           "implant tức thì immediate implant vùng thẩm mỹ răng cửa"),
    Intent("CARIES_PREVENTION", "sâu răng sớm / fluoride / bôi thuốc ngừa sâu",
           r"sau rang (sua|chom|moi)|chom sau|rang sua (bi )?sau|sau rang .{0,10}(be|tre|con)|(be|tre|con) .{0,20}sau rang|"
           r"dom trang|vet trang|trang duc|fluor\w*|vecni|varnish|\bsdf\b|bac fluoride|sau chan rang|"
           r"boi thuoc|sealant|tram bit ho ranh|resin infiltration|cavitated",
           "sâu răng không xâm lấn fluoride varnish SDF trám bít hố rãnh"),
    Intent("FILLING", "trám răng / hàn răng",
           r"tram rang|han rang|composite|mieng tram|rang (bi )?vo (nho|mieng)",
           "trám răng composite phục hồi"),
    Intent("PULP_PAIN", "đau răng / viêm tuỷ / áp xe / điều trị tuỷ",
           r"dau rang|nhuc|dau giat|dau buot (ve|ban) dem|viem tuy|tuy rang|vao tuy|ap xe|\bmu\b|cuc mu|lo mu|chay mu|"
           r"sung mu|hoai tu tuy|pulp\w*|periapical|lay tuy|dieu tri tuy|chua tuy|noi nha|root canal|endodont\w*",
           "viêm tuỷ hoại tử tuỷ áp xe cuống răng đau răng kháng sinh điều trị tuỷ"),
    Intent("THIRD_MOLAR", "răng khôn",
           r"rang khon|moc (lech|ngam|nghieng|nam ngang|ngang)|rang (cuoi cung|trong cung)|third molar|"
           r"rang (so )?(18|28|38|48)|(18|28|38|48) (moc|ngam|lech|sat|nam)|ham thu ba",
           "răng khôn mọc ngầm third molar nhổ dự phòng theo dõi"),
    Intent("SENSITIVITY", "ê buốt răng / mòn cổ răng",
           r"e buot|\be rang|buot rang|nhay cam (nga|rang)|e khi (uong|an)|mon co (chan )?rang|mon rang",
           "ê buốt ngà nhạy cảm mòn cổ răng"),
    Intent("BRUXISM", "nghiến răng",
           r"nghien rang|can chat rang|bruxism", "nghiến răng bruxism máng nhai"),
    Intent("TMJ", "khớp thái dương hàm",
           r"khop thai duong|thai duong ham|ham keu|keu (lup cup|luc cuc|lop cop|cuc cuc)|moi ham|lech ham|\btmj\b|\btmd\b",
           "rối loạn khớp thái dương hàm TMD"),
    Intent("MUCOSA", "niêm mạc miệng: nhiệt miệng, loét, nấm, lưỡi",
           r"nhiet mieng|loet (mieng|luoi|ma)|ap.?to|aphth\w*|nam (mieng|luoi)|luoi (bi )?(trang|ban do|te|rat|nut)|"
           r"bong (mieng|niem mac)|lichen|mang trang|tua luoi",
           "bệnh niêm mạc miệng loét áp-tơ nấm miệng"),
    Intent("DRY_MOUTH", "khô miệng", r"kho mieng|it nuoc bot|xerostomia", "khô miệng xerostomia"),
    Intent("HYGIENE", "vệ sinh răng miệng / sản phẩm",
           r"ban chai|chi nha khoa|tam nuoc|may tam|nuoc suc mieng|kem danh rang|cach (danh|chai) rang|danh rang may lan",
           "vệ sinh răng miệng bàn chải chỉ nha khoa"),
    Intent("PEDIATRIC_DEV", "mọc răng & thói quen ở trẻ",
           r"moc rang|chua moc rang|thay rang|rang sua (lung lay|chua rung|moc)|mut tay|mut ti|bu binh",
           "mọc răng trẻ em răng sữa thói quen răng miệng"),
    Intent("CLEFT", "khe hở môi – vòm miệng", r"sut moi|ho ham ech|khe ho moi", "khe hở môi vòm miệng"),
    Intent("GUMMY_SMILE", "cười hở nướu", r"cuoi ho nuou|ho nuou khi cuoi", "cười hở nướu"),
    Intent("DENTURE_CARE", "hàm giả tháo lắp",
           r"(ham|rang) gia (thao lap )?(bi )?(dau|long|loet|cop|gay|lung lay)|deo ham (gia|thao lap)|ham thao lap (bi )?(dau|long)",
           "hàm giả tháo lắp"),
    Intent("TRAUMA", "chấn thương răng", r"gay rang|me rang|rang (bi )?(rot|bat|vang|gay)|chan thuong|va dap|te nga",
           "chấn thương răng"),
    Intent("COST", "chi phí / giá", r"bao nhieu tien|gia (bao nhieu|ca|tien|co dat|re)|chi phi|bao hiem|tra gop",
           clinical=False),
]
# Bao toàn bộ mẫu bằng ranh giới từ: tránh "rang khon" khớp nhầm "rang khong", "ap xe" khớp "sap xep"
_COMPILED = [(i, re.compile(r"(?<![a-z0-9])(?:" + i.pattern + r")(?![a-z0-9])")) for i in INTENTS]
BY_CODE = {i.code: i for i in INTENTS}
# Viết tắt chỉ nhận khi viết HOA trên văn bản gốc ("MUA" = multi-unit abutment ≠ "mua" sắm)
_CASE_SENSITIVE = [(re.compile(r"\bMUA\b"), "FULL_ARCH")]


def detect_intents(text: str, normalized: bool = False) -> list[Intent]:
    t = text if normalized else normalize(text)
    codes = {intent.code for intent, pattern in _COMPILED if pattern.search(t)}
    if not normalized:
        codes |= {code for pattern, code in _CASE_SENSITIVE if pattern.search(text)}
    return [i for i in INTENTS if i.code in codes]


@lru_cache(maxsize=4096)
def _protocol_intents_cached(text: str) -> frozenset[str]:
    return frozenset(i.code for i in detect_intents(text))


def protocol_intents(result: dict[str, Any]) -> frozenset[str]:
    """Chủ đề của một phác đồ: suy ra từ TÊN + slug (chính xác nhất).

    Chỉ khi tên/slug không nhận ra chủ đề nào mới đọc thêm PICO (P, I) — đọc PICO luôn sẽ gán quá
    nhiều chủ đề (VD: phác đồ veneer nhắc "răng nhiễm màu" → bị coi là có dữ liệu về tẩy trắng).
    """
    head = " ".join([result.get("protocol_title") or "", (result.get("clinical_topic_slug") or "").replace("-", " ")])
    codes = _protocol_intents_cached(head)
    if codes:
        return codes
    pico = result.get("pico_structured") or {}
    return _protocol_intents_cached(head + " " + (pico.get("P_population_problem") or "") + " "
                                    + (pico.get("I_intervention") or ""))


def clinical_codes(intents: Iterable[Intent]) -> set[str]:
    return {i.code for i in intents if i.clinical}


def coverage(question_intents: list[Intent], results: list[dict[str, Any]]) -> tuple[set[str], set[str]]:
    """(chủ đề lâm sàng đã có phác đồ, chủ đề lâm sàng CHƯA có) trong các kết quả."""
    wanted = clinical_codes(question_intents)
    have: set[str] = set()
    for r in results:
        have |= protocol_intents(r)
    return wanted & have, wanted - have


def rerank(question_intents: list[Intent], results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Ưu tiên phác đồ trùng NHIỀU chủ đề với câu hỏi; giữ thứ tự điểm trong cùng nhóm."""
    wanted = clinical_codes(question_intents)
    if not wanted:
        return results
    return sorted(results, key=lambda r: -len(wanted & protocol_intents(r)))
