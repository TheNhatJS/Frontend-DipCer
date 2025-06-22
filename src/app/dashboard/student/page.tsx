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
    <div className="min-h-screen bg-[#202328] text-white">
        <Header
          name={studentInfo?.name}
          onLogout={() => {
            alert('Đã đăng xuất!')
            window.location.href = '/auth/login'
          }}
        />

      {/* Nội dung chính */}
      <main className="pt-[80px] pb-[80px] px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Thông tin sinh viên</h2>

        {studentInfo && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Thông tin sinh viên */}
            <div className="flex-1 bg-white/5 p-4 rounded-lg border border-white/10">
              <p><strong>Họ tên:</strong> {studentInfo.name}</p>
              <p><strong>Ngày sinh:</strong> {studentInfo.dayOfBirth}</p>
              <p><strong>SĐT:</strong> {studentInfo.phone}</p>
              <p><strong>Mã số SV:</strong> {studentInfo.id}</p>
              <p><strong>Khoa:</strong> {studentInfo.courseName}</p>
              <p><strong>Trường:</strong> {studentInfo.institution.name}</p>
              <p><strong>Ví:</strong> {studentInfo.addressWallet}</p>
            </div>

            {/* Thống kê văn bằng */}
            <div className="flex-1 sm:w-60 bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col justify-center items-center text-center">
              <p className="text-6xl font-bold text-green-400">{certificates.length}</p>
              <p className="text-sm text-gray-300">Văn bằng đã nhận</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Văn bằng đã nhận</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.tokenId} className="bg-white/5 border border-white/10 p-4 rounded-xl shadow">
              <Image
                src={cert.image}
                alt="Certificate"
                width={400}
                height={200}
                className="rounded mb-3"
              />
              <p><strong>Văn bằng:</strong> {cert.degree}</p>
              <p><strong>Đơn vị cấp:</strong> {cert.issuedBy}</p>
              <p><strong>Ngày cấp:</strong> {cert.issuedAt}</p>
              <a
                href={`https://sepolia.etherscan.io/token/0xYourContract?a=${cert.tokenId}`}
                className="text-blue-400 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem trên Etherscan
              </a>
            </div>
          ))}
        </div>
      </main>

        <Footer />
    </div>
  )
}
