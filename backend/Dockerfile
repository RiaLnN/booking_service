FROM python:3

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x backend/entrypoint.sh

EXPOSE 8000

CMD ["/backend/entrypoint.sh"]