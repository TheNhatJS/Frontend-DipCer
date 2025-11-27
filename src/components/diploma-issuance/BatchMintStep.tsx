"use client";

import React from "react";
import { DiplomaDraft } from "@/types/diploma-draft";

interface BatchMintStepProps {
  drafts: DiplomaDraft[];
  loading: boolean;
  onMint: () => void;
  onBack: () => void;
}

export default function BatchMintStep({
  drafts,
  loading,
  onMint,
  onBack,
}: BatchMintStepProps) {
  const approvedDrafts = drafts.filter(
    (d: DiplomaDraft) => d.isApproved && !d.isMinted
  );
  const mintedDrafts = drafts.filter((d: DiplomaDraft) => d.isMinted);
  const unapprovedDrafts = drafts.filter(
    (d: DiplomaDraft) => !d.isApproved && !d.isMinted
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          ⛓️ Bước 4: Mint NFT Hàng Loạt
        </h2>
        <p className="text-gray-400 mb-6">
          Cấp phát văn bằng lên blockchain với batch minting
        </p>
      </div>

      {/* Approved Drafts Summary */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Tổng quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {approvedDrafts.length}
            </p>
            <p className="text-sm text-gray-400">Đã phê duyệt</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {mintedDrafts.length}
            </p>
            <p className="text-sm text-gray-400">Đã mint</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {unapprovedDrafts.length}
            </p>
            <p className="text-sm text-gray-400">Chưa phê duyệt</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">
              {drafts.length}
            </p>
            <p className="text-sm text-gray-400">Tổng cộng</p>
          </div>
        </div>
      </div>

      {/* Approved Drafts List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {approvedDrafts.length > 0 ? (
          approvedDrafts.map((draft: DiplomaDraft) => (
            <div
              key={draft.id}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{draft.studentName}</p>
                  <p className="text-sm text-gray-400">
                    MSSV: {draft.studentId} | Serial: {draft.serialNumber}
                  </p>
                  <p className="text-sm text-gray-400">
                    GPA: {draft.GPA} | {draft.classification}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-green-400">🎯 Sẵn sàng mint</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">Không có bản nháp nào đã được phê duyệt</p>
            <p className="text-sm mt-2">
              Vui lòng quay lại bước phê duyệt để chọn bản nháp
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
        >
          ⬅️ Quay lại
        </button>
        <button
          onClick={onMint}
          disabled={approvedDrafts.length === 0 || loading}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Đang mint..." : `⛓️ Mint ${approvedDrafts.length} văn bằng`}
        </button>
      </div>

      {/* Warning */}
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-sm text-amber-300">
          ⚠️ <strong>Lưu ý:</strong> Quá trình mint sẽ:
          <br />• Upload metadata lên IPFS
          <br />• Thực hiện batch mint trên blockchain (cần MetaMask)
          <br />• Lưu thông tin vào database
          <br />• Đánh dấu các bản nháp là đã mint
        </p>
      </div>
    </div>
  );
}
