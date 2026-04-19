---
name: signal-lab-observability
description: Verifies and extends Signal Lab observability (Prometheus metrics, Loki logs, Grafana dashboards, Sentry errors). Use when editing scenarios, metrics, logging, tracing, docker-compose observability services, or debugging missing signals in Grafana/Loki/Sentry.
---

# Signal Lab — observability

## Цель

Метрики, логи и ошибки должны быть проверяемы руками по сценарию из `test_work.md` (UI → API → PG + Prometheus + Loki + Sentry + Grafana).

## Чеклист при изменении сценария

1. **Prometheus** — счётчики/гистограммы обновлены в Nest; endpoint `/metrics` доступен с хоста как в compose.
2. **Loki** — логи в JSON или согласованном формате; labels не ломают запросы в Grafana.
3. **Sentry** — исключения из сценария доходят до Sentry (DSN из env, не хардкод).
4. **Grafana** — дашборд provisioned или JSON в репо; панели ссылаются на реальные datasource UID.

## Порты (ориентир из задания)

Сверяй с актуальным `docker-compose.yml`: Next ~3000, metrics ~3001, Grafana/Loki — как в файле.

## Чего не делать

- Не отключать observability «временно» без явного TODO и issue.
- Не писать секреты DSN в код.
