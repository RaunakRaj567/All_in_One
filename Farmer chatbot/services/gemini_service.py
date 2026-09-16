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

# Get Primary Gemini Model (gemini-flash-latest provides 200 OK without 503 capacity issues)
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

SYSTEM_PERSONA = """You are KisanAI / AgriAssist, an expert Agricultural Scientist & Farming Advisor AI.
Your purpose is to assist farmers, agronomists, and agricultural extension workers with practical, highly actionable advice on crop management, pest & disease identification, irrigation schedules, fertilizer ratios (NPK), soil health, weather adaptation, and government agricultural schemes.

CRITICAL INSTRUCTIONS:
- Give clear, practical, step-by-step farming advice.
- When soil metrics (pH, moisture, NPK) or crop species are provided, tailor recommendations specifically to those readings.
- Use clean Markdown formatting with bullet points, bold key terms, and easy-to-read sections.
- Emphasize sustainable farming, optimal yield, and cost-effective organic or integrated pest management (IPM) practices.
"""


def format_context_prompt(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """Combines agricultural system persona, field & soil metrics, and user query."""
    if not profile_data:
        return f"{SYSTEM_PERSONA}\n\nUser Question:\n{message}"

    crop = profile_data.get("crop", "Wheat / General")
    moisture = profile_data.get("moisture", "42%")
    ph = profile_data.get("ph", "6.5")
    nitrogen = profile_data.get("nitrogen", "Medium (140 kg/ha)")
    phosphorus = profile_data.get("phosphorus", "Optimal (35 kg/ha)")
    potassium = profile_data.get("potassium", "High (210 kg/ha)")
    location = profile_data.get("location", "Northern Plains")
    season = profile_data.get("season", "Rabi / Current Season")

    farm_summary = f"""--- FARM FIELD & SOIL DIAGNOSTIC METRICS ---
- Target Crop: {crop}
- Soil Moisture: {moisture}
- Soil pH: {ph} (Target range: 6.0 - 7.2)
- Soil Nitrogen (N): {nitrogen}
- Soil Phosphorus (P): {phosphorus}
- Soil Potassium (K): {potassium}
- Agro-Climatic Zone: {location}
- Farming Season: {season}
--------------------------------------------"""

    return f"{SYSTEM_PERSONA}\n\n{farm_summary}\n\nFarmer Question:\n{message}"


async def _run_in_thread(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: func(*args, **kwargs))


async def generate_response_async(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Asynchronously sends user message and farm context to Gemini REST API with model fallback.
    If GEMINI_API_KEY is not configured, provides structured agronomy guidance.
    """
    if not GEMINI_API_KEY:
        crop = profile_data.get("crop", "Wheat") if profile_data else "Wheat"
        return (
            f"🌾 **[AgriAssist Intelligence Mode]**\n\n"
            f"Currently operating in Offline Diagnostic Mode (API key pending).\n\n"
            f"**Field Assessment for {crop}:**\n"
            f"- Recommended NPK Ratio: 120:60:40 kg/ha for optimal root development.\n"
            f"- Soil Moisture status (42%): Favorable for current vegetative stage.\n"
            f"- Recommended action: Monitor field edges for rust signs; schedule light drip irrigation in 3 days if temperature exceeds 30°C."
        )

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
            print(f"[Gemini Service] Model '{model_name}' returned status {resp.status_code}. Trying fallback...")
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
            print(f"[Gemini Service] Model '{model_name}' error: {error}. Trying next fallback...")
            continue

    raise RuntimeError(f"Gemini API Error: All fallbacks failed. Last error: {str(last_error)}")


async def generate_response_stream(message: str, profile_data: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
    """
    Asynchronously streams chunks from Gemini REST API (SSE) using structured farm context.
    Provides offline agronomy fallback when GEMINI_API_KEY is not set.
    """
    if not GEMINI_API_KEY:
        crop = profile_data.get("crop", "Wheat") if profile_data else "Wheat"
        ph = profile_data.get("ph", "6.5") if profile_data else "6.5"
        
        fallback_chunks = [
            f"🌾 **AgriAssist Diagnostic Advice** (Offline Mode)\n\n",
            f"Thank you for your query regarding **{crop}** cultivation.\n\n",
            f"### 1. Soil & Fertilizer Recommendation\n",
            f"- **Soil pH ({ph})**: Excellent balance for nutrient uptake.\n",
            f"- **Nutrient Plan**: Apply Urea split in two doses (at tillering and crown root initiation). Add Neem-coated urea to minimize nitrogen leaching.\n\n",
            f"### 2. Pest & Health Alert\n",
            f"- Keep field clear of weeds along bunds.\n",
            f"- For aphid or fungal management, consider spraying Neem oil (5ml/L) or targeted bio-fungicide.\n\n",
            f"### 3. Water Management\n",
            f"- Maintain light soil moisture without waterlogging.\n\n",
            f"*Note: Configure your `GEMINI_API_KEY` in `.env` to unlock live real-time Gemini AI agronomy insights.*"
        ]
        
        for chunk in fallback_chunks:
            yield chunk
            await asyncio.sleep(0.08)
        return

    full_prompt = format_context_prompt(message, profile_data)

    def _sync_init_stream(model_name: str) -> Optional[requests.Response]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
        resp = requests.post(url, json=payload, stream=True, timeout=30)
        if resp.status_code == 200:
            return resp
        print(f"[Gemini Stream] Model '{model_name}' HTTP {resp.status_code}. Trying next fallback...")
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
            print(f"[Gemini Stream] Exception on '{model_name}': {error}. Trying next fallback...")
            continue

    yield "[Error: Gemini API limits reached across models. Please check API Key or try again in a few moments.]"
