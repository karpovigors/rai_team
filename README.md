# rai_team

## Information and Navigation Platform for People with Hearing Impairments

This project is an information and navigation platform designed specifically for people with hearing impairments.

## Authentication System

The platform includes a JWT-based authentication system with the following features:

- User registration with username
- User login with username and password
- Secure token-based authentication

### Backend (Django)

The authentication system is implemented in the `accounts` app. For detailed information about the API endpoints and testing instructions, see [accounts/README.md](rai_project/accounts/README.md).

### Frontend (React)

The frontend includes authentication pages:
- Login page: [AuthPage](client/src/pages/AuthPage/ui/AuthPage.tsx)
- Registration page: [RegisterPage](client/src/pages/AuthPage/ui/RegisterPage.tsx)

## Setup

1. Install backend dependencies:
   ```bash
   cd rai_project
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
   cd rai_project
   python manage.py runserver
   
   # Frontend
   cd client
   npm run dev
   ```

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
