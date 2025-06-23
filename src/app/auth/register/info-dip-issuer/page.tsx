'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function IssuerInfoPage() {
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolCode || !schoolName) {
      alert('Vui lòng điền đầy đủ thông tin trường!')
      return
    }

    // Gửi thông tin về BE hoặc lưu blockchain
    alert('Đã gửi thông tin trường cấp bằng!')
  }

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Header />

      <main className="flex-1 flex justify-center items-center px-4">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Thông tin Trường cấp bằng</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm">Mã trường</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-4 py-2 bg-[#292C33]/70 border border-gray-600 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tên trường</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2 bg-[#292C33]/70 border border-gray-600 rounded-lg"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl"
            >
              Gửi thông tin
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
