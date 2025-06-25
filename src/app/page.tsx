'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import SlideSelection from '@/components/Home/slide'
import Features from '@/components/Home/feature'
import Process from '@/components/Home/process'
import { toast, Toaster } from 'sonner'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react' // 👈 Import hàm signOut

export default function Home() {
  const [tokenId, setTokenId] = useState('')
  const [certificateData, setCertificateData] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [studentInfo, setStudentInfo] = useState<any>(null)

  const searchSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        console.log("session: ", session)
        if (session && session.user?.role === "STUDENT") {
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

        }

      } catch (error: any) {
        console.error("Lỗi:", error)
        toast.error(error.message || "Đã xảy ra lỗi")
      }

    }
    fetchData()
  }, [])

  const handleSearch = async () => {
    if (tokenId === '1') {
      setCertificateData({
        name: 'Nguyễn Văn A',
        degree: 'Cử nhân Công nghệ thông tin',
        issuedBy: 'Đại học Kiến Trúc Đà Nẵng',
        issuedAt: '01/07/2025',
        image: '/diploma-example.png',
      })
      setShowModal(true)
    } else {
      setCertificateData(null)
      setShowModal(false)

      toast.error('Không tìm thấy văn bằng với Token ID này!')

    }
  }

  const scrollToSearch = () => {
    setTimeout(() => {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#202328] text-white relative">
      <Header
        name={studentInfo?.name}
        onLogout={async () => {
          await signOut({
            callbackUrl: '/' // 👈 Redirect về home sau khi đăng xuất
          })
        }}
      />

      <Toaster position="top-right" richColors />

      {/* Slide */}
      <SlideSelection onScrollToSearch={scrollToSearch} />

      {/* Features */}
      <Features />

      {/* Search Section */}
      <div ref={searchSectionRef}>
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-800 to-slate-900 text-center py-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
            Xác thực văn bằng{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              dễ dàng
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Nhà tuyển dụng có thể kiểm tra nhanh chóng tính xác thực của văn bằng chỉ bằng cách nhập ID.
            Thông tin được xác minh trực tiếp trên blockchain, đảm bảo độ tin cậy tuyệt đối.
          </p>

          <div className="flex flex-col gap-6 backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8 w-full max-w-md text-center hover:shadow-[0_10px_25px_rgba(56,182,255,0.2)] transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white">Tra cứu văn bằng</h3>
            <input
              type="text"
              placeholder="Nhập Token ID..."
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 rounded-xl transition duration-200 shadow hover:scale-105"
            >
              Tra cứu
            </button>
          </div>
        </section>
      </div>



      {/* Process Section */}
      <Process />

      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"> chuyển đổi số</span>
            <br /> hệ thống văn bằng của bạn?
          </h2>
        </div>
      </section>

      {/* Modal */}
      {showModal && certificateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1F2227] text-white rounded-2xl shadow-2xl overflow-hidden w-[90%] max-w-3xl flex flex-col sm:flex-row">
            <div className="sm:w-1/2 relative h-64 sm:h-auto">
              <Image
                src={certificateData.image}
                alt="Diploma Image"
                fill
                className="object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
              />
            </div>
            <div className="sm:w-1/2 p-6 flex flex-col justify-between gap-2">
              <div className='flex flex-col gap-2'>
                <h3 className="text-xl font-bold text-indigo-400 mb-3">
                  Thông tin văn bằng
                </h3>
                <p className="mb-1"><strong>Họ tên:</strong> {certificateData.name}</p>
                <p className="mb-1"><strong>Văn bằng:</strong> {certificateData.degree}</p>
                <p className="mb-1"><strong>Đơn vị cấp:</strong> {certificateData.issuedBy}</p>
                <p className="mb-1"><strong>Ngày cấp:</strong> {certificateData.issuedAt}</p>
                <a
                  href={`https://sepolia.etherscan.io/token/0xYourContractAddress?a=${tokenId}`}
                  target="_blank"
                  className="mt-3 text-sm text-blue-400 hover:underline text-left"
                  rel="noopener noreferrer"
                >
                  Xem trên Etherscan
                </a>
              </div>
              <div className="mt-6 flex flex-col items-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
