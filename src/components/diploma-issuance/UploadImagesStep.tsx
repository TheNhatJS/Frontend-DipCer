'use client'

import { useState } from 'react'
import { DiplomaDraft } from '@/types/diploma-draft'

interface UploadImagesStepProps {
  drafts: DiplomaDraft[]
  loading: boolean
  uploadProgress: number
  onUpload: (files: File[], draftIds: number[]) => Promise<void>
  onNext: () => void
  onBack: () => void
}

export default function UploadImagesStep({
  drafts,
  loading,
  uploadProgress,
  onUpload,
  onNext,
  onBack,
}: UploadImagesStepProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([])

  const toggleDraftSelection = (id: number) => {
    setSelectedDrafts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAllDrafts = () => {
    const availableDrafts = drafts.filter(d => !d.isMinted && !d.imageCID)
    if (selectedDrafts.length === availableDrafts.length) {
      setSelectedDrafts([])
    } else {
      setSelectedDrafts(availableDrafts.map(d => d.id))
    }
  }

  const handleUpload = async () => {
    await onUpload(imageFiles, selectedDrafts)
    setImageFiles([])
    setSelectedDrafts([])
  }

  // Check if all drafts have images
  const draftsNeedingImages = drafts.filter(d => !d.isMinted && !d.imageCID)
  const allDraftsHaveImages = draftsNeedingImages.length === 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">🖼️ Bước 2: Upload Ảnh Văn Bằng</h2>
        <p className="text-gray-400 mb-6">
          Upload ảnh văn bằng cho các bản nháp đã tạo
        </p>
      </div>

      {/* All Images Uploaded State */}
      {allDraftsHaveImages ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-semibold mb-2 text-green-400">Tất cả bản nháp đã có ảnh!</h3>
          <p className="text-gray-400 mb-6">
            Có {drafts.filter(d => d.imageCID).length} bản nháp đã upload ảnh thành công
          </p>
          
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
          {/* Draft Selection */}
          <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chọn bản nháp cần upload ảnh</h3>
          <button
            onClick={selectAllDrafts}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            {selectedDrafts.length === drafts.filter(d => !d.isMinted && !d.imageCID).length
              ? '❌ Bỏ chọn tất cả'
              : '✅ Chọn tất cả'}
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {drafts.filter(d => !d.isMinted).map((draft) => (
            <div
              key={draft.id}
              onClick={() => !draft.imageCID && toggleDraftSelection(draft.id)}
              className={`p-4 rounded-lg border transition-all ${
                draft.imageCID
                  ? 'bg-green-500/10 border-green-500/50 cursor-default'
                  : selectedDrafts.includes(draft.id)
                  ? 'bg-blue-500/20 border-blue-500 cursor-pointer'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{draft.studentName}</p>
                  <p className="text-sm text-gray-400">
                    MSSV: {draft.studentId} | Serial: {draft.serialNumber}
                  </p>
                </div>
                <div className="text-right">
                  {draft.imageCID ? (
                    <span className="text-green-400">✅ Đã có ảnh</span>
                  ) : (
                    <span className="text-yellow-400">⚠️ Chưa có ảnh</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-400 mt-2">
          Đã chọn: {selectedDrafts.length} bản nháp
        </p>
      </div>

      {/* Naming Guide */}
      <div className="max-w-3xl mx-auto mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="font-semibold text-blue-300 mb-2">📋 Quy tắc đặt tên file ảnh:</h4>
        <p className="text-sm text-gray-300 mb-2">
          Tên file (không tính extension) phải khớp <strong>chính xác</strong> với MSSV hoặc Serial Number:
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-green-400 mb-1">✅ Đúng:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>20241234.jpg (theo MSSV)</li>
              <li>HUST-2024-001.png (theo Serial)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-red-400 mb-1">❌ Sai:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>TEST01.jpg</li>
              <li>image1.jpg</li>
            </ul>
          </div>
        </div>
        
        {/* Show selected drafts info */}
        {selectedDrafts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="font-semibold text-blue-300 mb-2">
              📌 Bản nháp đã chọn (đặt tên file theo MSSV hoặc Serial):
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {drafts
                .filter(d => selectedDrafts.includes(d.id))
                .map((draft) => (
                  <p key={draft.id} className="text-xs text-gray-400">
                    • <span className="text-yellow-300">{draft.studentId}</span> hoặc{' '}
                    <span className="text-yellow-300">{draft.serialNumber}</span>
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Chọn ảnh văn bằng
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="w-full text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />
        {imageFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-400">📎 Đã chọn {imageFiles.length} ảnh:</p>
            {imageFiles.slice(0, 5).map((file, idx) => (
              <p key={idx} className="text-xs text-gray-500">• {file.name}</p>
            ))}
            {imageFiles.length > 5 && (
              <p className="text-xs text-gray-500">... và {imageFiles.length - 5} ảnh khác</p>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {uploadProgress}% hoàn thành
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
        >
          ⬅️ Quay lại
        </button>
        <button
          onClick={handleUpload}
          disabled={imageFiles.length === 0 || selectedDrafts.length === 0 || loading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Đang upload...' : '📤 Upload Ảnh'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Lưu ý:</strong> Quy tắc đặt tên file ảnh:
          <br />• Theo MSSV: <code className="bg-black/20 px-1 rounded">20241234.jpg</code>
          <br />• Theo Serial Number: <code className="bg-black/20 px-1 rounded">HUST-2024-001.jpg</code>
        </p>
      </div>
        </>
      )}
    </div>
  )
}
