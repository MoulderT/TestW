# Marketplace / remote skills (апрель 2026)

Подключение: **Cursor Settings → Rules → Project Rules → Add rule → Remote (GitHub)** (см. [документацию Skills](https://cursor.com/docs/skills.md)).

Ниже — **6 рекомендуемых** внешних skill-пакетов для Signal Lab: что дают и зачем включать. Конкретный URL бери из каталога [agentskills.io](https://agentskills.io/) или из README выбранного репозитория (формат: репозиторий с `SKILL.md` в подпапке skill).

| # | Тема | Зачем для Signal Lab |
|---|------|----------------------|
| 1 | **PostgreSQL / SQL** | Схемы, индексы, миграции Prisma и сырые диагностические запросы без анти-паттернов. |
| 2 | **Docker / Compose** | Сервисы, сети, healthcheck, порты для единого `docker compose up`. |
| 3 | **Prometheus / Grafana** | Запросы PromQL, панели и алерты под демо-метрики. |
| 4 | **Structured logging (JSON)** | Поля логов и labels под Loki. |
| 5 | **Sentry SDK (Node)** | Интеграция Nest, контекст событий, фильтрация PII. |
| 6 | **Next.js App Router** | Маршруты, сервер/клиент компоненты, вызовы API в связке с TanStack Query. |

После добавления в настройках убедись, что skills видны в списке Agent (раздел Rules → Skills).
