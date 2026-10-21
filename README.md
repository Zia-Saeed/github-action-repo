# Todo App (Node.js + Docker)

Simple todo app with a **separate frontend and backend**, each with its own Dockerfile.

## Structure

| Path | Description |
|---|---|
| `backend/` | Node.js + Express REST API, persists todos to a JSON file |
| `backend/Dockerfile` | `node:20-alpine`, runs as non-root, healthcheck on `/health` |
| `frontend/` | Plain HTML/CSS/JS UI |
| `frontend/Dockerfile` | `nginx:alpine`, serves static files and proxies `/api` → backend |
| `docker-compose.yml` | Runs both services + named volume for data |

## Run with Docker Compose

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5000/api/todos |
| Health | http://localhost:5000/health |

Stop: `docker compose down` (add `-v` to wipe data).

## Run containers individually

```bash
docker network create todo-net
docker build -t todo-backend ./backend
docker build -t todo-frontend ./frontend
docker run -d --name backend  --network todo-net -p 5000:5000 -v todo-data:/app/data todo-backend
docker run -d --name frontend --network todo-net -p 8080:80 todo-frontend
```

> The backend container must be named `backend` (nginx proxies to `http://backend:5000`).

## Run locally without Docker

```bash
cd backend && npm install && npm start      # API on :5000
```
Then set `window.API_BASE_URL = "http://localhost:5000"` in `frontend/config.js` and open `frontend/index.html` (or serve it with `npx serve frontend`).

## API

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/todos` | – | List todos |
| POST | `/api/todos` | `{ "title": "..." }` | Create todo |
| PUT | `/api/todos/:id` | `{ "title"?, "completed"? }` | Update todo |
| DELETE | `/api/todos/:id` | – | Delete todo |
| GET | `/health` | – | Health check |

## Environment variables (backend)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API port |
| `DATA_DIR` | `/app/data` | Where `todos.json` is stored |
| `CORS_ORIGIN` | `*` | Allowed origin for direct API calls |
