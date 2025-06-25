'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { getSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react' // 👈 Import hàm signOut

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [certificates, setCertificates] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        console.log("session: ", session)
        if (!session || session.user.role !== "STUDENT") {
          router.push("/") // 👈 Hoạt động đúng trong client component
          return
        }

        const studentId = session.user.roleId
        console.log("studentId: ", studentId)

        if (!studentId) return toast.error("Không tìm thấy mã số sinh viên!")

        const res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await res.json()
        console.log("data: ", data)

        if (!res.ok) throw new Error(data.message || "Lỗi khi lấy thông tin sinh viên")

        setStudentInfo(data)

        // Tạm thời giả lập certificates
        setCertificates([
          {
            tokenId: 1,
            degree: 'Cử nhân Công nghệ thông tin',
            issuedAt: '2025-07-01',
            issuedBy: '0xa496ac5d91315413Ad38e56f0f3c600794231371',
            image: '/img/mau-moi-bang-dai-hoc.jpg',
          }
        ])
      } catch (error: any) {
        console.error("Lỗi:", error)
        toast.error(error.message || "Đã xảy ra lỗi")
      }
    }


    fetchData()
  }, [])


  return (
    <div className="min-h-screen text-white">
      <Header
        name={studentInfo?.name}
        onLogout={async () => {
          await signOut({
            callbackUrl: '/' // 👈 Redirect về home sau khi đăng xuất
          })
        }}
      />

      <main className="pt-[80px] pb-[80px] px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">🎓 Thông tin sinh viên</h2>

        {studentInfo && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Thông tin sinh viên */}
            <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur">
              <div className="space-y-2 text-sm text-gray-200">
                <p><strong>👤 Họ tên: </strong>{studentInfo.name}</p>
                <p><strong>🏫 Khoa:</strong> {studentInfo.courseName}</p>
                <p><strong>🎓 Mã trường:</strong> {studentInfo.institutionCode}</p>
                <p><strong>🎂 Ngày sinh:</strong> {studentInfo.dayOfBirth ? new Date(studentInfo.dayOfBirth).toLocaleDateString('vi-VN') : 'Không có'}</p>
                <p><strong>📞 SĐT:</strong> {studentInfo.phone}</p>
                <p><strong>🆔 Mã số SV:</strong> <span className="font-mono">{studentInfo.id}</span></p>
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
