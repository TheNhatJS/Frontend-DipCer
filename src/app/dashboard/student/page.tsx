'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [certificates, setCertificates] = useState<any[]>([])

  useEffect(() => {
    setStudentInfo({
      id: 'SV001',
      name: 'Nguyễn Văn Aádfasdfasdfasdfawer dài quá dài quá dài quá',
      dayOfBirth: '2003-05-15',
      phone: '0987654321',
      courseName: 'Công nghệ thông tin',
      institution: {
        code: 'DAUKT',
        name: 'Đại học Kiến Trúc Đà Nẵng',
      },
      addressWallet: '0x5bD...0F72',
    })

    setCertificates(
      Array(8).fill(0).map((_, i) => ({
        tokenId: i + 1,
        degree: i % 2 === 0 ? 'Cử nhân Công nghệ thông tin' : 'Chứng chỉ Blockchain cơ bản',
        issuedAt: i % 2 === 0 ? '2025-07-01' : '2025-08-12',
        issuedBy: i % 2 === 0 ? 'Đại học Kiến Trúc Đà Nẵng' : 'Trung tâm Công nghệ SDC',
        image: i % 2 === 0 ? '/diploma-example.png' : '/certificate-example.png',
      }))
    )
  }, [])

  return (
    <div className="min-h-screen text-white">
      <Header
        name={studentInfo?.name}
        onLogout={() => {
          alert('Đã đăng xuất!')
          window.location.href = '/auth/login'
        }}
      />

      <main className="pt-[80px] pb-[80px] px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">🎓 Thông tin sinh viên</h2>

        {studentInfo && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Thông tin sinh viên */}
            <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur">
              <div className="space-y-2 text-sm text-gray-200">
                <p><strong>👤 Họ tên:</strong> <span className="block truncate">{studentInfo.name}</span></p>
                <p><strong>🎂 Ngày sinh:</strong> {studentInfo.dayOfBirth}</p>
                <p><strong>📞 SĐT:</strong> {studentInfo.phone}</p>
                <p><strong>🆔 Mã số SV:</strong> <span className="font-mono">{studentInfo.id}</span></p>
                <p><strong>🏫 Khoa:</strong> {studentInfo.courseName}</p>
                <p><strong>🎓 Trường:</strong> {studentInfo.institution.name}</p>
                <p><strong>💼 Ví:</strong> <span className="font-mono text-blue-400">{studentInfo.addressWallet}</span></p>
              </div>
            </div>

            {/* Thống kê */}
            <div className="flex-1 sm:w-60 bg-white/5 p-6 rounded-2xl border border-white/10 text-center flex flex-col justify-center items-center shadow-md">
              <p className="text-6xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {certificates.length}
              </p>
              <p className="text-gray-300 mt-2">Văn bằng đã nhận</p>
            </div>
          </div>
        )}

        {/* Danh sách văn bằng */}
        <h2 className="text-3xl font-bold mb-4">📜 Văn bằng đã nhận</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div key={cert.tokenId} className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow hover:shadow-lg transition-all">
              <Image
                src={cert.image}
                alt="Certificate"
                width={400}
                height={200}
                className="rounded mb-3 w-full h-48 object-cover"
              />
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>🎓 Văn bằng:</strong> {cert.degree}</p>
                <p><strong>🏫 Đơn vị cấp:</strong> {cert.issuedBy}</p>
                <p><strong>📅 Ngày cấp:</strong> {cert.issuedAt}</p>
                <a
                  href={`https://sepolia.etherscan.io/token/0xYourContract?a=${cert.tokenId}`}
                  className="text-blue-400 hover:underline block pt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Xem trên Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
