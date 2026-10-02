"use client";

import { useState, useRef } from "react"; // Added useRef
import {
  uploadImage,
  analyzeCaption,
  analyzeVQA,
  analyzeOCR,
  getAnalysisResult,
} from "@/lib/api";

type AnalysisMode = "caption" | "vqa" | "ocr";

export default function UploadForm({
  onResult,
  onError,
}: {
  onResult: (data: any) => void;
  onError: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  // New State for Mode and Question
  const [mode, setMode] = useState<AnalysisMode>("caption");
  const [question, setQuestion] = useState("");

  // Create a reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  // New function to trigger file selection
  function handleBrowseClick() {
    fileInputRef.current?.click();
  }

  async function handleSubmit() {
    if (!file) {
      onError("Please select an image");
      return;
    }

    if (mode === "vqa" && !question.trim()) {
      onError("Please enter a question for VQA");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading image...");

      // 1. Upload Image
      const uploadRes = await uploadImage(file);
      
      onResult({
        imageUrl: uploadRes.image_url,
        result: "Processing...",
        mode: mode 
      });

      setStatus(`Starting ${mode.toUpperCase()} analysis...`);

      // 2. Trigger Specific Analysis
      if (mode === "caption") {
        await analyzeCaption(uploadRes.asset_id);
      } else if (mode === "vqa") {
        await analyzeVQA(uploadRes.asset_id, question);
      } else if (mode === "ocr") {
        await analyzeOCR(uploadRes.asset_id);
      }

      // 3. Poll for Results
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        if (attempts > 20) { 
          clearInterval(interval);
          onError("AI service timed out. Please check history later.");
          setLoading(false);
          return;
        }

        const res = await getAnalysisResult(uploadRes.asset_id, mode);

        if (res.status === "completed") {
          clearInterval(interval);
          
          let finalOutput = "";
          if (mode === "caption") finalOutput = res.result.text;
          else if (mode === "vqa") finalOutput = res.result.answer;
          else if (mode === "ocr") finalOutput = res.result.text;

          onResult({
            imageUrl: uploadRes.image_url,
            result: finalOutput,
            mode: mode
          });
          
          setLoading(false);
          setStatus("");
        }

        if (res.status === "failed") {
          clearInterval(interval);
          onError(res.error || "Analysis failed");
          setLoading(false);
          setStatus("");
        }
      }, 2000); 

    } catch (err: any) {
      console.error(err);
      onError(err.message || "Unexpected error occurred");
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div className="border p-6 rounded-lg space-y-4 bg-white shadow-sm">
      {/* Drop Zone - Added onClick and cursor-pointer */}
      <div
        className="border-dashed border-2 border-gray-300 p-8 rounded-lg text-center hover:bg-gray-50 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <p className="text-gray-500">
          {file ? file.name : "Drag & drop image here or click to browse"}
        </p>
      </div>

      {/* Hidden Input - Added ref */}
      <input
        type="file"
        accept="image/*"
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Analysis Mode Selection */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm text-gray-700">Select Analysis Type</label>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value as AnalysisMode)}
          className="p-2 border rounded bg-white"
        >
          <option value="caption">Image Captioning</option>
          <option value="vqa">Visual Question Answering (VQA)</option>
          <option value="ocr">Text Extraction (OCR)</option>
        </select>
      </div>

      {/* Conditional Question Input */}
      {mode === "vqa" && (
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm text-gray-700">Your Question</label>
          <input
            type="text"
            placeholder="e.g., What color is the car?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2 rounded text-white font-semibold ${
          loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading ? "Processing..." : "Analyze Image"}
      </button>

      {loading && (
        <p className="text-sm text-blue-600 text-center animate-pulse">{status}</p>
      )}
    </div>
  );
}