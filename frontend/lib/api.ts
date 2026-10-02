const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/`, { // Note: Added trailing slash to match FastAPI default
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

export async function analyzeCaption(assetId: string) {
  const res = await fetch(
    `${API_BASE}/analyze/caption?asset_id=${assetId}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Caption analysis failed");
  return res.json();
}

// NEW: VQA Function
export async function analyzeVQA(assetId: string, question: string) {
  const res = await fetch(
    `${API_BASE}/analyze/vqa?asset_id=${assetId}&question=${encodeURIComponent(question)}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("VQA analysis failed");
  return res.json();
}

// NEW: OCR Function
export async function analyzeOCR(assetId: string) {
  const res = await fetch(
    `${API_BASE}/analyze/ocr?asset_id=${assetId}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("OCR analysis failed");
  return res.json();
}

// UPDATED: Generic Feature Type
export async function getAnalysisResult(
  assetId: string,
  featureType: string 
) {
  const res = await fetch(
    `${API_BASE}/analyze/result?asset_id=${assetId}&feature_type=${featureType}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch analysis result");
  }

  return res.json();
}

// NEW: Text-to-Image Generation
export async function generateTextToImage(prompt: string) {
  const res = await fetch(
    `${API_BASE}/generate/text-to-image?prompt=${encodeURIComponent(prompt)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Image generation failed");
  return res.json();
}

export async function getGenerationJob(jobId: string) {
  const res = await fetch(`${API_BASE}/generate/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error("Failed to fetch generation status");
  return res.json();
}


// NEW: Image Variation Generation
export async function generateVariation(imageUrl: string, prompt: string) {
  const res = await fetch(
    `${API_BASE}/generate/variation?image_url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Variation generation failed");
  return res.json();
}
