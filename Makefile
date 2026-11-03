.PHONY: install up down logs test reindex audit drafts

install:            ## Cài thư viện Python (chạy không dùng Docker)
	python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt

up:                 ## Chạy bằng Docker
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f app

test:
	.venv/bin/python -m pytest -q

reindex:
	docker compose exec app python -m dental_ai reindex

audit:
	docker compose exec app python -m dental_ai audit

drafts:             ## Gửi toàn bộ bản nháp tri thức vào hàng chờ bác sĩ duyệt (/admin)
	docker compose exec app sh -c 'python -m dental_ai ingest data/knowledge_drafts/*.json --by "make drafts"'
