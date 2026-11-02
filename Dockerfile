FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY dental_ai ./dental_ai
COPY db ./db
COPY schemas ./schemas
COPY prompts ./prompts
COPY data ./data

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["sh", "-c", "python -m dental_ai bootstrap && python -m dental_ai serve --host 0.0.0.0 --port 8000"]
