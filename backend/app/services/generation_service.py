import os
import uuid
import base64
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.models.media import MediaAsset
from app.models.generation import GenerationLog
from app.services.s3_service import upload_bytes, generate_presigned_url

load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

if not HF_TOKEN:
    raise RuntimeError("HUGGINGFACE_API_TOKEN not set")

# -------------------------------
# Hugging Face Models
# -------------------------------

# Text → Image
HF_TEXT2IMG_URL = (
    "https://router.huggingface.co/hf-inference/models/"
    "stabilityai/stable-diffusion-xl-base-1.0"
)

# Image → Image (REAL variation)
HF_IMG2IMG_URL = (
    "https://router.huggingface.co/hf-inference/models/"
    "stabilityai/stable-diffusion-xl-refiner-1.0"
)

TEXT_HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Accept": "image/png",
    "Content-Type": "application/json",
}

IMG_HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
}


# =====================================================
# TEXT TO IMAGE
# =====================================================

def generate_image_from_text(prompt: str, db: Session):
    payload = {
        "inputs": prompt,
        "options": {
            "wait_for_model": True
        },
    }

    response = requests.post(
        HF_TEXT2IMG_URL,
        headers=TEXT_HEADERS,
        json=payload,
        timeout=120,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"HuggingFace text2img error: {response.text}"
        )

    image_bytes = response.content

    # Upload to S3
    s3_key = f"generated/{uuid.uuid4()}.png"
    upload_bytes(image_bytes, s3_key, "image/png")
    s3_url = generate_presigned_url(s3_key)

    # Save media
    media = MediaAsset(
        s3_key=s3_key,
        s3_url=s3_url,
        media_type="image/png",
        origin="generated",
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    # Log generation
    log = GenerationLog(
        generated_asset_id=media.id,
        prompt=prompt,
        model_used="sdxl-text2img",
    )

    db.add(log)
    db.commit()

    return {
        "asset_id": str(media.id),
        "image_url": s3_url,
    }


# =====================================================
# IMAGE VARIATION (TRUE IMG2IMG)
# =====================================================
def generate_variation(image_url: str, prompt: str, db: Session):
    """
    REAL img2img using Hugging Face Router (JSON-based)
    """

    # 1️⃣ Download original image
    img_response = requests.get(image_url, timeout=30)
    if img_response.status_code != 200:
        raise RuntimeError("Failed to download reference image")

    image_bytes = img_response.content
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # 2️⃣ Prepare JSON payload (THIS IS THE FIX)
    payload = {
        "inputs": prompt,
        "image": image_b64,
        "parameters": {
            "strength": 0.4,
            "guidance_scale": 7.5
        },
        "options": {
            "wait_for_model": True
        }
    }

    response = requests.post(
        HF_IMG2IMG_URL,
        headers={
            "Authorization": f"Bearer {HF_TOKEN}",
            "Accept": "image/png",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"HuggingFace img2img error: {response.text}"
        )

    generated_bytes = response.content

    # 3️⃣ Upload to S3
    s3_key = f"generated/variation-{uuid.uuid4()}.png"
    upload_bytes(generated_bytes, s3_key, "image/png")
    s3_url = generate_presigned_url(s3_key)

    # 4️⃣ Save media
    media = MediaAsset(
        s3_key=s3_key,
        s3_url=s3_url,
        media_type="image/png",
        origin="variation",
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    # 5️⃣ Log generation
    log = GenerationLog(
        generated_asset_id=media.id,
        prompt=prompt,
        model_used="sdxl-img2img-refiner",
    )

    db.add(log)
    db.commit()

    return {
        "asset_id": str(media.id),
        "image_url": s3_url,
    }
