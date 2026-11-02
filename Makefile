.PHONY: install up down logs test reindex audit

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
