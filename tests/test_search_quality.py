"""Bộ đánh giá chất lượng truy xuất: mỗi câu hỏi phải trả đúng phác đồ ở vị trí số 1."""

import pytest

from dental_ai.assistant import search
from dental_ai.embeddings import LocalHashEmbedder

PERIO = "periodontitis-stage-1-3-stepwise-therapy"
ALIGNER = "clear-aligner-biomechanics-predictability-protocol"
VENEER = "ceramic-laminate-veneer-adhesive-protocol"
FULLARCH = "full-arch-implant-all-on-4-all-on-6-protocol"
SINUS = "maxillary-sinus-floor-elevation-protocol"
IMMEDIATE = "immediate-implant-esthetic-zone-type1"

CASES = [
    ("Tôi bị chảy máu nướu khi đánh răng thì phải làm sao", PERIO),
    ("răng tôi bị lung lay, hôi miệng", PERIO),
    ("lấy cao răng sâu dưới nướu có đau không", PERIO),
    ("SRP có cần kháng sinh toàn thân không", PERIO),
    ("niềng răng trong suốt có hiệu quả không", ALIGNER),
    ("attachment và IPR trong clear aligner", ALIGNER),
    ("dán sứ veneer có phải mài răng nhiều không", VENEER),
    ("mất hết răng hàm trên muốn làm răng cố định", FULLARCH),
    ("Torque cài đặt MUA bao nhiêu Ncm", FULLARCH),
    ("thủng màng schneider xử trí thế nào", SINUS),
    ("cắm implant ngay sau nhổ răng cửa", IMMEDIATE),
]


@pytest.mark.parametrize("question,expected", CASES)
def test_top1_retrieval(conn, question, expected):
    rows = search(conn, LocalHashEmbedder(), question, 3)
    assert rows and rows[0]["clinical_topic_slug"] == expected, [r["clinical_topic_slug"] for r in rows]


def test_search_returns_arbitration_and_edges(conn):
    rows = search(conn, LocalHashEmbedder(), "All-on-4 hay All-on-6 hàm trên", 1)
    assert rows[0]["comparative_arbitration"]
    assert rows[0]["related_clinical_edges"][0]["linked_protocol_title"]
