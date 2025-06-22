'use client'

import { useState } from 'react'

export default function IssueCertificatePage() {
  const [formData, setFormData] = useState({
    studentId: '',
    image: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId || !formData.image) {
      alert('Vui lòng nhập MSSV và chọn ảnh văn bằng.')
      return
    }

    alert(`✅ Đã cấp phát văn bằng cho MSSV: ${formData.studentId}`)
    setFormData({ studentId: '', image: null })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#202328] text-white px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Cấp phát văn bằng</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* MSSV */}
          <input
            type="text"
            placeholder="Mã số sinh viên"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="px-4 py-2 rounded bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none"
            required
          />

          {/* File upload */}
          <label className="text-sm text-gray-300">Chọn ảnh văn bằng:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files?.[0] || null })
            }
            className="text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition shadow hover:scale-105"
          >
            Cấp phát
          </button>
        </form>
      </div>
    </div>
  )
}
