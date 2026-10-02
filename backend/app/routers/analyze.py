from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.core.database import SessionLocal
from app.models.media import MediaAsset
from app.models.analysis import AnalysisResult
# Import the new task functions you created
from app.services.analysis_task import (
    run_caption_analysis, 
    run_vqa_analysis, 
    run_ocr_analysis
)

router = APIRouter(prefix="/api/analyze", tags=["Analyze"])

@router.post("/caption")
def caption(asset_id: str, background_tasks: BackgroundTasks):
    db = SessionLocal()
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    db.close()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    background_tasks.add_task(
        run_caption_analysis,
        asset.id,
        asset.s3_key,
    )

    return {"status": "caption processing started"}

@router.post("/vqa")
def vqa(asset_id: str, question: str, background_tasks: BackgroundTasks):
    """
    Visual Question Answering: Ask a question about the image.
    """
    db = SessionLocal()
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    db.close()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    background_tasks.add_task(
        run_vqa_analysis,
        asset.id,
        asset.s3_key,
        question
    )

    return {"status": "vqa processing started"}

@router.post("/ocr")
def ocr(asset_id: str, background_tasks: BackgroundTasks):
    """
    Optical Character Recognition: Extract text from the image.
    """
    db = SessionLocal()
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    db.close()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    background_tasks.add_task(
        run_ocr_analysis,
        asset.id,
        asset.s3_key,
    )

    return {"status": "ocr processing started"}

@router.get("/result")
def get_analysis_result(asset_id: str, feature_type: str):
    db = SessionLocal()

    # Retrieve the most recent result for this asset and feature type
    result = (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.asset_id == asset_id,
            AnalysisResult.feature_type == feature_type,
        )
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )

    db.close()

    if not result:
        return {"status": "processing"}

    result_data = result.result_data

    # Check for failure status inside the JSONB data
    if result_data.get("status") == "failed":
        return {
            "status": "failed",
            "error": result_data.get("error"),
        }
    
    # Return the successful data
    return {
        "status": "completed",
        "result": result_data,
    }