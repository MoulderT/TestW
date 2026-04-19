# Запуск реализации по PRD

1. Укажи номер PRD или путь: `prds/00X_*.md`.
2. Вызови skill **`signal-lab-orchestrator`** (`/signal-lab-orchestrator`): получи план, фазы и список атомарных задач.
3. Выполняй задачи по очереди; по PRD 004 при длительной работе веди состояние в `.execution/<id>/context.json` (см. skill).
4. После каждой крупной задачи — прогон проверки из `check-obs` или README.
