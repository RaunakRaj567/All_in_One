from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User message or question"
    )

    profile_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="GitHub profile metrics (repositories, followers, following, commits, streaks, top languages, recent activity)"
    )


class ChatResponse(BaseModel):

    response: str