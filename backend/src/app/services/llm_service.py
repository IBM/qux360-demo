import logging
import os
import re
from mellea import MelleaSession
from mellea.backends.ollama import OllamaModelBackend
from mellea.backends.openai import OpenAIBackend
from mellea.backends.watsonx import WatsonxAIBackend

from app.models.schemas import LLMConfig, ModelProvider

logger = logging.getLogger(__name__)

# Suppress Mellea's FancyLogger
logging.getLogger("fancy_logger").setLevel(logging.WARNING)

_LOCALHOST_PATTERN = re.compile(r"(localhost|127\.0\.0\.1)")
_DOCKER_HOST = "host.docker.internal"


def _resolve_base_url(url: str) -> str:
    """Replace localhost/127.0.0.1 with host.docker.internal when running inside Docker.

    When the backend runs inside a container, 'localhost' in a URL provided by
    the browser refers to the container itself, not the host machine. This
    rewrite ensures that services running on the host (e.g. Ollama) are still
    reachable.

    The rewrite is only applied when the DOCKER_ENV environment variable is set
    to a truthy value (e.g. 'true', '1').
    """
    if os.environ.get("DOCKER_ENV", "").lower() in ("1", "true", "yes"):
        resolved = _LOCALHOST_PATTERN.sub(_DOCKER_HOST, url)
        if resolved != url:
            logger.info("Rewrote base_url for Docker: %s -> %s", url, resolved)
        return resolved
    return url


def get_mellea_session(config: LLMConfig) -> MelleaSession:
    """Initialize a MelleaSession based on the provided LLMConfig."""
    base_url = _resolve_base_url(config.base_url)

    if config.provider == ModelProvider.OLLAMA:
        backend = OllamaModelBackend(model_id=config.model_id, base_url=base_url)
    elif config.provider == ModelProvider.OPENAI:
        backend = OpenAIBackend(
            model_id=config.model_id, base_url=base_url, api_key=config.api_key
        )
    elif config.provider == ModelProvider.WATSONX:
        backend = WatsonxAIBackend(
            model_id=config.model_id,
            base_url=base_url,
            api_key=config.api_key,
            project_id=config.project_id,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {config.provider}")

    return MelleaSession(backend=backend)
