# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `https://github.com/MoulderT/TestW`
- **Ветка**: `main`
- **Время работы** (приблизительно): `6` часов

---

## Запуск

Соответствует разделам **Easy Start** и **Usual Start** в `README.md`.

### Easy Start (Windows)

1. Клонировать репозиторий:

   ```bash
   git clone https://github.com/MoulderT/TestW.git vasilev_a_i_test_task
   ```

2. В **`.env.example`** указать **`SIGNAL_LAB_SENTRY_DSN`** (и при необходимости остальное), сохранить как **`.env`** или скопировать файл вручную.

3. В корне проекта запустить **`run.bat`** (двойной клик). Скрипт при отсутствии `.env` копирует из `.env.example`, затем выполняет `docker compose up -d --build --wait`.

4. Проверка: **http://localhost:3000/** (сценарии в UI). **Grafana:** http://localhost:3010 — `admin` / `admin`.

5. Остановка: **`stop.bat`** (по умолчанию **`docker compose down -v`** — удаляется том БД).

### Usual Start (cmd / PowerShell / Git Bash)

1. Перейти в каталог проекта.

2. Скопировать **`.env.example` → `.env`:**

   - **cmd:** `copy .env.example .env`
   - **PowerShell:** `Copy-Item .env.example .env`
   - **Git Bash / WSL / Linux / macOS:** `cp .env.example .env`

3. Заполнить **`.env`** (в т.ч. **`SIGNAL_LAB_SENTRY_DSN`** для Sentry).

4. Поднять стек:

   ```bash
   docker compose up -d --build --wait
   ```

5. Проверить сервисы: `docker compose ps` (ожидаются **Up**, у postgres/api — **healthy** где применимо).

6. Остановка: **`stop.bat`** или вручную **`docker compose down -v`**; чтобы **сохранить** том PostgreSQL: **`docker compose down`** (без `-v`).

### Быстрая проверка с хоста

```bash
curl -sS http://localhost:3001/api/health
```

- UI: http://localhost:3000  
- API health: http://localhost:3001/api/health  
- Метрики: http://localhost:3001/metrics  
- Grafana: http://localhost:3010 (`admin` / `admin`)  
- Prometheus: http://localhost:9090  
- Loki (Grafana → Explore): запрос **`{app="signal-lab"}`** (см. README)

**Предусловия:** **Docker Desktop** (на Windows удобен WSL2-backend для Promtail), **Git**, **Compose v2** с поддержкой **`--wait`**. Локальная разработка без полного стека: **Node.js ≥ 20**, см. README. Секреты только в **`.env`**, не коммитить.

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ☑ | `apps/web/src/app/`, `apps/web/next.config.ts` |
| shadcn/ui | ☑ | `apps/web/src/components/ui/` |
| Tailwind CSS | ☑ | `apps/web/src/app/globals.css`, классы в `page.tsx` |
| TanStack Query | ☑ | `apps/web/src/app/providers.tsx`, `apps/web/src/app/page.tsx` |
| React Hook Form | ☑ | `apps/web/src/app/page.tsx` |
| NestJS | ☑ | `apps/api/src/` |
| PostgreSQL | ☑ | `docker-compose.yml` → сервис `postgres`, `DATABASE_URL` |
| Prisma | ☑ | `apps/api/prisma/schema.prisma`, миграции в `apps/api/prisma/migrations/` |
| Sentry | ☑ | `apps/api/src/main.ts`, `SIGNAL_LAB_SENTRY_DSN` в `.env` → в контейнер как `SENTRY_DSN` |
| Prometheus | ☑ | `infra/prometheus/prometheus.yml`, scrape `api:3001/metrics`, UI `:9090` |
| Grafana | ☑ | `infra/grafana/provisioning/`, дашборды `infra/grafana/dashboards/`, UI `:3010` |
| Loki | ☑ | `docker-compose.yml` → `loki`, сбор логов через `promtail` + `infra/promtail/` |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | Поднять стек (`docker compose up -d --build`). Открыть UI `http://localhost:3000`, запустить сценарии (**success**, **system_error** и т.д.) — чтобы счётчики и гистограмма изменились. | `http://localhost:3001/metrics` — искать `scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total`. Дополнительно: `http://localhost:9090` → вкладка **Graph** → запрос `scenario_runs_total` → **Execute**. |
| Grafana dashboard | То же: несколько запусков сценариев из UI за последние 15–30 минут. | `http://localhost:3010` (логин `admin` / `admin`) → **Dashboards** → **Signal Lab**; или `http://localhost:3000/grafana`. Должны быть ненулевые/живые панели (rate по типам, latency, error rate). |
| Loki log | Запустить любой сценарий из UI (например **success** или **system_error**), подождать ~10–20 с. | В Grafana: **Explore** → datasource **Loki** → запрос `{container=~".*api.*"}` или `|= "scenarioType"` за **Last 15 minutes** → **Run query**. Должны быть JSON-логи API со полями вроде `scenarioType` / `scenarioId`. |
| Sentry exception | В `.env` задан **`SIGNAL_LAB_SENTRY_DSN`**, контейнер `api` пересоздан после изменения (`docker compose up -d --force-recreate api`). В UI запустить **`system_error`** → Run. | `https://sentry.io` → проект кандидата → **Issues** — новое событие (ошибка вроде `Signal Lab: system_error scenario`), обычно в течение ~1 мин. Если DSN не настраивался — шаг пропускается, в коде инициализация в `apps/api/src/main.ts`. |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `signal-lab-observability` | Проверка и доработка цепочки Prometheus / Loki / Grafana / Sentry; чеклист при изменении сценариев и метрик. |
| 2 | `signal-lab-docker-workflow` | Подъём и отладка полного стека через Compose, порты, health, логи сервисов. |
| 3 | `signal-lab-scenarios` | Поток сценариев Nest (контроллер, сервис, Prisma, UI), инварианты PRD по следам в БД и observability. |

*(Отдельно: orchestrator — см. раздел **Orchestrator**.)*

### Commands

| # | Command (файл в `.cursor/commands/`) | Что делает |
|---|---------|-----------|
| 1 | `verify-observability.md` | Полная ручная цепочка: compose → UI → `/metrics` → Loki → Grafana → Sentry; отчёт OK/FAIL. |
| 2 | `check-obs.md` | Короткая проверка той же цепочки по README. |
| 3 | `bootstrap-feature.md` | Новая фича по PRD: чтение `prds/`, сверка со stack rules, план, инкрементальная реализация. |
| 4 | `submission-checklist.md` | Проход по `SUBMISSION_CHECKLIST.md` и `RUBRIC.md` перед сдачей. |
| 5 | `add-endpoint.md` | Добавление Nest endpoint с логами, метриками, Swagger по конвенциям репо. |
| 6 | `run-prd.md` | Запуск пайплайна по PRD через orchestrator skill и опционально `.execution/.../context.json`. |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `beforeShellExecution` → `hooks/guard-shell.mjs` | Блокирует разрушительные shell-команды (например `docker compose down -v`, `docker system prune`) до выполнения. |
| 2 | `beforeReadFile` → `hooks/guard-env-read.mjs` | Не подставляет в контекст модели содержимое секретных `.env` (кроме `.env.example` и аналогов). |

*(Конфигурация: `.cursor/hooks.json`.)*

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `signal-lab-stack.mdc` | Обязательный стек Signal Lab, `alwaysApply`. |
| 2 | `nestjs-backend.mdc` | Конвенции NestJS, модули, observability на API. |
| 3 | `nextjs-frontend.mdc` | Next.js, shadcn, TanStack Query, RHF. |
| 4 | `prisma-docker.mdc` | Prisma, миграции, Docker Compose, секреты. |
| 5 | `observability-conventions.mdc` | Имена метрик, логи, Sentry. |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | PostgreSQL / SQL | Миграции Prisma, схемы, диагностические запросы без анти-паттернов. |
| 2 | Docker / Compose | Сервисы, сети, healthcheck, единый `docker compose up`. |
| 3 | Prometheus / Grafana | PromQL, панели под демо-метрики. |
| 4 | Structured logging (JSON) | Поля логов и labels под Loki. |
| 5 | Sentry SDK (Node) | Nest, контекст событий, PII. |
| 6 | Next.js App Router | Маршруты, RSC/клиент, связка с TanStack Query. |

*(Список и инструкция подключения: `.cursor/marketplace-skills.md` → Remote GitHub в Cursor Settings.)*

**Что закрыли custom skills, чего нет в marketplace:**

- **Signal Lab–специфика**: сценарии `ScenarioRun`, готовый compose-стек, связка UI ↔ `/api/scenarios/run`, PRD-оркестратор с `.execution/context.json` — это в репозитории как **custom** skills/commands/rules; marketplace даёт общие практики (SQL, Docker, Prom/Grafana, логи, Sentry, Next).

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/<timestamp>/context.json` (например `.execution/2026-04-19-1430/context.json`)
- **Сколько фаз**: **7** (PRD Analysis → Codebase Scan → Planning → Decomposition → Implementation → Review → Report)
- **Какие задачи для fast model**: в декомпозиции помечать **`model: fast`** для низкой сложности, узкого контекста (1–3 файла), без риска нарушить стек — по смыслу PRD 004 и таблицы фаз в skill.
- **Поддерживает resume**: **да** — при повторном запуске читать существующий `context.json`, не переделывать завершённые фазы, продолжать с `currentPhase` и незавершённых задач.

---

## Скриншоты / видео

- [ ] UI приложения
- [ ] Grafana dashboard с данными
- [ ] Loki logs
- [ ] Sentry error

(Приложи файлы или ссылки ниже)

---

## Что не успел и что сделал бы первым при +4 часах

*Опционально заполни перед сдачей.* Пример: «Критичные пункты ТЗ закрыты; при +4ч — e2e на сценарии, алерт в Grafana, доработка Promtail под Windows.»


