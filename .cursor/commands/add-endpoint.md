# Добавить NestJS endpoint с observability

1. Прочитай `.cursor/rules/nestjs-backend.mdc` и `observability-conventions.mdc`.
2. Создай модуль/DTO по существующему стилю (`Scenario*` как образец).
3. Обязательно: лог (Pino) на вход/ошибку, метрики если меняется поведение сценариев, Swagger-декораторы если в проекте включён Swagger.
4. Обнови тесты или e2e, если затронут health/контракт.
