import os
from typing import AsyncGenerator, Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Get Primary Gemini Model
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)

# Candidate fallback models if rate limits (429) or server errors (503/404) occur
FALLBACK_MODELS = [
    GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]
# Remove duplicates while preserving priority order
FALLBACK_MODELS = list(dict.fromkeys(FALLBACK_MODELS))

# Create Gemini client safely (non-fatal if key is absent for demo mode)
client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"[Gemini Service Warning] Failed to initialize Gemini Client: {e}")

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


async def generate_response_async(message: str, profile_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Asynchronously sends user message and farm context to Gemini with model fallback.
    If GEMINI_API_KEY is not configured, provides structured agronomy guidance.
    """
    if not client:
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
    Asynchronously streams chunks from Gemini using structured farm context.
    Provides offline agronomy fallback when GEMINI_API_KEY is not set.
    """
    if not client:
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
        
        import asyncio
        for chunk in fallback_chunks:
            yield chunk
            await asyncio.sleep(0.08)
        return

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

