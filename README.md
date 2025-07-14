# Bets Fastify API


### 1. Клонирование и установка зависимостей

```bash
git clone <repo_url>
yarn install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта со следующим содержимым:

```
API_BASE_URL=https://your-api-url.com
APP_JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://postgres:123@localhost:5432/postgres-fastify-test
HMAC_SECRET_KEY=your_hmac_secret
ACCESS_TOKEN_TTL=1h
```

### 3. Запуск PostgreSQL через Docker

```bash
docker-compose up -d
```

### 4. Миграции и сидирование базы данных

```bash
yarn dbr
```
или вручную:
```bash
yarn prisma db push --force-reset
yarn seed
```

### 5. Сборка и запуск приложения

  ```bash
  yarn dev
  ```

## Документация API

Swagger UI доступен по адресу: [http://localhost:8080/docs](http://localhost:8080/docs)



## Поток взаимодействия
Каждый запрос (кроме /health и /docs) должен содержать заголовки user-id и x-signature, подпись создается на основе тела запроса и секретного ключа пользователя.
При успешной аутентификации сервер отправляет токен, он имеет срок действия 1 час

## Архитектура
Архитектура модульная, с четким разделением между слоями и возможностью горизонтального масштабирования




