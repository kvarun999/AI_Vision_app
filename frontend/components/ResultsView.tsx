export default function ResultsView({
  imageUrl,
  result,
  mode
}: {
  imageUrl: string;
  result: string;
  mode?: string;
}) {
  // Updated to handle generation modes
  const getTitle = () => {
    if (mode === "vqa") return "Answer";
    if (mode === "ocr") return "Extracted Text";
    if (mode === "text-to-image" || mode === "variation" || mode === "generation") {
      return "Generation Details";
    }
    return "Caption"; // Default fallback
  };

  // Ensure we have an image URL before trying to render the img tag
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in duration-500">
      {/* Image Preview */}
      <div className="border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center bg-checkered font-mono text-sm text-gray-400 min-h-[300px]">
        <img
          src={imageUrl}
          alt="AI Result"
          className="max-w-full max-h-[500px] object-contain shadow-sm"
          // Add an error handler just in case the URL is bad
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerText = 'Failed to load image. Check URL or permissions.';
          }}
        />
      </div>

      {/* Analysis Result */}
      <div className="flex flex-col space-y-3">
        <div className="bg-gray-100 p-5 rounded-lg h-full overflow-auto max-h-[500px]">
          <h3 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2 sticky top-0 bg-gray-100">
            {getTitle()}
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
            {result}
          </p>
        </div>
      </div>
    </div>
  );
}