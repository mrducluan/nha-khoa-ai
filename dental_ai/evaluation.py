"""Bộ chấm điểm chất lượng (không gọi AI, chạy nhanh, lặp lại được).

Chạy:  python -m dental_ai eval            (báo cáo đầy đủ)
       python -m dental_ai eval --failures (kèm danh sách câu sai)

Mỗi câu trong evals/questions.jsonl được chấm theo các khâu của hệ thống:
  persona   — nhận diện đúng Bác sĩ / Bệnh nhân
  flags     — phát hiện đúng dấu hiệu cấp cứu (và KHÔNG báo nhầm)
  topic     — tìm đúng phác đồ ở vị trí số 1 (top-1) / trong 3 kết quả đầu (top-3)
  none      — với câu hỏi CSDL chưa có: hệ thống nhận ra dữ liệu chưa đủ (kích hoạt fallback)
  scope     — nhận ra câu hỏi ngoài lĩnh vực nha khoa
  caution   — nhận ra đối tượng đặc biệt (thai phụ, chống đông, bisphosphonate…)
"""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .config import ROOT_DIR, get_settings
from .fallback import should_trigger_fallback
from .persona import detect_persona
from .safety import detect_red_flags

DATASET = ROOT_DIR / "evals" / "questions.jsonl"


def load_dataset(path: Path = DATASET) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


@dataclass
class Score:
    passed: int = 0
    total: int = 0

    def add(self, ok: bool) -> None:
        self.total += 1
        self.passed += int(ok)

    @property
    def rate(self) -> float:
        return self.passed / self.total if self.total else 1.0

    def __str__(self) -> str:
        return f"{self.passed}/{self.total} ({self.rate:.0%})"


@dataclass
class Report:
    metrics: dict[str, Score] = field(default_factory=lambda: defaultdict(Score))
    by_category: dict[str, Score] = field(default_factory=lambda: defaultdict(Score))
    failures: list[dict[str, Any]] = field(default_factory=list)

    def rate(self, metric: str) -> float:
        return self.metrics[metric].rate


def evaluate(conn, embedder, rows: list[dict[str, Any]] | None = None) -> Report:
    from .assistant import search
    from .scope import detect_caution, is_dental_question

    settings = get_settings()
    report = Report()
    for row in rows or load_dataset():
        q, problems = row["q"], []

        if row.get("persona"):
            got = detect_persona(q).mode
            report.metrics["persona"].add(got == row["persona"])
            if got != row["persona"]:
                problems.append(f"persona={got}")

        got_flags = {f.code for f in detect_red_flags(q)}
        expected = set(row.get("flags") or [])
        if expected:
            ok = expected <= got_flags
            report.metrics["flags_recall"].add(ok)
        else:
            ok = not got_flags
            report.metrics["flags_precision"].add(ok)
        if not ok:
            problems.append(f"flags={sorted(got_flags)} (cần {sorted(expected)})")

        dental = is_dental_question(q)
        if row["scope"] == "off":
            report.metrics["scope_off_topic"].add(not dental)
            if dental:
                problems.append("không nhận ra câu hỏi ngoài nha khoa")
        else:
            report.metrics["scope_dental"].add(dental)
            if not dental:
                problems.append("nhận nhầm là câu hỏi ngoài nha khoa")

        if row.get("caution"):
            got_c = {c.code for c in detect_caution(q)}
            ok = set(row["caution"]) <= got_c
            report.metrics["caution"].add(ok)
            if not ok:
                problems.append(f"caution={sorted(got_c)} (cần {row['caution']})")

        topics = row.get("topic")
        if topics and row["scope"] != "off":
            results = search(conn, embedder, q, 3)
            slugs = [r["clinical_topic_slug"] for r in results]
            triggered, _ = should_trigger_fallback(results, q, settings, embedder)
            if topics == ["NONE"]:
                report.metrics["none_detected"].add(triggered)
                if not triggered:
                    problems.append(f"tưởng CSDL đủ dữ liệu → {slugs[:1]}")
            else:
                top1 = bool(slugs) and slugs[0] in topics
                report.metrics["topic_top1"].add(top1)
                report.metrics["topic_top3"].add(any(s in topics for s in slugs))
                report.metrics["db_confident"].add(not triggered)
                if not top1:
                    problems.append(f"top1={slugs[:1]} (cần {topics[0]})")

        report.by_category[row["category"]].add(not problems)
        if problems:
            report.failures.append({"category": row["category"], "q": q, "problems": problems})
    return report


METRIC_LABELS = {
    "persona": "Nhận diện Bác sĩ/Bệnh nhân",
    "flags_recall": "Phát hiện cấp cứu (độ nhạy)",
    "flags_precision": "Không báo cấp cứu nhầm",
    "scope_dental": "Nhận đúng câu hỏi nha khoa",
    "scope_off_topic": "Nhận ra câu ngoài nha khoa",
    "caution": "Nhận ra đối tượng đặc biệt",
    "topic_top1": "Tìm đúng phác đồ (top-1)",
    "topic_top3": "Tìm đúng phác đồ (top-3)",
    "none_detected": "Nhận ra CSDL chưa có dữ liệu",
    "db_confident": "Tự tin với dữ liệu có sẵn (không fallback thừa)",
}


def format_report(report: Report, show_failures: bool = False) -> str:
    lines = ["== CHỈ SỐ THEO KHÂU =="]
    for key, label in METRIC_LABELS.items():
        if key in report.metrics:
            lines.append(f"  {label:<48} {report.metrics[key]}")
    lines.append("\n== THEO NHÓM CÂU HỎI (đạt mọi tiêu chí) ==")
    for cat in sorted(report.by_category):
        lines.append(f"  {cat:<28} {report.by_category[cat]}")
    if show_failures and report.failures:
        lines.append(f"\n== {len(report.failures)} CÂU CHƯA ĐẠT ==")
        for f in report.failures:
            lines.append(f"  [{f['category']}] {f['q']}\n      → " + "; ".join(f["problems"]))
    return "\n".join(lines)
