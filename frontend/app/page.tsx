import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          AI Vision Platform
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Select a workspace to begin
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Analyze */}
          <Link href="/upload" className="group">
            <div className="bg-white border p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-center space-y-4 cursor-pointer group-hover:-translate-y-1">
              <div className="bg-blue-50 p-4 rounded-full group-hover:bg-blue-100 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Analyze Images</h2>
              <p className="text-gray-500">
                Captioning, Visual Q&A, and OCR Text Extraction
              </p>
            </div>
          </Link>

          {/* Option 2: Generate */}
          <Link href="/generate" className="group">
            <div className="bg-white border p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-center space-y-4 cursor-pointer group-hover:-translate-y-1">
              <div className="bg-purple-50 p-4 rounded-full group-hover:bg-purple-100 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Images</h2>
              <p className="text-gray-500">
                Text-to-Image Creation and AI Variations
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}