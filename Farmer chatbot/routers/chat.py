from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from schemas.chat import (
    ChatRequest,
    ChatResponse
)

from services.gemini_service import (
    generate_response_async,
    generate_response_stream
)


router = APIRouter(
    prefix="/api",
    tags=["Gemini Chat"]
)


@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(
    request: ChatRequest
):
    """
    Fast non-blocking async endpoint that returns the complete response.
    Explicitly incorporates profile metrics if provided.
    """
    try:
        gemini_response = await generate_response_async(
            request.message,
            profile_data=request.profile_data
        )

        return ChatResponse(
            response=gemini_response
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest
):
    """
    Ultra-low latency streaming endpoint.
    Streams token chunks in real-time incorporating profile metrics context.
    """
    try:
        return StreamingResponse(
            generate_response_stream(
                request.message,
                profile_data=request.profile_data
            ),
            media_type="text/plain"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )