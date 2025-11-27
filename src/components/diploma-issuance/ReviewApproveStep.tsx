"use client";

import React, { useState } from "react";
import { DiplomaDraft } from "@/types/diploma-draft";

interface ReviewApproveStepProps {
  drafts: DiplomaDraft[];
  selectedDrafts: number[];
  loading: boolean;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onApprove: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ReviewApproveStep({
  drafts,
  selectedDrafts,
  loading,
  onToggleSelection,
  onSelectAll,
  onApprove,
  onNext,
  onBack,
}: ReviewApproveStepProps) {
  const [previewDraft, setPreviewDraft] = useState<DiplomaDraft | null>(null);

  // Check if all drafts with images are approved
  const draftsWithImages = drafts.filter(
    (d: DiplomaDraft) => !d.isMinted && d.imageCID
  );
  const unapprovedDrafts = draftsWithImages.filter(
    (d: DiplomaDraft) => !d.isApproved
  );
  const allApproved =
    draftsWithImages.length > 0 && unapprovedDrafts.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          ✅ Bước 3: Phê Duyệt Bản Nháp
        </h2>
        <p className="text-gray-400 mb-6">
          Kiểm tra và phê duyệt các bản nháp trước khi mint
        </p>
      </div>

      {/* All Approved State */}
      {allApproved ? (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold mb-2 text-green-400">
              Tất cả bản nháp đã được phê duyệt!
            </h3>
            <p className="text-gray-400 mb-4">
              Có {draftsWithImages.length} bản nháp đã sẵn sàng để mint
            </p>
          </div>

          {/* Preview Approved Drafts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              📋 Danh sách bản nháp đã phê duyệt:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {draftsWithImages.map((draft: DiplomaDraft) => (
                <div
                  key={draft.id}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all cursor-pointer"
                  onClick={() => setPreviewDraft(draft)}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {draft.imageCID && (
                      <img
                        src={draft.imageCID}
                        alt={draft.studentName}
                        className="w-20 h-20 object-cover rounded-lg border border-green-500/50"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {draft.studentName}
                      </p>
                      <p className="text-sm text-gray-400">
                        MSSV: {draft.studentId}
                      </p>
                      <p className="text-sm text-gray-400">
                        Serial: {draft.serialNumber}
                      </p>
                      <p className="text-sm text-green-400">
                        GPA: {draft.GPA} - {draft.classification}
                      </p>
                    </div>

                    {/* Badge */}
                    <div className="text-green-400 text-xl">✓</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              💡 Click vào bản nháp để xem chi tiết
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
            >
              ⬅️ Quay lại
            </button>
            <button
              onClick={onNext}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform"
            >
              Tiếp theo ➡️
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Draft List - Need Approval */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Chọn bản nháp để phê duyệt
              </h3>
              <button
                onClick={onSelectAll}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
              >
                {selectedDrafts.length === unapprovedDrafts.length
                  ? "❌ Bỏ chọn tất cả"
                  : "✅ Chọn tất cả"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {drafts
                .filter((d: DiplomaDraft) => !d.isMinted)
                .map((draft: DiplomaDraft) => (
                  <div
                    key={draft.id}
                    onClick={() =>
                      !draft.isApproved &&
                      draft.imageCID &&
                      onToggleSelection(draft.id)
                    }
                    className={`p-4 rounded-lg border transition-all ${
                      draft.isApproved
                        ? "bg-green-500/10 border-green-500/50 cursor-default"
                        : !draft.imageCID
                        ? "bg-red-500/10 border-red-500/50 cursor-not-allowed opacity-50"
                        : selectedDrafts.includes(draft.id)
                        ? "bg-blue-500/20 border-blue-500 cursor-pointer"
                        : "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {draft.imageCID ? (
                        <img
                          src={draft.imageCID}
                          alt={draft.studentName}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDraft(draft);
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                          ❌
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-semibold">{draft.studentName}</p>
                        <p className="text-sm text-gray-400">
                          MSSV: {draft.studentId}
                        </p>
                        <p className="text-sm text-gray-400">
                          GPA: {draft.GPA} | {draft.classification}
                        </p>
                        <div className="mt-1 space-y-1">
                          {draft.imageCID ? (
                            <span className="text-green-400 text-xs">
                              ✅ Có ảnh
                            </span>
                          ) : (
                            <span className="text-red-400 text-xs">
                              ❌ Chưa có ảnh
                            </span>
                          )}
                          {draft.isApproved && (
                            <span className="text-green-400 text-xs block">
                              🎯 Đã phê duyệt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Đã chọn: {selectedDrafts.length} bản nháp | Chưa phê duyệt:{" "}
              {unapprovedDrafts.length} | Đã phê duyệt:{" "}
              {draftsWithImages.length - unapprovedDrafts.length}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
            >
              ⬅️ Quay lại
            </button>
            <button
              onClick={onApprove}
              disabled={selectedDrafts.length === 0 || loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "⏳ Đang xử lý..."
                : `✅ Phê duyệt (${selectedDrafts.length})`}
            </button>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewDraft && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDraft(null)}
        >
          <div
            className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">🎓 Chi tiết văn bằng</h2>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              {previewDraft.imageCID && (
                <div className="text-center">
                  <img
                    src={previewDraft.imageCID}
                    alt={previewDraft.studentName}
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-white/20 shadow-lg"
                  />
                </div>
              )}

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Họ và tên</label>
                    <p className="text-lg font-semibold">
                      {previewDraft.studentName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">MSSV</label>
                    <p className="font-mono">{previewDraft.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-sm">{previewDraft.studentEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">
                      Số điện thoại
                    </label>
                    <p>{previewDraft.studentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ngày sinh</label>
                    <p>
                      {new Date(
                        previewDraft.studentDayOfBirth
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Số serial</label>
                    <p className="font-mono">{previewDraft.serialNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Lớp</label>
                    <p>{previewDraft.studentClass}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Khoa</label>
                    <p>{previewDraft.faculty}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">GPA</label>
                    <p className="text-xl font-bold text-blue-400">
                      {previewDraft.GPA}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Xếp loại</label>
                    <p className="text-lg font-semibold text-green-400">
                      {previewDraft.classification}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm text-gray-400">Địa chỉ</label>
                <p>{previewDraft.studentAddress}</p>
              </div>

              {/* Status */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                {previewDraft.imageCID && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg">
                    ✅ Đã có ảnh
                  </span>
                )}
                {previewDraft.isApproved && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg">
                    🎯 Đã phê duyệt
                  </span>
                )}
                {previewDraft.isMinted && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg">
                    ⛓️ Đã mint
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 text-center">
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
