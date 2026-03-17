import logging
from mellea import MelleaSession
from mellea.backends.ollama import OllamaModelBackend
from mellea.backends.openai import OpenAIBackend
from mellea.backends.watsonx import WatsonxAIBackend

from app.models.schemas import LLMConfig, ModelProvider

logger = logging.getLogger(__name__)

# Suppress Mellea's FancyLogger
logging.getLogger("fancy_logger").setLevel(logging.WARNING)


def get_mellea_session(config: LLMConfig) -> MelleaSession:
    """Initialize a MelleaSession based on the provided LLMConfig."""
    if config.provider == ModelProvider.OLLAMA:
        backend = OllamaModelBackend(model_id=config.model_id, base_url=config.base_url)
    elif config.provider == ModelProvider.OPENAI:
        backend = OpenAIBackend(
            model_id=config.model_id, base_url=config.base_url, api_key=config.api_key
        )
    elif config.provider == ModelProvider.WATSONX:
        backend = WatsonxAIBackend(
            model_id=config.model_id,
            base_url=config.base_url,
            api_key=config.api_key,
            project_id=config.project_id,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {config.provider}")

    return MelleaSession(backend=backend)
