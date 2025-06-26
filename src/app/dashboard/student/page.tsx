'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import Contract from '@/data/abi.contract.json'
import axios from 'axios'

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [diplomas, setDiplomas] = useState<any[]>([])
  const [selectedDip, setSelectedDip] = useState<any | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        if (!session || session.user.role !== "STUDENT") {
          router.push("/")
          return
        }

        const studentId = session.user.roleId
        if (!studentId) return toast.error("Không tìm thấy mã số sinh viên!")

        const res = await fetch(`http://localhost:8080/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Lỗi khi lấy thông tin sinh viên")
        setStudentInfo(data)

        // Lấy dữ liệu văn bằng từ Smart Contract
        const provider: any = await detectEthereumProvider()
        if (!provider) return toast.error('Không tìm thấy MetaMask')

        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

        const studentAddress = data.addressWallet
        const diplomas = await contract.getReceivedDiplomas(studentAddress)

        const formattedCerts = await Promise.all(
          diplomas.map(async (d: any) => {
            try {
              const tokenId = Number(d.tokenID)
              const tokenURI = await contract.tokenURI(tokenId)
              const metadata = (await axios.get(tokenURI)).data

              return {
                tokenId,
                degree: metadata.classification || 'Không rõ',
                issuedAt: new Date(Number(d.issueDate) * 1000).toLocaleDateString('vi-VN'),
                issuedBy: d.issuer,
                image: metadata.image
              }
            } catch (err) {
              console.warn(`Lỗi token ${d.tokenID}:`, err)
              return null
            }
          })
        )

        setDiplomas(formattedCerts.filter(Boolean))
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
          await signOut({ callbackUrl: '/' })
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
                {diplomas.length}
              </p>
              <p className="text-gray-300 mt-2">Văn bằng đã nhận</p>
            </div>
          </div>
        )}

        {/* Danh sách văn bằng */}
        <h2 className="text-3xl font-bold mb-4">📜 Văn bằng đã nhận</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {diplomas.map((dip) => (
            <div
              key={dip.tokenId}
              onClick={() => setSelectedDip(dip)}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow hover:shadow-lg transition-all"
            >
              <Image
                src={dip.image}
                alt="Diploma"
                width={400}
                height={200}
                className="rounded mb-3 w-full h-48 object-cover"
              />
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>🎓 Văn bằng:</strong> {dip.degree}</p>
                <p><strong>🏫 Đơn vị cấp:</strong> {dip.issuedBy}</p>
                <p><strong>📅 Ngày cấp:</strong> {dip.issuedAt}</p>
                <a
                  href={`https://sepolia.etherscan.io/token/${Contract.address}?a=${dip.tokenId}`}
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
        {selectedDip && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-slate-800 text-white max-w-lg h-3/5 w-full p-6 rounded-xl border border-white/20 shadow-xl relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl"
                onClick={() => setSelectedDip(null)}
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4">Chi tiết văn bằng</h2>

              <Image
                src={selectedDip.image}
                alt="Chi tiết văn bằng"
                width={500}
                height= {400}
                className="w-full object-cover rounded-lg mb-4"
              />

              <div className="text-sm space-y-2 text-gray-300">
                <p><strong>🎓 Văn bằng:</strong> {selectedDip.degree}</p>
                <p><strong>🏫 Đơn vị cấp:</strong> {selectedDip.issuedBy}</p>
                <p><strong>📅 Ngày cấp:</strong> {selectedDip.issuedAt}</p>
                <p>
                  <strong>🔗 Etherscan:</strong>{' '}
                  <a
                    href={`https://sepolia.etherscan.io/token/${Contract.address}?a=${selectedDip.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Xem chi tiết
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
