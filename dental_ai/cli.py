"""Dòng lệnh: python -m dental_ai <lệnh>"""

from __future__ import annotations

import argparse
import json
import logging
import sys

from .config import get_settings
from .db import connect
from .embeddings import get_embedder


def _print(obj) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2, default=str))


def cmd_init_db(args) -> None:
    from .knowledge import init_db

    with connect() as conn:
        files = init_db(conn, reset=args.reset)
    print("Đã chạy:", ", ".join(files))
    print("Bước tiếp theo: python -m dental_ai reindex")


def cmd_reindex(args) -> None:
    from .knowledge import reindex

    embedder = get_embedder()
    print(f"Đang sinh chỉ mục bằng: {embedder.name} ...")
    with connect() as conn:
        _print(reindex(conn, embedder))


def cmd_bootstrap(args) -> None:
    """Dùng khi khởi động container: tạo DB nếu chưa có, reindex nếu cần. An toàn khi chạy lại."""
    from .knowledge import check_embedding_provider, init_db, reindex

    embedder = get_embedder()
    with connect() as conn:
        print("init-db:", ", ".join(init_db(conn)))
        warning = check_embedding_provider(conn, embedder)
        if warning:
            print("reindex:", reindex(conn, embedder))
        else:
            print(f"Chỉ mục đã sẵn sàng ({embedder.name})")


def cmd_search(args) -> None:
    from .assistant import search, source_summary

    with connect() as conn:
        rows = search(conn, get_embedder(), args.query, args.top_k)
    _print([source_summary(r) for r in rows])


def cmd_ask(args) -> None:
    from .assistant import Assistant

    for event in Assistant().stream(args.question, args.role):
        if event["type"] == "meta":
            print(f"[Chế độ: {event['mode']} — {event['persona_reason']}]")
            for f in event["red_flags"]:
                print(f"🚨 {f['message']}")
            for s in event["sources"]:
                print(f"  • {s['organization']} {s['year']} — {s['title'][:90]} (tương đồng {s['similarity']:.2f})")
            print(f"[Fallback: {event['fallback']}]")
            for w in event["warnings"]:
                print(f"⚠️  {w}")
            print()
        elif event["type"] == "delta":
            sys.stdout.write(event["text"])
            sys.stdout.flush()
        else:
            print(f"\n\n[log_id={event['log_id']} model={event['model']}]")


def cmd_audit(args) -> None:
    from .knowledge import audit

    with connect() as conn:
        report = audit(conn)
    for r in report:
        status = "OK" if not r["schema_errors"] else f"{len(r['schema_errors'])} LỖI"
        print(f"[{status}] {r['protocol_title'][:80]}\n      nguồn: {r['source']} | chunks: {r['chunks']}")
        for e in r["schema_errors"]:
            print("      -", e)


def cmd_verify_citations(args) -> None:
    from .citations import verify_all

    with connect() as conn:
        results = verify_all(conn)
    bad = 0
    for r in results:
        icon = {"KHỚP": "✅", "SAI_LỆCH": "❌", "DOI_KHÔNG_TỒN_TẠI": "❌"}.get(r["status"], "⚠️")
        bad += icon != "✅"
        print(f"{icon} [{r['status']}] {r['organization_code']} {r['publication_year']} — {r['doi_or_pmid']}")
        print(f"     Trong DB : {r['document_title'][:110]}")
        if r.get("crossref_title"):
            print(f"     Crossref : {r['crossref_title'][:110]} ({r['crossref_year']}, {r['crossref_journal'][:50]})")
        print(f"     {r['detail']}")
    print(f"\nTổng: {len(results)} nguồn, {bad} nguồn cần bác sĩ xem lại.")


def cmd_eval(args) -> None:
    from .evaluation import evaluate, format_report

    with connect() as conn:
        report = evaluate(conn, get_embedder())
    print(format_report(report, show_failures=args.failures))


def cmd_ingest(args) -> None:
    from .knowledge import load_json, review, submit_for_review

    with connect() as conn:
        for path in args.files:
            try:
                review_id = submit_for_review(conn, load_json(path), submitted_by=args.by)
            except ValueError as exc:
                print(f"❌ {path}: {exc}")
                continue
            print(f"✅ {path} → hàng chờ duyệt: review_id={review_id}")
            if args.approve:
                pid = review(conn, get_embedder(), review_id, True, reviewer=args.by, note="Duyệt qua CLI")
                print(f"   Đã duyệt và nạp: protocol_id={pid}")


def cmd_extract(args) -> None:
    from pathlib import Path

    from .extractor import GuidelineExtractor
    from .knowledge import submit_for_review

    print(f"Claude đang đọc {args.file} (có thể mất vài phút)...")
    result = GuidelineExtractor().extract(args.file, args.hints)
    out = Path(args.out or f"data/extracted/{Path(args.file).stem}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    if result.document is not None:
        out.write_text(json.dumps(result.document, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Đã lưu: {out} (sau {result.attempts} lượt)")
    if not result.ok:
        print("❌ Chưa đạt schema 02:\n- " + "\n- ".join(result.errors))
        sys.exit(1)
    if not args.no_submit:
        with connect() as conn:
            rid = submit_for_review(conn, result.document, submitted_by=f"extractor:{args.by}")
        print(f"✅ Đã đưa vào hàng chờ duyệt: review_id={rid}")


def cmd_review(args) -> None:
    from .knowledge import review

    with connect() as conn:
        if args.action == "list":
            rows = conn.execute(
                """SELECT review_id, created_at, submitted_by, status,
                          payload->'protocol_core'->>'protocol_title' AS title
                   FROM knowledge_review_queue ORDER BY created_at DESC LIMIT 50"""
            ).fetchall()
            _print(rows)
        else:
            pid = review(conn, get_embedder(), args.review_id, args.action == "approve",
                         reviewer=args.by, note=args.note)
            print("Đã duyệt, protocol_id=" + str(pid) if pid else "Đã từ chối.")


def cmd_serve(args) -> None:
    import uvicorn

    uvicorn.run("dental_ai.api:app", host=args.host, port=args.port, reload=args.reload)


def main(argv: list[str] | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(prog="dental_ai", description="Nha Khoa AI — quản trị & hỏi đáp")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("init-db", help="Tạo bảng + nạp dữ liệu gốc (01, 05, 06, 07)")
    p.add_argument("--reset", action="store_true", help="XOÁ toàn bộ dữ liệu và tạo lại")
    p.set_defaults(func=cmd_init_db)

    sub.add_parser("reindex", help="Sinh chunk + embedding cho toàn bộ phác đồ").set_defaults(func=cmd_reindex)
    sub.add_parser("bootstrap", help="init-db + reindex nếu cần (dùng khi khởi động)").set_defaults(func=cmd_bootstrap)

    p = sub.add_parser("search", help="Tìm phác đồ liên quan (không gọi AI)")
    p.add_argument("query")
    p.add_argument("--top-k", type=int, default=5)
    p.set_defaults(func=cmd_search)

    p = sub.add_parser("ask", help="Hỏi đáp trên dòng lệnh")
    p.add_argument("question")
    p.add_argument("--role", choices=["auto", "doctor", "patient"], default="auto")
    p.set_defaults(func=cmd_ask)

    sub.add_parser("audit", help="Kiểm định dữ liệu theo schema 02").set_defaults(func=cmd_audit)

    p = sub.add_parser("eval", help="Chấm điểm chất lượng trên bộ câu hỏi evals/questions.jsonl")
    p.add_argument("--failures", action="store_true", help="Liệt kê các câu chưa đạt")
    p.set_defaults(func=cmd_eval)

    sub.add_parser("verify-citations", help="Đối chiếu DOI với Crossref").set_defaults(func=cmd_verify_citations)

    p = sub.add_parser("ingest", help="Nạp tài liệu JSON (schema 02) vào hàng chờ duyệt")
    p.add_argument("files", nargs="+", help="Một hoặc nhiều file JSON")
    p.add_argument("--by", default="cli")
    p.add_argument("--approve", action="store_true", help="Duyệt và nạp ngay (chỉ bác sĩ phụ trách)")
    p.set_defaults(func=cmd_ingest)

    p = sub.add_parser("extract", help="Claude bóc tách PDF/văn bản hướng dẫn → JSON schema 02 → hàng chờ duyệt")
    p.add_argument("file", help="File .pdf, .txt hoặc .md")
    p.add_argument("--hints", help="Gợi ý cho Claude, VD: 'Chỉ lấy phác đồ nâng xoang hở; tổ chức ITI 2023'")
    p.add_argument("--out", help="Nơi lưu JSON (mặc định data/extracted/<tên>.json)")
    p.add_argument("--by", default="cli")
    p.add_argument("--no-submit", action="store_true", help="Chỉ lưu JSON, không đưa vào hàng chờ")
    p.set_defaults(func=cmd_extract)

    p = sub.add_parser("review", help="Xem / duyệt / từ chối tài liệu chờ duyệt")
    p.add_argument("action", choices=["list", "approve", "reject"])
    p.add_argument("review_id", nargs="?")
    p.add_argument("--by", default="cli")
    p.add_argument("--note")
    p.set_defaults(func=cmd_review)

    p = sub.add_parser("serve", help="Chạy web server")
    p.add_argument("--host", default="0.0.0.0")
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--reload", action="store_true")
    p.set_defaults(func=cmd_serve)

    args = parser.parse_args(argv)
    if args.cmd == "review" and args.action != "list" and not args.review_id:
        parser.error("Cần review_id")
    get_settings()
    args.func(args)


if __name__ == "__main__":
    main()
