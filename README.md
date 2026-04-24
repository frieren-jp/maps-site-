# Веб-приложение поиска маршрутов

## Описание
Современное веб-приложение для поиска и публикации маршрутов с интеграцией Google Maps, поддержкой сложных маршрутов, авторизацией и хранением данных на PostgreSQL.

## Технологии
- Frontend: React, TypeScript, Styled Components, React Router
- Backend: Node.js, Express, TypeScript, PostgreSQL
- Авторизация: JWT + тестовый аккаунт admin/admin
- Интеграция: Google Maps API
- Тесты: Jest, React Testing Library

## Запуск проекта

### 1. Клонируйте репозиторий
```
git clone <repo-url>
cd project
```

### 2. Получите Google Maps API ключ
- Перейдите на https://console.cloud.google.com/
- Создайте проект и получите API ключ для Google Maps JavaScript API
- Добавьте ключ в .env файлы frontend и backend (см. примеры в .env.example)

### 3. Установите зависимости и настройте окружение
#### Backend
```
cd backend
npm install
cp .env.example .env
# Укажите параметры подключения к PostgreSQL и Google API ключ
```
#### Frontend
```
cd ../frontend
npm install
cp .env.example .env
# Вставьте Google API ключ
```

### 4. Запустите приложения
#### Backend
```
npm run dev
```
#### Frontend
```
npm start
```

### 5. Миграции базы данных
Выполните SQL-скрипт из backend/src/db.sql через pgAdmin или psql для создания таблиц.

### 6. Тестовый аккаунт
- login: admin
- password: admin

### 7. Тестирование
#### Backend
```
cd backend
npm test
```
#### Frontend
```
cd frontend
npm test
```

### 8. Интеграция Google Maps
Добавьте ваш Google Maps API ключ в .env файлов frontend и backend.
В интерфейсе будет отображаться карта маршрута (MapView).

## Структура монорепозитория
- backend — серверная часть (Express, PostgreSQL)
- frontend — клиентская часть (React)

## Примечания
- Все данные хранятся локально
- Для теста можно использовать встроенный аккаунт admin/admin
- Для работы с БД используйте pgAdmin
- Минималистичный дизайн, pastel-цвета
