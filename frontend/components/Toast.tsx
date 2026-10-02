"use client";

export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
      {message}
      <button
        className="ml-4 underline"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
