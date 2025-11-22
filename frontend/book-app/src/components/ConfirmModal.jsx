import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-100"
        onClick={onCancel}
      />

      <div className="relative w-[92%] max-w-md rounded-2xl border border-slate-700 bg-slate-950 px-5 py-5 shadow-2xl animate-[fadeIn_.18s_ease-out]">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${
              danger
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-sky-500/40 bg-sky-500/10 text-sky-300"
            }`}
          >
            <FiAlertTriangle />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">{message}</p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onCancel}
                className="h-9 rounded-lg border border-slate-700 px-3 text-xs text-slate-200 hover:bg-slate-900"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`h-9 rounded-lg px-3 text-xs font-semibold shadow-sm ${
                  danger
                    ? "border border-red-500/40 bg-red-500/90 text-white hover:bg-red-500"
                    : "border border-sky-500/40 bg-sky-500/90 text-slate-950 hover:bg-sky-500"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
