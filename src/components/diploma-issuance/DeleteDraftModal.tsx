"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteDraftModalProps {
  draftId: number;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}

export default function DeleteDraftModal({
  draftId,
  onClose,
  onDelete,
}: DeleteDraftModalProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(draftId);
      onClose();
    } catch (error) {
      console.error("Error deleting draft:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ❌ Xóa bản nháp
        </h2>
        <p className="text-gray-300 mb-6">
          Bạn có chắc chắn muốn xóa bản nháp này? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 rounded-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}