---
name: signal-lab-scenarios
description: Implements and reviews NestJS scenario flow (POST scenarios, persistence, observability side effects). Use when working on scenario controller/service, Prisma models for runs, or UI that triggers scenarios.
---

# Signal Lab — сценарии

## Поток

1. UI отправляет выбор сценария (RHF + TanStack Query).
2. `POST /api/scenarios` (или согласованный путь в проекте) принимает DTO.
3. `ScenarioService` выполняет сценарий: пишет в БД, инкрементирует метрики, логирует, при ошибке — Sentry.

## Инварианты

- Каждый сценарий должен оставлять след в истории (Prisma), если это заложено в PRD.
- Не смешивать бизнес-логику сценария с HTTP-адаптером — сервис отдельно.

## Именование

Сценарии из демо (например `system_error`) — стабильные строковые id для UI и тестов проверки.
