from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.services.generation_service import generate_image_from_text, generate_variation


@celery_app.task(bind=True, name="generation.generate")
def generate_image_task(self, mode: str, prompt: str, image_url: str | None = None):
    """Run a long-running generation request in a dedicated worker process."""
    db = SessionLocal()
    try:
        if mode == "text-to-image":
            return generate_image_from_text(prompt, db)
        if mode == "variation" and image_url:
            return generate_variation(image_url, prompt, db)
        raise ValueError("Unsupported generation mode or missing reference image")
    finally:
        db.close()
