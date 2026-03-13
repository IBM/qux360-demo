from pydantic import BaseModel
from typing import List
from qux360.core import TopicList


class UpdateTranscriptPayload(BaseModel):
    file_id: int
    content: list[dict]


class SuggestThemesPayload(BaseModel):
    study_id: str
    topics: List[TopicList] | None = None
    top_n: int = 5
    study_context: str = "General"
