# \*\*MiniSocial is a small social media demo app with:

- FastAPI (Backend API)
- Auth (JWT)
- Posts CRUD (owner protected)
- Image upload with validation
- Likes + Comments
- SQLite + Alembic migrations
- Vue 3 + Tailwind
- E2E Testing with Playwright
- Docker Compose setup\*\*

## Feed Public

![Public Feed](./docs/screenshots/feed-public.png)

## Login

![Login](./docs/screenshots/login.png)

## Register

![Register](./docs/screenshots/register.png)

## Feed auth

![Feed (eingeloggt)](./docs/screenshots/feed-auth.png)

## Profile

![Profilseite](./docs/screenshots/profile.png)

## Swaager

![Swagger](./docs/screenshots/Swagger-docs.png)

## Docker

![Docker](./docs/screenshots/docker.png)

MiniSocial ist eine moderne Full-Stack Social-Media-Webanwendung mit Benutzerregistrierung, Authentifizierung, Posts, Bild-Upload, Likes, Kommentaren und Profilseiten.

![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)
![Vue](https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Playwright](https://img.shields.io/badge/Tests-Playwright-45ba4b?logo=playwright)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

MiniSocial ist eine moderne **Full-Stack Social Media Web Application**, entwickelt mit:

- ⚡ FastAPI (Backend API)
- 🎨 Vue 3 + TailwindCSS (Frontend)
- 🔐 JWT Authentication
- 🗄 SQLite + Alembic Migrationen
- 🐳 Docker Compose Setup
- 🧪 E2E Testing mit Playwright

Das Projekt demonstriert professionelle Architektur, saubere Trennung von Backend & Frontend sowie produktionsnahe Deployment-Strukturen.

---

# ✨ Features

## 🔐 Authentication

- Benutzerregistrierung
- Login
- JWT Access Token
- Protected API Endpoints
- Route Guards im Frontend
- `/auth/me` User Endpoint

---

## 📝 Posts

- Post erstellen
- Post bearbeiten (Owner only)
- Post löschen (Owner only)
- Bild-Upload mit Validierung
- Pagination im Feed
- Public Feed (Read-only)

---

## ❤️ Likes

- Like / Unlike
- Live Like Count
- `liked_by_me` Flag
- Protected Actions

---

## 💬 Comments

- Kommentar hinzufügen
- Kommentar löschen (Owner)
- Kommentar-Anzahl
- Kommentar-Preview im Profil

---

## 👤 Profile Page

- Benutzerprofil
- Initialen-Avatar
- Statistiken:
  - Anzahl Posts
  - Erhaltene Likes
  - Erhaltene Kommentare
- Eigene Posts verwalten

---

## 🎨 UI

- Modernes TailwindCSS Design
- Card Layout
- Toast Notifications
- Confirm Modal
- Responsive Layout

---

# 🛠 Tech Stack

## Backend

- FastAPI
- SQLAlchemy ORM
- Alembic Migrationen
- SQLite
- Pydantic
- JWT (HS256)
- Uvicorn

## Frontend

- Vue 3 (Composition API)
- Vue Router
- Axios
- TailwindCSS
- Custom Toast System
- Nginx (Production)

## Testing

- Playwright E2E Tests
- Auth Flow Tests
- CRUD Tests
- Likes & Comments Tests

## DevOps

- Docker
- Docker Compose
- Multi-Stage Build
- Production-ready Setup

---

# 📦 Projektstruktur

```
minisocial/
├── backend/
│   ├── alembic/
│   ├── alembic.ini
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── main.py
│   ├── data/
│   ├── uploads/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── router/
│   │   ├── services/
│   │   ├── ui/
│   │   ├── utils/
│   │   ├── views/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── tests/e2e/
│   │   ├── api/
│   │   ├── helpers/
│   │   ├── pages/
│   │   └── specs/
│   ├── playwright.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   └── screenshots/ # Screenshots für README
│
├── docker-compose.yml
└── README.md
```

---

## 🌍 Live Demo

Frontend: https://containerized-minisocial-fastapi-vu.vercel.app  
Backend (Swagger): https://minisocial-backend-n4ut.onrender.com/docs

> Hinweis: Die Live-Demo nutzt kostenloses Hosting. SQLite-Daten und Uploads können bei Redeploy/Restart zurückgesetzt werden.

---

## 🐳 Run with Docker

### Voraussetzungen

- Docker
- Docker Compose

### Starten

```bash
docker compose up --build
```

> Migrationen laufen automatisch beim Start des Backend-Containers.

### URLs

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

---

## 🧪 Tests

### Voraussetzungen (einmalig)

```bash
cd frontend
npm install
npm i -D @playwright/test cross-env
npx playwright install
```

### Tests ausführen

#### 1) Docker starten (im Projekt-Root)

```bash
docker compose up --build
```

#### 2) E2E (UI) Tests (im `frontend/`)

```bash
cd frontend
npm run test:e2e
```

#### 3) API Tests (im `frontend/`)

```bash
cd frontend
npm run test:api
```

### Was wird getestet?

#### ✅ E2E (UI)

- Routing
- Register
- Login
- Posts erstellen
- Kommentare hinzufügen & löschen
- Profilseite öffnen

#### ✅ API

- Auth: `register → login → /auth/me`
- Posts: `create → list → update → delete`

---

# 🔐 API Endpoints

## Auth

```
POST /auth/register
POST /auth/login
GET  /auth/me
```

## Posts

```
GET    /posts
GET    /posts/me-feed
POST   /posts
PUT    /posts/{id}
DELETE /posts/{id}
```

## Likes

```
POST   /posts/{id}/like
DELETE /posts/{id}/like
```

## Comments

```
GET    /posts/{id}/comments
POST   /posts/{id}/comments
DELETE /posts/comments/{id}
```

## Users

```
GET /users/{id}
GET /users/{id}/posts
```

---

# 🎯 Architektur Highlights

- Saubere REST Struktur
- Owner-based Access Control
- Stateless JWT Authentication
- Pagination Support
- File Upload Handling
- Migration-basierte Datenbankverwaltung
- Docker Production Build
- E2E Testing

---
