---
name: signal-lab-docker-workflow
description: Brings up and validates the full Signal Lab stack with Docker Compose. Use when the user asks to run, debug, or verify docker compose, ports, healthchecks, or one-command startup.
---

# Signal Lab — Docker workflow

## Одна команда

Из корня репозитория (после появления `docker-compose.yml`):

```bash
docker compose up -d
```

## Проверка

1. `docker compose ps` — все сервисы healthy или Up.
2. UI: `http://localhost:3000` (или порт из compose).
3. API metrics: путь из задания (например `http://localhost:3001/metrics`).
4. Loki/Grafana — URL из README проекта.

## Если что-то не поднимается

- Логи: `docker compose logs <service> --tail 100`.
- Конфликт портов — измени только в compose + документации, не разъезжайся по дефолтам в коде без env.
