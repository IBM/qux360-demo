# 🧙 Svelte + FastAPI Wizard App

## ⚙️ Configuration

`.env` files are needed for both the backend and the frontend.

`backend/.env`:
```
MODEL_ID=watsonx/meta-llama/llama-3-3-70b-instruct
WATSONX_URL=[your URL]
WATSONX_API_KEY=[your API key]
WATSONX_PROJECT_ID=[your project ID]
DISABLE_AIOHTTP_TRANSPORT=True
```

`frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:8000
```


## 👩🏻‍💻 Option 1: Run it in your local environment without Docker (dev)

### Backend

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

## 🐳 Option 2: Docker (dev)

Start both services (frontend + backend) with Docker Compose for a convenient dev environment:

```bash
# from the project root
docker-compose up --build
```

## 🚀 Enjoy it!
- Backend will be available at `http://localhost:8000`
- Frontend (Vite dev server) at `http://localhost:5173`

The compose setup mounts local folders into the containers so code changes are reflected immediately.
