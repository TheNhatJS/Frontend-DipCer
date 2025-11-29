"use client";

import { useState, useEffect } from "react";
import { DiplomaDraft } from "@/types/diploma-draft";
import EditDraftModal from "./EditDraftModal";
import DeleteDraftModal from "@/components/diploma-issuance/DeleteDraftModal";
import { toast } from "sonner";

interface DraftsTableStepProps {
  drafts: DiplomaDraft[];
  loading: boolean;
  onEdit: (id: number, data: Partial<DiplomaDraft>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  onRefresh: () => void;
}

export default function DraftsTableStep({
  drafts,
  loading,
  onEdit,
  onDelete,
  onNext,
  onBack,
  onRefresh,
}: DraftsTableStepProps) {
  const [editingDraft, setEditingDraft] = useState<DiplomaDraft | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = (draft: DiplomaDraft) => {
    setEditingDraft(draft);
  };

  const handleSaveEdit = async (data: Partial<DiplomaDraft>) => {
    if (!editingDraft) return;

    try {
      await onEdit(editingDraft.id, data);
      setEditingDraft(null);
      toast.success("Cập nhật bản nháp thành công!");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      toast.success("Xóa bản nháp thành công!");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  const getClassificationBadge = (classification: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      EXCELLENT: {
        label: "Xuất sắc",
        color: "bg-purple-500/20 text-purple-300 border-purple-500/50",
      },
      GOOD: {
        label: "Giỏi",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      },
      CREDIT: {
        label: "Khá",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/50",
      },
      AVERAGE: {
        label: "TB",
        color: "bg-green-500/20 text-green-300 border-green-500/50",
      },
      FAIL: {
        label: "Yếu",
        color: "bg-red-500/20 text-red-300 border-red-500/50",
      },
    };
    const badge = badges[classification] || badges.AVERAGE;
    return (
      <span className={`px-2 py-1 rounded text-xs border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">📋 Bước 1: Quản lý Bản nháp</h2>
        <p className="text-gray-400 mb-6">
          Xem, chỉnh sửa hoặc xóa các bản nháp văn bằng
        </p>
      </div>

      {/* Empty State */}
      {drafts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">Chưa có bản nháp nào</h3>
          <p className="text-gray-400 mb-6">
            Bắt đầu bằng cách tải lên file Excel chứa thông tin sinh viên
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onRefresh}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>Tải lại</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {drafts.length}
              </p>
              <p className="text-sm text-gray-400">Tổng bản nháp</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {drafts.filter((d) => d.imageCID).length}
              </p>
              <p className="text-sm text-gray-400">Đã có ảnh</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {drafts.filter((d) => d.isApproved).length}
              </p>
              <p className="text-sm text-gray-400">Đã phê duyệt</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {drafts.filter((d) => d.isMinted).length}
              </p>
              <p className="text-sm text-gray-400">Đã mint</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">STT</th>
                  <th className="px-4 py-3 text-left font-semibold">MSSV</th>
                  <th className="px-10 py-3 text-left font-semibold">Họ tên</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">SĐT</th>
                  <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngành</th>
                  <th className="px-4 py-3 text-left font-semibold">GPA</th>
                  <th className="px-10 py-3 text-left font-semibold">
                    Xếp loại
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Ảnh</th>
                  <th className="px-10 py-3 text-center font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drafts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Chưa có bản nháp nào. Vui lòng upload file Excel.
                    </td>
                  </tr>
                ) : (
                  drafts.map((draft, index) => (
                    <tr
                      key={draft.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-blue-400">
                        {draft.studentId}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {draft.studentName}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">
                        {draft.studentEmail}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {draft.studentPhone}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {draft.studentClass}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {draft.faculty}
                      </td>
                      <td className="px-4 py-3 font-bold text-yellow-400">
                        {draft.GPA.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {getClassificationBadge(draft.classification)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {draft.imageCID ? (
                          <span className="text-green-400">✅</span>
                        ) : (
                          <span className="text-red-400">❌</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {draft.isMinted ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            Đã mint
                          </span>
                        ) : draft.isApproved ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            Đã duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(draft)}
                            disabled={draft.isMinted || loading}
                            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingId(draft.id)}
                            disabled={
                              draft.isMinted ||
                              loading ||
                              deletingId === draft.id
                            }
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa"
                          >
                            {deletingId === draft.id ? "⏳" : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          {drafts.length > 0 && (
            <p className="text-sm text-gray-400 text-center">
              Hiển thị {drafts.length} bản nháp
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onRefresh}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>Tải lại</span>
            </button>
            <button
              onClick={onNext}
              disabled={drafts.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp theo
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Modal */}
      {deletingId && (
        <DeleteDraftModal
          draftId={deletingId}
          onClose={() => setDeletingId(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
