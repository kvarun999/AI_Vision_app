from app.core.database import SessionLocal
from app.models.analysis import AnalysisResult
from app.services.s3_service import generate_presigned_url
from app.services.vision_service import analyze_image
from openai import RateLimitError

async def run_caption_analysis(asset_id, s3_key):
    db = SessionLocal()

    try:
        image_url = generate_presigned_url(s3_key)
        prompt = "Describe the image clearly."

        try:
            result_text = await analyze_image(image_url, prompt)

            analysis = AnalysisResult(
                asset_id=asset_id,
                feature_type="caption",
                prompt_text=prompt,
                result_data={
                    "status": "completed",
                    "text": result_text,
                },
            )

        except RateLimitError:
            analysis = AnalysisResult(
                asset_id=asset_id,
                feature_type="caption",
                prompt_text=prompt,
                result_data={
                    "status": "failed",
                    "error": "AI rate limit exceeded. Try again later.",
                },
            )
        except Exception as exc:
            analysis = AnalysisResult(
                asset_id=asset_id,
                feature_type="caption",
                prompt_text=prompt,
                result_data={"status": "failed", "error": str(exc)},
            )

        db.add(analysis)
        db.commit()

    finally:
        db.close()


async def run_vqa_analysis(asset_id, s3_key, question):
    db = SessionLocal()

    try:
        image_url = generate_presigned_url(s3_key)
        prompt = f"Answer the question based only on the image: {question}"

        try:
            result_text = await analyze_image(image_url, prompt)
            result_data = {"status": "completed", "answer": result_text}
        except Exception as exc:
            result_data = {"status": "failed", "error": str(exc)}

        analysis = AnalysisResult(
            asset_id=asset_id,
            feature_type="vqa",
            prompt_text=question,
            result_data=result_data
        )

        db.add(analysis)
        db.commit()
    finally:
        db.close()


async def run_ocr_analysis(asset_id, s3_key):
    db = SessionLocal()

    try:
        image_url = generate_presigned_url(s3_key)
        prompt = "Extract all visible text from the image."

        try:
            result_text = await analyze_image(image_url, prompt)
            result_data = {"status": "completed", "text": result_text}
        except Exception as exc:
            result_data = {"status": "failed", "error": str(exc)}

        analysis = AnalysisResult(
            asset_id=asset_id,
            feature_type="ocr",
            prompt_text=prompt,
            result_data=result_data
        )

        db.add(analysis)
        db.commit()
    finally:
        db.close()
