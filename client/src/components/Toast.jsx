// client/src/components/Toast.jsx
import React from "react";

export default function Toast({ text, kind = "success", onClose }) {
  if (!text) return null;

  const base =
    "fixed right-4 bottom-6 z-50 rounded-lg px-4 py-2 text-sm shadow transition-all animate-fadein";

  const cls =
    kind === "error"
      ? `${base} bg-red-50 text-red-700 border border-red-100`
      : `${base} bg-emerald-50 text-emerald-800 border border-emerald-100`;

  return (
    <div className={cls} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="truncate">{text}</div>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
