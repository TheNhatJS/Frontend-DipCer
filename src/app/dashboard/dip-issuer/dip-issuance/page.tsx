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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
          🎓 Cấp phát văn bằng
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* MSSV */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Mã số sinh viên</label>
            <input
              type="text"
              placeholder="VD: SV001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>

          {/* File upload */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Tải ảnh văn bằng</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files?.[0] || null })
              }
              className="text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl text-lg font-semibold transition transform hover:scale-105"
          >
            Cấp phát
          </button>
        </form>
      </div>
    </div>
  )
}
