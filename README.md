# RD Tech Innovation Task

Full‑stack demo application:

- **Backend**: Django + Django REST Framework (JWT auth via SimpleJWT)
- **Frontend**: Next.js (App Router) + Tailwind + Chart.js

It includes modules for **Dashboard**, **Invoices**, **CSV upload/processing**, **Search**, and **RBAC scaffolding**.

## Features

- **Auth**: JWT token endpoint (`/api/auth/token/`) and refresh (`/api/auth/token/refresh/`)
- **Dashboard**: charts + recent activity
- **Invoices**: list, detail, create invoice with line items
- **Upload CSV**: upload CSV and view processed rows
- **Search**: query/filter records
- **API docs**: Swagger UI (`/api/docs/`) and OpenAPI schema (`/api/schema/`)

## Project structure

- `backend/`: Django project (API)
- `frontend/`: Next.js web app (UI)
- `.env.example`: backend environment template
- `frontend/.env.local.example`: frontend environment template

## Prerequisites

- **Python** (recommended: use the existing `backend/.venv` if present)
- **Node.js + npm**

## Setup (first time)

### 1) Create environment files

In the repo root:

- Copy `.env.example` → `.env`

In `frontend/`:

- Copy `frontend/.env.local.example` → `frontend/.env.local`

### 2) Install dependencies

Backend:

```bash
cd backend
.\.venv\Scripts\python -m pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
```

### 3) Database + migrations

This backend is configured to use **SQLite automatically in development** (when `DJANGO_DEBUG=true`), so you can run locally without Postgres.

```bash
cd backend
.\.venv\Scripts\python manage.py migrate
.\.venv\Scripts\python manage.py collectstatic --noinput
```

## Run the project

### Backend (Django)

```bash
cd backend
.\.venv\Scripts\python manage.py runserver 0.0.0.0:8000
```

- **API base**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/api/docs/`

### Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- **Web app**: `http://localhost:3000`

## Default login (local dev)

The frontend sign-in page requests a JWT from the backend.

- **URL**: `http://localhost:3000/auth`
- **Username**: `admin`
- **Password**: `admin123`

If you don’t have that user yet, create/update it:

```bash
cd backend
.\.venv\Scripts\python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings'); import django; django.setup(); from django.contrib.auth import get_user_model; User=get_user_model(); u,_=User.objects.get_or_create(username='admin', defaults={'email':'admin@example.com','is_staff':True,'is_superuser':True,'is_active':True}); u.is_staff=True; u.is_superuser=True; u.is_active=True; u.set_password('admin123'); u.save(); print('admin ready')"
```

## Notes

- **Secrets**: `.env` is intentionally ignored by git. Use `.env.example` as the template.
- **Dev API access**: for local development, some endpoints may be opened when `DJANGO_DEBUG=true` to make the demo easier to run.