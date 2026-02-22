# rai_team

## Information and Navigation Platform for People with Hearing Impairments

This project is an information and navigation platform designed specifically for people with hearing impairments.

## Authentication System

The platform includes a JWT-based authentication system with the following features:

- User registration with username
- User login with username and password
- Secure token-based authentication

### Backend (Django)

The authentication system is implemented in the `accounts` app. For detailed information about the API endpoints and testing instructions, see [accounts/README.md](backend/accounts/README.md).

### Frontend (React)

The frontend includes authentication pages:
- Login page: [AuthPage](client/src/pages/AuthPage/ui/AuthPage.tsx)
- Registration page: [RegisterPage](client/src/pages/AuthPage/ui/RegisterPage.tsx)

## Setup

### Быстрый запуск (рекомендуется, Docker)

```bash
make dev
```

Откройте:

- `http://localhost/` — frontend (основной интерфейс)
- `http://localhost/admin` — Django admin
- `http://localhost/api/health` или тестовый backend endpoint (если добавлен в проекте) — проверка backend

Если изменялась схема БД:

```bash
docker compose exec backend python manage.py migrate
```

Если нужно заново заполнить базу начальными данными:

```bash
docker compose exec backend python manage.py seed_mock_data
```

### Локальный запуск (без Docker)

1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Run the development servers:
   ```bash
   # Backend
   cd backend
   python manage.py runserver
   
   # Frontend
   cd client
   npm run dev
   ```

## Что реализовано по критериям (кодовая часть)

- `Функциональность`:
  - каталог объектов, карточка объекта, отзывы/рейтинг
  - карта объектов и переход к маршруту
  - авторизация/регистрация/профиль
  - модерация: добавление/редактирование объектов, удаление отзывов
  - push-уведомления (подписка/тест для модератора)
  - отдельная страница обучения и советов (`/learning`)
- `Надежность`:
  - idempotent seed-данные (`update_or_create`, `get_or_create`)
  - автосоздание S3 bucket (через compose init-сервис)
  - fallback для отсутствующих изображений в UI
- `Адаптивность`:
  - мобильная верстка основных страниц
  - исправлено перетаскивание кадрирования аватара на touch-устройствах (pointer events)
- `Качество кода / Архитектура`:
  - модульная структура frontend по страницам/секциям/hooks/api
  - backend разделен на apps (`accounts`, `core`)
  - добавлены комментарии в ключевые сложные места (seed, кадрирование аватара, accessibility)

Примечание: критерии `Презентация` и часть `Инновационность` оцениваются не только кодом, но и качеством демонстрации проекта.

## Push-уведомления и сервис подписок (MVP)

Реализован базовый сервис подписок и push-уведомлений:

- подписка/отписка пользователя от Web Push
- отправка уведомлений по типам:
  - `new_place` — новые заведения
  - `route_opening` — открытия маршрутов
  - `event` — предстоящие события
  - `discount` — скидки
  - `general` — общее уведомление
- тестовая рассылка из интерфейса профиля (для модератора)

### Переменные окружения

Добавьте в `.env`:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (например, `mailto:admin@example.com`)

Шаблон уже обновлен в [`.env.example`](.env.example).

### Генерация VAPID-ключей

Пример генерации:

```bash
npx web-push generate-vapid-keys
```

Полученные ключи вставьте в `.env`.

### Backend API

- `GET /api/push/public-key` — публичный VAPID-ключ
- `GET /api/push/subscriptions` — список подписок текущего пользователя
- `POST /api/push/subscriptions` — сохранить подписку браузера
- `DELETE /api/push/subscriptions` — удалить подписку по `endpoint`
- `POST /api/push/notify` — отправка push всем подписчикам (только модератор)

### Frontend

- Service Worker: [`client/public/sw.js`](client/public/sw.js)
- клиент push-подписок: [`client/src/services/pushService.ts`](client/src/services/pushService.ts)
- UI управления подпиской: [`client/src/pages/ProfilePage/ui/ProfilePage.tsx`](client/src/pages/ProfilePage/ui/ProfilePage.tsx)
