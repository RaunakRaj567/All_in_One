import os
import sys

import warnings

# Suppress SDK warnings
warnings.filterwarnings("ignore")

# Safely handle UTF-8 encoding on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY is missing in your .env file.")
    sys.exit(1)

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)


def chat_interactive():
    """Runs an interactive conversational CLI session."""
    print("==================================================")
    print("Gemini Interactive CLI Chat")
    print(f"Model: {GEMINI_MODEL}")
    print("Type 'exit' or 'quit' to end the session.")
    print("==================================================\n")

    chat = client.chats.create(model=GEMINI_MODEL)

    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "q"]:
                print("\nGoodbye!")
                break

            print("Gemini > ", end="", flush=True)

            response = chat.send_message(user_input)
            if response.text:
                print(response.text)
            else:
                print("No response generated.")
            print()

        except KeyboardInterrupt:
            print("\n\nSession interrupted. Goodbye!")
            break
        except Exception as error:
            print(f"\nError: {error}\n")


def one_shot(prompt: str):
    """Executes a single prompt directly from CLI arguments."""
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        if response.text:
            print(response.text)
        else:
            print("No response text returned.")
    except Exception as error:
        print(f"Error: {error}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # If prompt passed as command line arguments
        prompt = " ".join(sys.argv[1:])
        one_shot(prompt)
    else:
        # Interactive mode
        chat_interactive()
