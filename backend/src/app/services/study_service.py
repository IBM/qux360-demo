import os
from typing import List

from qux360.core import Interview, Study, TopicList

from app.models.schemas import LLMConfig
from app.repositories import interview_repository
from app.services import interview_service
from app.services.llm_service import get_mellea_session


def get_study_themes_sync(
    study_id: str,
    topics: List[TopicList] | None,
    top_n: int,
    study_context: str,
    llm_config: LLMConfig,
):
    rows = interview_repository.get_interviews_for_study_from_db(study_id)
    if not rows:
        return {
            "study_topics_result": None,
            "error": "study has no interviews",
        }

    interviews = []
    tmp_paths = []

    try:
        mellea_session = get_mellea_session(llm_config)
        for row in rows:
            tmp_path = interview_service.write_temp_file(row)
            tmp_paths.append(tmp_path)
            interview = Interview(tmp_path)
            interview.id = row["id"]
            interview.identify_interviewee(mellea_session)
            interviews.append(interview)

        study = Study(interviews)
        topics_result = study.suggest_themes(
            mellea_session, top_n, study_context, topic_lists=topics
        )

        return {
            "message": "Suggested topics result for study",
            "study_topics_result": topics_result,
        }
    finally:
        for path in tmp_paths:
            if os.path.exists(path):
                os.remove(path)
