import os
import json
import asyncio
import requests
from typing import AsyncGenerator, Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Get API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Get Primary Gemini Model
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-flash-latest"
)

# Candidate fallback models if rate limits (429) or server errors (503/404) occur
FALLBACK_MODELS = [
    GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-pro-latest"
]
# Remove duplicates while preserving priority order
FALLBACK_MODELS = list(dict.fromkeys(FALLBACK_MODELS))

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


async def _run_in_thread(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: func(*args, **kwargs))


async def generate_response_async(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Asynchronously sends user message and profile context to Gemini REST API with model fallback.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is missing in .env file.")

    full_prompt = format_context_prompt(message, profile_data)
    last_error = None

    def _sync_generate(model_name: str) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                text_out = "".join([p.get("text", "") for p in parts if "text" in p])
                if text_out.strip():
                    return text_out
        elif resp.status_code in [404, 429, 503]:
            print(f"[Gemini Services] Model '{model_name}' returned HTTP {resp.status_code}. Trying fallback...")
            return None
        else:
            resp.raise_for_status()
        return None

    for model_name in FALLBACK_MODELS:
        try:
            res_text = await _run_in_thread(_sync_generate, model_name)
            if res_text:
                return res_text
        except Exception as error:
            last_error = error
            print(f"[Gemini Services] Model '{model_name}' error: {error}. Trying next fallback...")
            continue

    raise RuntimeError(f"Gemini API Error: All fallbacks failed. Last error: {str(last_error)}")


async def generate_response_stream(message: str, profile_data: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
    """
    Asynchronously streams chunks from Gemini REST API (SSE) using structured profile context.
    """
    if not GEMINI_API_KEY:
        yield "[Error: GEMINI_API_KEY is missing in .env file.]"
        return

    full_prompt = format_context_prompt(message, profile_data)

    def _sync_init_stream(model_name: str) -> Optional[requests.Response]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
        resp = requests.post(url, json=payload, stream=True, timeout=30)
        if resp.status_code == 200:
            return resp
        print(f"[Gemini Services Stream] Model '{model_name}' HTTP {resp.status_code}. Trying next fallback...")
        return None

    for model_name in FALLBACK_MODELS:
        try:
            resp = await _run_in_thread(_sync_init_stream, model_name)
            if not resp:
                continue

            chunk_yielded = False
            for raw_line in resp.iter_lines():
                if not raw_line:
                    continue
                decoded = raw_line.decode('utf-8').strip()
                if decoded.startswith("data: "):
                    try:
                        data = json.loads(decoded[6:])
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            for p in parts:
                                txt = p.get("text", "")
                                if txt:
                                    chunk_yielded = True
                                    yield txt
                    except Exception:
                        pass

            if chunk_yielded:
                return
        except Exception as error:
            print(f"[Gemini Services Stream] Exception on '{model_name}': {error}. Trying next fallback...")
            continue

    yield "[Error: Gemini API limits reached across models. Please check API Key or try again in a few moments.]"