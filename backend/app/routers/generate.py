from celery.result import AsyncResult
from fastapi import APIRouter, HTTPException
from app.core.celery_app import celery_app
from app.services.generation_tasks import generate_image_task

router = APIRouter(prefix="/api/generate", tags=["Generation"])

@router.post("/text-to-image", status_code=202)
def text_to_image(prompt: str):
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    task = generate_image_task.delay("text-to-image", prompt)
    return {"job_id": task.id, "status": "queued"}

@router.post("/variation", status_code=202)
def variation(image_url: str, prompt: str):
    if not image_url.strip() or not prompt.strip():
        raise HTTPException(status_code=400, detail="Image URL and prompt are required")
    task = generate_image_task.delay("variation", prompt, image_url)
    return {"job_id": task.id, "status": "queued"}


@router.get("/jobs/{job_id}")
def generation_job_status(job_id: str):
    result = AsyncResult(job_id, app=celery_app)
    response = {"job_id": job_id, "status": result.status.lower()}
    if result.successful():
        response["result"] = result.result
    elif result.failed():
        response["error"] = str(result.result)
    return response
