'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function StudentInfoPage() {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [studentId, setStudentId] = useState('')
  const [faculty, setFaculty] = useState('')
  const [schoolCode, setSchoolCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !dob || !phone || !studentId || !faculty || !schoolCode) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    // Gửi dữ liệu về BE hoặc blockchain
    alert('Thông tin sinh viên đã được gửi!')
  }

  return (
    <div className="min-h-screen bg-[#202328] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex justify-center items-center px-4 mt-16">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Thông tin Sinh viên</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block mb-1 text-sm">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
                required
              />
            </div>
            
            {/* Mã trường */}
            <div>
              <label className="block mb-1 text-sm">Mã trường</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
                required
              />
            </div>

            {/* Mã số sinh viên */}
            <div>
              <label className="block mb-1 text-sm">Mã số sinh viên</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
                required
              />
            </div>


            {/* Ngày sinh */}
            <div>
              <label className="block mb-1 text-sm">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
                required
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block mb-1 text-sm">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
                required
              />
            </div>

            {/* Tên khoa */}
            <div>
              <label className="block mb-1 text-sm">Tên khoa</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
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
