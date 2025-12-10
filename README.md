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
```

The first time you run it you need to run:
```bash
poetry install
source .venv/bin/activate
```

That will create a venv virtual environment for you.

In case you prefer to install it manually, the `requirements.txt` file is provided:
```bash
pip install -r requirements.txt
```

Install Spacy's model
```bash
spacy download en_core_web_sm
```

To launch the server:
```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
```

The first time you run it you need to run:
```bash
npm install
```

To launch the web app:
```bash
npm run dev
```

## 🐳 Option 2: Docker (dev)

Start both services (frontend + backend) with Docker Compose for a convenient dev environment. 

From the root directory:

```bash
docker-compose up --build
```
The compose setup mounts local folders into the containers so code changes are reflected immediately.

## 🚀 Enjoy it!
- Backend will be available at `http://localhost:8000`
- Frontend (Vite dev server) at `http://localhost:5173`
