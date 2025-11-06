'use client'

import { useState } from 'react'

interface UploadExcelStepProps {
  onUploadSuccess: () => void
  onUpload: (file: File) => Promise<void>
  loading: boolean
}

export default function UploadExcelStep({ onUploadSuccess, onUpload, loading }: UploadExcelStepProps) {
  const [excelFile, setExcelFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!excelFile) return
    await onUpload(excelFile)
    setExcelFile(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">📄 Bước 1: Upload File Excel</h2>
        <p className="text-gray-400 mb-6">
          Upload file Excel chứa danh sách sinh viên cần cấp phát văn bằng
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <label className="block text-sm text-gray-300 mb-2">
          Chọn file Excel (.xlsx, .xls)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />
        {excelFile && (
          <p className="text-xs text-gray-400 mt-2">
            📎 {excelFile.name}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleUpload}
          disabled={!excelFile || loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Đang xử lý...' : '📤 Upload Excel'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Lưu ý:</strong> File Excel cần có các cột:
          <br />• Số hiệu văn bằng, MSSV, Họ tên, Email
          <br />• Ngày sinh, Giới tính, Số điện thoại
          <br />• Địa chỉ ví, Lớp, Ngành, GPA
        </p>
      </div>
    </div>
  )
}
