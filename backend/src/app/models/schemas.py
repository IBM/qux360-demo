from enum import Enum
from pydantic import BaseModel
from typing import List
from qux360.core import TopicList


class ModelProvider(str, Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"
    WATSONX = "watsonx"


class LLMConfig(BaseModel):
    model_id: str
    base_url: str
    provider: ModelProvider
    api_key: str | None = None
    project_id: str | None = None


class UpdateTranscriptPayload(BaseModel):
    content: list[dict]


class IdentifyParticipantPayload(BaseModel):
    llm_config: LLMConfig


class InterviewTopicsPayload(BaseModel):
    llm_config: LLMConfig
    top_n: int = 5
    explain: bool = True
    interview_context: str = "General"


class SuggestThemesPayload(BaseModel):
    llm_config: LLMConfig
    topics: List[TopicList] | None = None
    top_n: int = 5
    study_context: str = "General"
