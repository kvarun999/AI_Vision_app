"use client";

import { useState } from "react";
import Link from "next/link";
import GenerateForm from "@/components/GenerationForm";
import ResultsView from "@/components/ResultsView";
import Toast from "@/components/Toast";

export default function GeneratePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Image Generation Studio</h1>
        <Link href="/" className="text-sm font-medium hover:underline">
          ← Back to Home
        </Link>
      </div>

      <GenerateForm
        onResult={setData}
        onError={setError}
      />

      {data && (
        <ResultsView
          imageUrl={data.imageUrl}
          result={data.result}
          mode={data.mode}
        />
      )}

      <Toast message={error} onClose={() => setError("")} />
    </main>
  );
}