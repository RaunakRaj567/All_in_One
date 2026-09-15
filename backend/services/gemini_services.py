import os
from typing import AsyncGenerator, Optional, Dict, Any
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Get Primary Gemini Model
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash"
)

# Candidate fallback models if rate limits (429) or server errors (503/404) occur
FALLBACK_MODELS = [
    GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
]
# Remove duplicates while preserving priority order
FALLBACK_MODELS = list(dict.fromkeys(FALLBACK_MODELS))

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is missing. "
        "Please add it to your .env file."
    )

# Create Gemini client
client = genai.Client(
    api_key=GEMINI_API_KEY
)

SYSTEM_PERSONA = """You are an expert GitHub Growth & Profile Advisor AI.
Your purpose is to provide tailored developer growth strategies, profile optimizations, open-source contribution guidance, and repository improvement advice.

CRITICAL INSTRUCTIONS:
- You MUST carefully analyze and explicitly reference the developer's exact GitHub profile metrics provided below.
- Address the user (@handle) directly, acknowledging their actual numbers (repositories, followers, commit volume, streaks, and top programming languages).
- Format your response in clean, professional GitHub Markdown with clear section headings, bold key takeaways, and actionable next steps.
- Be encouraging, analytical, and highly relevant to their current developer stage.
"""


def format_context_prompt(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """Combines system persona, structured profile metrics, and user message."""
    if not profile_data:
        return f"{SYSTEM_PERSONA}\n\nUser Question:\n{message}"

    login = profile_data.get("login") or profile_data.get("username") or "Developer"
    name = profile_data.get("name") or login
    bio = profile_data.get("bio") or "N/A"
    
    public_repos = profile_data.get("public_repos")
    if public_repos is None:
        public_repos = profile_data.get("publicRepos")
    if public_repos is None:
        public_repos = profile_data.get("repositories", "N/A")

    followers = profile_data.get("followers", "N/A")
    following = profile_data.get("following", "N/A")
    total_commits = profile_data.get("totalCommits") or profile_data.get("total_commits") or "N/A"
    
    current_streak = profile_data.get("currentStreak")
    if current_streak is None:
        current_streak = profile_data.get("current_streak", "N/A")

    longest_streak = profile_data.get("longestStreak")
    if longest_streak is None:
        longest_streak = profile_data.get("longest_streak", "N/A")

    recent_activity = profile_data.get("recentActivity") or profile_data.get("recent_activity") or "N/A"

    top_langs = profile_data.get("topLanguages") or profile_data.get("languages") or []
    if isinstance(top_langs, list):
        langs_formatted = []
        for l in top_langs:
            if isinstance(l, dict):
                langs_formatted.append(f"{l.get('name', 'Code')} ({l.get('percentage', 0)}%)")
            else:
                langs_formatted.append(str(l))
        langs_str = ", ".join(langs_formatted) if langs_formatted else "N/A"
    else:
        langs_str = str(top_langs)

    profile_summary = f"""--- TARGET GITHUB PROFILE METRICS ---
- Username: @{login} ({name})
- Bio: {bio}
- Public Repositories: {public_repos}
- Followers: {followers} | Following: {following}
- Total Commits: {total_commits}
- Current Coding Streak: {current_streak} days
- Longest Coding Streak: {longest_streak} days
- Top Languages: {langs_str}
- Recent Activity: {recent_activity}
-------------------------------------"""

    return f"{SYSTEM_PERSONA}\n\n{profile_summary}\n\nUser Question:\n{message}"


async def generate_response_async(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Asynchronously sends user message and profile context to Gemini with model fallback.
    """
    full_prompt = format_context_prompt(message, profile_data)
    last_error = None

    for model_name in FALLBACK_MODELS:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=full_prompt
            )
            if response.text:
                return response.text
        except Exception as error:
            last_error = error
            error_str = str(error)
            if any(err_kw in error_str for err_kw in ["429", "RESOURCE_EXHAUSTED", "503", "404"]):
                print(f"[Gemini Service] Model '{model_name}' error. Fallback next...")
                continue
            else:
                raise RuntimeError(f"Gemini API Error ({model_name}): {error_str}")

    raise RuntimeError(f"Gemini API Error: All fallbacks failed. Last error: {str(last_error)}")


async def generate_response_stream(message: str, profile_data: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
    """
    Asynchronously streams chunks from Gemini using structured profile context.
    """
    full_prompt = format_context_prompt(message, profile_data)

    for model_name in FALLBACK_MODELS:
        try:
            response_stream = await client.aio.models.generate_content_stream(
                model=model_name,
                contents=full_prompt
            )
            chunk_received = False
            async for chunk in response_stream:
                if chunk.text:
                    chunk_received = True
                    yield chunk.text
            if chunk_received:
                return
        except Exception as error:
            error_str = str(error)
            if any(err_kw in error_str for err_kw in ["429", "RESOURCE_EXHAUSTED", "503", "404"]):
                print(f"[Gemini Stream] Model '{model_name}' error. Fallback next...")
                continue
            elif "Event loop is closed" in error_str or "closed" in error_str:
                return
            else:
                yield f"[Error: {error_str}]"
                return

    yield "[Error: Rate limit reached across models. Please try again in a few moments.]"