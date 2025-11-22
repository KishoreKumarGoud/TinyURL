// client/src/components/Toast.jsx
import React from "react";

export default function Toast({ text, kind = "success", onClose }) {
  if (!text) return null;

  const base =
    "fixed right-3 top-10 z-50 rounded-lg px-6 py-3 text-sm shadow transition-all animate-fadein";

  const cls =
    kind === "error"
      ? `${base} bg-red-100 text-red-700 border border-red-100`
      : `${base} bg-emerald-100 text-emerald-800 border border-emerald-100`;

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
