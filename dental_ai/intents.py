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
    Intent("CROWN", "bọc răng sứ / mão sứ / inlay-onlay / vật liệu sứ",
           r"boc (rang )?su|boc mao|boc rang|mao (rang|su|rang su)|chup (rang )?su|lam rang su|(?<!cau )rang su( (toan su|kim loai|zirconia|thuy tinh))?|"
           r"toan su|su kim loai|(su|rang|rang su) (khong|co) (suon )?kim loai|suon kim loai|su (titan|zirconia|cercon)|zirconia (nguyen khoi|phu su)|monolithic|"
           r"vien (den|xam|toi|kim loai)|(den|xam|tham) (vien|chan rang su|co rang su)|"
           r"\bcrowns?\b|\binlay\b|\bonlay\b|endocrown|\bpfm\b|metal.?ceramic|all.?ceramic",
           "mão răng sứ crown sứ kim loại toàn sứ zirconia viền đen cổ răng"),
    Intent("BRIDGE", "cầu răng sứ", r"cau rang|cau su|cau (\d|ba|bon|hai) (rang|don vi)|\bbridges?\b|\bfdp\b|rang tru cau|nhip cau",
           "cầu răng sứ bridge răng trụ nhịp cầu"),
    Intent("POST_ENDO", "phục hồi răng sau chữa tuỷ (bọc mão, chốt)",
           r"((chua|lay|dieu tri|chet|mat|da (chua|lay)) tuy|noi nha).{0,50}(boc|mao|chup|onlay|chot|tram lai|phuc hoi|gion|de vo|vo)|"
           r"(boc|mao|chup|chot|che phu mui).{0,50}((chua|lay|dieu tri) tuy|noi nha)|che phu mui|cuspal coverage|chot (soi|kim loai|rang|cui)|ferrule|"
           r"root.?filled|endodontically treated|post.?and.?core|post.?endo",
           "răng đã điều trị tuỷ phục hồi che phủ múi mão răng chốt ferrule"),
    Intent("SMILE_DESIGN", "chọn màu răng / dáng răng / thiết kế nụ cười",
           r"(chon|so|lay|ghi|lech|khac) mau (rang|su)|mau rang su|mau (su|rang) (nao|tu nhien|hop)|"
           r"(dang|hinh dang|form|kieu) rang|thiet ke nu cuoi|nu cuoi (dep|hai hoa|tu nhien)|"
           r"(dang|mau) rang.{0,30}(khuon|guong) mat|(khuon|guong) mat.{0,30}(dang|mau) rang|(hop|theo) (khuon|guong) mat|"
           r"mat (vuong|tron|trai xoan|chu dien)|smile design|\bdsd\b|\bshades?\b|mock.?up|wax.?up|"
           r"(mau|tong mau) (nao|gi)( thi)? (hop|dep|tu nhien)|(hop|theo) (voi )?(mau )?da|so mau|delta e(00|ab)?|ciede\w*|cielab|thang mau|\bvita\b",
           "chọn màu răng shade selection thiết kế nụ cười dáng răng khuôn mặt mock-up"),
    Intent("TOOTH_LOSS_DRIFT", "mất răng lâu: răng bên cạnh nghiêng, răng đối diện trồi",
           r"(rang|cac rang) (\d{2} )?(ben canh|ke ben|ke can|hai ben|xung quanh|doi dien|ham doi dien|ham tren|ham duoi|phia (tren|duoi)|"
           r"ben (tren|duoi))? ?(bi |se |co )?(nghieng|xo lech|xo vao|do vao|troi|chia (ra|xuong|len)|thong xuong)|"
           r"rang doi dien.{0,20}dai ra|(moc|troi) (dai )?(xuong|len) (cho|khoang)|moc dai xuong|nghieng do|do nghieng|nga vao|thua troi|troi (xuong|len)|"
           r"(bo|de) trong (cho |khoang )?(rang|mat rang)|"
           r"mat rang (lau|lau nam|\d+ nam|nhieu nam|tu lau)|mat rang.{0,30}(khong (trong|lam rang|phuc hinh|thay)|de trong|bo trong)|"
           r"nho rang (xong |roi )?.{0,20}khong (trong|lam rang|phuc hinh|thay)|"
           r"supraerupt\w*|overerupt\w*|drifting|tipping|uprighting|dung truc( rang)?",
           "mất răng không phục hình răng kế cận nghiêng đổ răng đối diện trồi thừa trồi khoảng phục hình"),
    Intent("PERI_IMPLANT", "viêm quanh implant",
           r"viem quanh (implant|tru)|peri.?implant\w*|mucositis|implantoplasty|"
           r"(implant|tru implant|tru) (bi )?(viem|chay mau|sung|co mu|mu|ra mu|lung lay|lac|lo ren|ho ren|tieu xuong|hong|hoi)|"
           r"(viem|sung|chay mau|mu|tieu xuong|tut nuou|ho ren) (nuou )?(quanh|o|chan) (tru|implant)",
           "viêm quanh implant peri-implantitis viêm niêm mạc quanh implant mucositis"),
    Intent("ANTIBIOTIC_PROPHYLAXIS", "kháng sinh dự phòng (khớp nhân tạo, bệnh tim)",
           r"khang sinh du phong|du phong khang sinh|(uong|dung|tiem) khang sinh truoc|thay khop|khop (nhan tao|gia)|"
           r"van tim nhan tao|viem noi tam mac|premedicat\w*|prophyla\w*|endocarditis|prosthetic joint",
           "kháng sinh dự phòng trước thủ thuật nha khoa khớp nhân tạo viêm nội tâm mạc"),
    Intent("MRONJ", "hoại tử xương hàm do thuốc (bisphosphonate, denosumab)",
           r"hoai tu xuong ham|\bmronj\b|\bbronj\b|bisphosphonate|alendronate|zoledron\w*|denosumab|prolia|xgeva|zometa|aclasta|fosamax|"
           r"(thuoc|tiem|truyen) (chong |dieu tri )?(loang xuong|huy xuong)|xuong (bi )?lo (ra )?(trong mieng|o ham)|lo xuong (ham|trong mieng)",
           "hoại tử xương hàm do thuốc MRONJ bisphosphonate denosumab"),
    Intent("ORAL_LESION", "tổn thương tiền ung thư / phát hiện sớm ung thư miệng",
           r"bach san|hong san|leukoplakia|erythroplakia|tien ung thu|ung thu (mieng|luoi|nuou|khoang mieng|niem mac|moi)|oral cancer|"
           r"potentially malignant|sinh thiet|mang (trang|do).{0,30}(khong (lau|chui|cao|het)|lau khong|cao khong)|"
           r"(cuc|khoi) (u|sui|cung).{0,15}(mieng|luoi|ma|nuou|san mieng)|"
           r"(loet|vet loet|ton thuong).{0,25}(lau|khong|chua) (lanh|khoi|het)|(loet|vet loet).{0,25}(2|3|hai|ba|nhieu) tuan",
           "tổn thương tiềm năng ác tính bạch sản hồng sản ung thư khoang miệng sinh thiết"),
    Intent("WHITENING_COLOR", "tẩy trắng / đổi màu răng",
           r"tay trang|trang rang|lam trang|than hoat tinh|o vang|xin mau|nhiem mau|tetracycline|rang (bi )?(xam|den|vang) (mau|di)|"
           r"bleach\w*|whitening|carbamide|peroxide",
           "tẩy trắng răng whitening đổi màu răng"),
    Intent("FULL_ARCH", "mất răng toàn hàm / phục hình toàn hàm trên implant",
           r"mat (het|toan bo|ca|gan het|nhieu) rang|rung (gan )?het rang|toan ham|nguyen ham|ca ham|all on|"
           r"\b(4|6|bon|sau) tru\b|pro.?arch|edentul\w*|full.?arch|multi.?unit|cantilever|a.?p spread|"
           r"(ham|rang) (gia )?(thao lap|thao ra).{0,40}co dinh|co dinh.{0,40}(ham|rang) (gia )?thao lap",
           "mất răng toàn bộ edentulous all-on-4 all-on-6 phục hình toàn hàm cố định implant"),
    Intent("IMPLANT", "cấy ghép implant",
           r"implant|cay ghep|trong rang|(?<!rang )\btru\b(?! cau)|osseointegration|tich hop xuong",
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
           r"e buot|\be rang|buot (len|nhoi|tan|rang|khi)|hit (gio|hoi|khi) lanh .{0,20}buot|nhay cam nga|\bnga (rang )?(bi )?lo|lo nga|buot rang|nhay cam (nga|rang)|e khi (uong|an)|mon co (chan )?rang|mon rang",
           "ê buốt ngà nhạy cảm mòn cổ răng"),
    Intent("BRUXISM", "nghiến răng",
           r"nghien rang|can chat rang|bruxism", "nghiến răng bruxism máng nhai"),
    Intent("TMJ", "khớp thái dương hàm",
           r"khop thai duong|thai duong ham|khop ham|ham keu|keu (lup cup|luc cuc|lop cop|cuc cuc|lao xao)|moi ham|lech ham|ket ham|trat khop ham|\btmj\b|\btmd\b|"
           r"(dau|moi|nhuc) .{0,25}(mang tai|truoc tai|thai duong).{0,30}(nhai|ha mieng|an)|(nhai|ha mieng).{0,20}dau .{0,15}(mang tai|truoc tai|thai duong)|"
           r"ha mieng .{0,15}(khong (to|het|duoc)|bi han che|bi ket)|myalgia|arthralgia|dc.?tmd",
           "rối loạn khớp thái dương hàm TMD"),
    Intent("APHTHOUS", "nhiệt miệng / loét áp-tơ",
           r"nhiet mieng|loet (mieng|luoi|ma|moi|nuou)|ap.?to|aphth\w*|lo mieng|(bi )?loet .{0,20}tai (di tai lai|phat)|"
           r"(not|vet|noi|mun) loet|loet (trang|nho)|loet .{0,15}(trong|o) (ma|mieng|luoi|moi)",
           "nhiệt miệng loét áp-tơ tái phát recurrent aphthous stomatitis"),
    Intent("MUCOSA", "niêm mạc miệng khác: nấm miệng, lưỡi, lichen",
           r"nam (mieng|luoi|trang|candida)|(luoi|mieng) (bi )?nam|candida\w*|luoi (bi )?(trang|ban do|te|rat|nut)|bong (mieng|niem mac)|lichen|tua luoi",
           "bệnh niêm mạc miệng nấm miệng lưỡi bản đồ lichen phẳng"),
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
           r"(ham|rang) gia( thao lap)?.{0,20}(bi )?(dau|long|loet|cop|gay|lung lay|roi)|deo ham (gia|thao lap)|ham thao lap (bi )?(dau|long)",
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
    """Ưu tiên phác đồ trùng NHIỀU chủ đề với câu hỏi.

    Khi số chủ đề trùng bằng nhau, ưu tiên phác đồ khớp chủ đề ĐẶC HIỆU hơn — chủ đề ít phác đồ trong
    kết quả cùng có (trọng số kiểu IDF). VD: "van tim nhân tạo, cạo vôi có phải uống kháng sinh trước?"
    → "kháng sinh dự phòng" đặc hiệu hơn "nha chu". Hoà nữa thì giữ thứ tự điểm tìm kiếm.
    """
    wanted = clinical_codes(question_intents)
    if not wanted:
        return results
    shared = [wanted & protocol_intents(r) for r in results]
    df: dict[str, int] = {}
    for r in results:
        for code in protocol_intents(r) & wanted:
            df[code] = df.get(code, 0) + 1

    def key(i: int) -> tuple[int, float]:
        return (-len(shared[i]), -sum(1.0 / df[c] for c in shared[i]))

    return [results[i] for i in sorted(range(len(results)), key=key)]
