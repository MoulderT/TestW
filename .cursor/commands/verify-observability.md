# Проверка observability (Signal Lab)

Проведи ручную проверку цепочки из `test_work.md`:

1. Убедись, что `docker compose up -d` поднял все сервисы.
2. Открой UI, запусти сценарий с ошибкой (например system_error), если он уже есть в приложении.
3. Проверь рост метрик на endpoint `/metrics` (порт из README).
4. Найди лог в Loki (URL/порт из README).
5. Открой Grafana dashboard (через UI прокси или порт из compose) и убедись, что сигнал виден.
6. Проверь событие в Sentry.

Выведи краткий отчёт: шаг → OK/FAIL → что смотреть при FAIL.
