import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_KEY", "")

if not url or not key or url.startswith("[") or key.startswith("["):
    raise RuntimeError(
        "Supabase configuration missing or invalid. "
        "Please ensure SUPABASE_URL and SUPABASE_KEY are set in your environment."
    )

supabase: Client = create_client(url, key)


def get_supabase_client() -> Client:
    return supabase
