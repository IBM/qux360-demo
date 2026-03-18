from app.database.supabase_client import get_supabase_client


def save_study(name: str, user_id: str) -> str:
    """Insert a new study into Supabase and return its generated ID."""
    supabase = get_supabase_client()
    data = {"name": name, "user_id": user_id}
    response = supabase.table("studies").insert(data).execute()
    if not response.data:
        raise Exception(f"Failed to save study: {response}")
    return response.data[0]["id"]


def get_study_by_name(name: str, user_id: str) -> str | None:
    """Return the study id for a given name and user, or None if not found."""
    supabase = get_supabase_client()
    response = (
        supabase.table("studies")
        .select("id")
        .eq("name", name)
        .eq("user_id", user_id)
        .execute()
    )
    if response.data:
        return response.data[0]["id"]
    return None
