import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set")

client = AsyncOpenAI(api_key=api_key)

async def analyze_image(image_url: str, prompt: str) -> str:
    """
    Sends an image and a prompt to OpenAI's Vision model.
    """
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }
        ],
        max_tokens=300,
    )

    return response.choices[0].message.content or ""
