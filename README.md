# 🧙 Svelte + FastAPI Wizard App

## 🐳 Docker (dev)

Start both services (frontend + backend) with Docker Compose for a convenient dev environment:

```bash
# from the project root
docker-compose up --build
```

- Backend will be available at `http://localhost:8000`
- Frontend (Vite dev server) at `http://localhost:5173`

The compose setup mounts local folders into the containers so code changes are reflected immediately.
