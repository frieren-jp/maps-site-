# Route Finder (OpenStreetMap + React + Express + PostgreSQL)

Проект для поиска и публикации маршрутов с несколькими точками, комментариями, рейтингом и фото.

## 1. Стек

- Frontend: React, TypeScript, Vite, styled-components, Leaflet
- Backend: Node.js, Express, TypeScript, PostgreSQL
- Auth: JWT + тестовый вход `admin/admin`
- Карта и роутинг: OpenStreetMap + OSRM (бесплатно)

## 2. Что нужно установить

1. Node.js (рекомендуется LTS 20+)
2. npm
3. PostgreSQL (желательно) + pgAdmin

Проверка:
```bash
node -v
npm -v
```

## 3. Настройка `.env`

### Backend (`backend/.env`)

Скопируй из `backend/.env.example` и проверь:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET=replace_with_random_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Сгенерировать безопасный `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`frontend/.env`)

Скопируй из `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_OSRM_API_URL=https://router.project-osrm.org
```

## 4. Настройка базы данных (рекомендуется)

1. Запусти PostgreSQL.
2. Открой базу в pgAdmin.
3. Выполни SQL из файла [backend/src/db.sql](/C:/Users/freezemyself/Desktop/project/backend/src/db.sql).

Примечание: backend умеет fallback-режим при проблемах с БД, но для нормального хранения данных PostgreSQL должен работать.

## 5. Установка зависимостей

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 6. Запуск проекта

### Вариант A: одной командой (рекомендуется)

Из корня проекта:
```powershell
.\start-all.ps1
```

Быстрый запуск без проверки/установки зависимостей:
```powershell
.\start-all.ps1 -SkipInstall
```

Остановить backend + frontend одной командой:
```powershell
.\stop-all.ps1
```

Если PowerShell блокирует скрипт (`ExecutionPolicy`):
```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

Для остановки при `ExecutionPolicy`:
```powershell
powershell -ExecutionPolicy Bypass -File .\stop-all.ps1
```

Что делает `start-all.ps1`:
1. Создает `.env` из `.env.example`, если файла нет.
2. Ставит зависимости (если нет `node_modules`).
3. Открывает 2 окна: backend и frontend.

### Вариант B: вручную в 2 терминалах

Терминал 1:
```bash
cd backend
npm run dev
```

Терминал 2:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

## 7. Проверка, что все работает

- Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Backend health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 8. Тестовый вход

- login: `admin`
- password: `admin`

## 9. Тесты

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

## 10. Ошибки и решения

### Ошибка `EADDRINUSE` (порт занят)

Проверить:
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

Завершить процесс:
```bash
taskkill /PID <PID> /F
```

### Frontend не открывается

1. Проверь, что frontend-процесс запущен.
2. Открой `http://127.0.0.1:5173`.
3. Проверь, что порт 5173 свободен.

### Backend не стартует из-за БД

1. Убедись, что PostgreSQL запущен.
2. Проверь `DATABASE_URL` в `backend/.env`.
3. Проверь доступ к базе через pgAdmin.
4. Повторно выполни `backend/src/db.sql`.

### Ошибка авторизации/token

1. Убедись, что в `backend/.env` есть непустой `JWT_SECRET`.
2. После изменения `JWT_SECRET` перезапусти backend.

### Ошибка установки npm-пакетов

В проблемной папке:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Карта есть, маршрут по дорогам не строится

Это обычно временная недоступность OSRM endpoint.  
Приложение автоматически рисует маршрут прямой линией по точкам (fallback).

## 11. Полезные команды

Остановить backend по порту:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Остановить frontend по порту:
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## 12. Структура проекта

- `backend/` — API и работа с БД
- `frontend/` — UI и карта
- `start-all.ps1` — запуск всего проекта одной командой
- `stop-all.ps1` — остановка backend/frontend одной командой
