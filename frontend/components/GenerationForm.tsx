"use client";

import { useState, useRef } from "react";
import { generateTextToImage, generateVariation, getGenerationJob, uploadImage } from "@/lib/api";

type GenMode = "text-to-image" | "variation";

export default function GenerateForm({
  onResult,
  onError,
}: {
  onResult: (data: any) => void;
  onError: (msg: string) => void;
}) {
  async function waitForGeneration(jobId: string) {
    for (;;) {
      const job = await getGenerationJob(jobId);
      if (job.status === "success") return job.result;
      if (job.status === "failure" || job.status === "revoked") {
        throw new Error(job.error || "Generation failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const [mode, setMode] = useState<GenMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!prompt.trim()) {
      onError("Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
      if (mode === "text-to-image") {
        // 1. Text to Image Flow
        const queued = await generateTextToImage(prompt);
        const res = await waitForGeneration(queued.job_id);
        onResult({
          imageUrl: res.image_url,
          result: `Generated from: "${prompt}"`,
          mode: "generation"
        });
      } else {
        // 2. Variation Flow
        if (!file) {
          onError("Please upload an image for variation");
          setLoading(false);
          return;
        }

        // First upload the reference image
        const uploadRes = await uploadImage(file);
        
        // Then request variation
        const queued = await generateVariation(uploadRes.image_url, prompt);
        const varRes = await waitForGeneration(queued.job_id);
        
        onResult({
          imageUrl: varRes.image_url,
          result: `Variation based on upload: "${prompt}"`,
          mode: "generation"
        });
      }
    } catch (err: any) {
      onError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border p-6 rounded-lg space-y-4 bg-white shadow-sm">
      {/* Mode Selection */}
      <div className="flex gap-4 border-b pb-4">
        <button
          onClick={() => setMode("text-to-image")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            mode === "text-to-image" 
              ? "bg-black text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Text to Image
        </button>
        <button
          onClick={() => setMode("variation")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            mode === "variation" 
              ? "bg-black text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Image Variation
        </button>
      </div>

      {/* Variation Image Upload */}
      {mode === "variation" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-dashed border-2 border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <p className="text-gray-500 text-sm">
            {file ? file.name : "Click to upload reference image"}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {mode === "text-to-image" ? "Image Description" : "Variation Instructions"}
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={mode === "text-to-image" 
            ? "A cyberpunk city with flying cars..." 
            : "Make it look like a pencil sketch..."}
          className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Generating..." : "Generate Art"}
      </button>
    </div>
  );
}
