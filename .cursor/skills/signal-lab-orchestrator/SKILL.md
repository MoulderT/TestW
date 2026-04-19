---
name: signal-lab-orchestrator
description: Runs PRD 004-style pipeline: analysis, plan, atomic tasks, fast vs default model hints, optional context file under .execution/. Use when implementing a PRD file, resuming after stop, or minimizing main-chat tokens.
disable-model-invocation: true
---

# Signal Lab — orchestrator (PRD 004)

## Когда вызывать

`/signal-lab-orchestrator` или запрос разбить работу по [PRD 004](prds/004_prd-orchestrator.md).

## Фазы (ориентир)

| # | Фаза | Назначение |
|---|------|------------|
| 1 | PRD Analysis | Требования, ограничения, риски |
| 2 | Codebase Scan | Структура репо (explore / чтение путей) |
| 3 | Planning | Порядок работ |
| 4 | Decomposition | Атомарные задачи + зависимости |
| 5 | Implementation | Пакетами по графу задач |
| 6 | Review | Проверка против PRD и RUBRIC |
| 7 | Report | Итог, failed, next steps |

## Состояние (resume)

Для долгих прогонов создай рабочую директорию и файл состояния:

- Каталог: `.execution/<timestamp>/` (ISO-подобная метка, например `2026-04-19-1430`).
- Файл: `context.json` — структура как в PRD 004 (поля `executionId`, `prdPath`, `status`, `currentPhase`, `phases`, `tasks`, опционально `signal`).

При повторном запуске: **прочитай существующий `context.json`**, не переделывай завершённые фазы, продолжай с `currentPhase` и незавершённых `tasks`.

## Выход в чат (каждый запуск)

1. **Goal** — одна фраза.  
2. **Constraints** — стек из `signal-lab-stack`, ссылки на PRD.  
3. **Task list** — 4–12 задач; у каждой: `id`, **Input context** (1–3 файла), **Done when**, **model**: `fast` | `default`, **complexity**: low | medium | high.  
4. **Delegation** — какие задачи вынести в отдельные сессии / subagent.  
5. **context.json snippet** — минимальный JSON для сохранения в `.execution/.../context.json` (если пользователь ведёт state).

## Правила

- Не выполняй всю реализацию в одном ответе, если не попросили; фокус — план и декомпозиция.
- Для задач с метриками/логами/Sentry опирайся на skill `signal-lab-observability`.
