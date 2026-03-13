import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import init_db
from app.routers import interviews, studies

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.WARNING, format="%(message)s")
# Enable INFO logging for the core library and our app
logging.getLogger("qux360").setLevel(logging.INFO)
logging.getLogger("app").setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    yield
    # Clean up if needed

app = FastAPI(
    title="Qux360 Demo API",
    version="0.2.0",
    lifespan=lifespan
)

# Allow frontend (Svelte) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interviews.router)
app.include_router(studies.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
