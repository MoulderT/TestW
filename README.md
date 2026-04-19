# Signal Lab

Краткая инструкция по запуску и проверке.

---

## Easy Start

1. **Клонировать репозиторий** (одна команда — создаётся папка `vasilev_a_i_test_task`):

   ```bash
   git clone https://github.com/MoulderT/TestW.git vasilev_a_i_test_task
   ```

2. В **`.env.example`** указать ваш **DSN Sentry** (и при необходимости остальные переменные), затем сохранить как **`.env`** — либо вручную скопировать файл и переименовать.

3. Запустить **`run.bat`** в корне проекта (двойной клик).

4. Открыть в браузере: **http://localhost:3000/** и пройти проверку сценариев.

5. Остановить стек: **`stop.bat`** в корне проекта (по умолчанию с удалением тома БД: `docker compose down -v`).

**Grafana:** вход по умолчанию — `admin` / `admin`.

---

## Usual Start

1. Перейти в папку проекта.

2. **Скопировать `.env.example` → `.env`:**

   | Среда | Команда |
   |--------|---------|
   | **cmd** | `copy .env.example .env` |
   | **PowerShell** | `Copy-Item .env.example .env` |
   | **Git Bash / WSL / Linux / macOS** | `cp .env.example .env` |

3. В **`.env`** при необходимости указать DSN Sentry и другие переменные.

4. Запустить контейнеры:

   ```bash
   docker compose up -d --build --wait
   ```

5. Открыть **http://localhost:3000/** и выполнить проверку.

6. **Grafana:** `admin` / `admin` (значения по умолчанию).

7. Остановить стек: **`stop.bat`** по умолчанию выполняет `docker compose down -v` (удаляет и том БД). Вручную: `docker compose down -v` или, чтобы **сохранить** том PostgreSQL: `docker compose down`.

---

## Полезные URL

| Что | Адрес |
|-----|--------|
| UI | http://localhost:3000 |
| API health | http://localhost:3001/api/health |
| Метрики | http://localhost:3001/metrics |
| Grafana | http://localhost:3010 |
| Loki (Explore) | После выбора datasource **Loki**: запрос **`{app="signal-lab"}`** |
