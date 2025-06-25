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
import { ethers } from 'ethers'
import Contract from '@/data/abi.contract.json' // Đảm bảo ABI có hàm getDiploma
import detectEthereumProvider from '@metamask/detect-provider'
import axios from 'axios'
import getIpfsUrlFromPinata from './api/upload/image/utils'

export default function Home() {
  const [tokenId, setTokenId] = useState('')
  const [diplomaData, setDiplomaData] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [studentInfo, setStudentInfo] = useState<any>(null)

  const searchSectionRef = useRef<HTMLDivElement>(null)

  function formatDate(epoch: any): string {
    try {
      // Xử lý nếu là BigInt
      const time = typeof epoch === 'bigint' ? Number(epoch) : parseInt(epoch);
      const date = new Date(time * 1000);
      return isNaN(date.getTime()) ? 'Không rõ' : date.toLocaleDateString('vi-VN');
    } catch {
      return 'Không rõ';
    }
  }




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
    try {
      if (!tokenId || isNaN(Number(tokenId))) {
        toast.error("Vui lòng nhập Token ID hợp lệ!")
        return
      }

      // 1. Kết nối MetaMask
      const provider: any = await detectEthereumProvider()
      if (!provider) {
        toast.error('Không tìm thấy MetaMask')
        return
      }

      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      // 2. Kết nối contract
      const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

      // 3. Gọi hàm getDiploma(uint tokenId)
      const diploma = await contract.getDiploma(Number(tokenId))
      console.log("diploma", diploma);

      // 4. Load metadata từ IPFS (tokenURI là CID hoặc URL)
      const tokenURI = await contract.tokenURI(tokenId);
      const metadata = (await axios.get(tokenURI)).data;

      console.log("metadata: ", metadata);

      const rawImageUrl = metadata.imageCID;
      if (!rawImageUrl) {
        toast.error("Không tìm thấy đường dẫn ảnh trong metadata");
        return;
      }

      const IPFSUrl = getIpfsUrlFromPinata(rawImageUrl);

      console.log("IPFSUrl: ", IPFSUrl);

      // 5. Set dữ liệu để hiển thị modal
      setDiplomaData({
        name: metadata.fullName,
        degree: metadata.classification,
        issuedBy: diploma.issuer,
        image: IPFSUrl,
        dayOfBirth: metadata.dayOfBirth,
        issuedAt: diploma.issueDate,
        address: diploma.student,
        school: metadata.school,
        faculty: metadata.faculty
      })

      // Mở modal sau 1 tick để đảm bảo state được cập nhật
      setTimeout(() => {
        setShowModal(true)
      }, 0)

      console.log("diplomaDetail", diplomaData);

      setShowModal(true)
    } catch (error: any) {
      console.error(error)
      toast.error('Không tìm thấy hoặc không thể truy xuất văn bằng!')
      setDiplomaData(null)
      setShowModal(false)
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
      {showModal && diplomaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="bg-[#1E1E24] text-white rounded-2xl overflow-hidden w-full max-w-7xl shadow-xl flex flex-col sm:flex-row">
            {/* Left: Diploma image */}
            <div className="sm:w-1/2 relative h-64 sm:h-auto">
              <img
                src={diplomaData.image}
                alt="Diploma"
                className="w-full h-full object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
              />
            </div>

            {/* Right: Info */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div className="space-y-2 text-sm sm:text-base">
                <h3 className="text-2xl font-bold text-blue-400 mb-3">🎓 Thông tin văn bằng</h3>

                <p><span className="font-semibold text-white/80">👤 Họ tên:</span> {diplomaData.name}</p>
                <p><span className="font-semibold text-white/80">🎂 Ngày sinh:</span> {diplomaData.dayOfBirth ? new Date(diplomaData.dayOfBirth).toLocaleDateString('vi-VN') : 'Không có'}</p>
                <p><span className="font-semibold text-white/80">🏫 Trường:</span> {diplomaData.school}</p>
                <p><span className="font-semibold text-white/80">🏛️ Khoa:</span> {diplomaData.faculty}</p>
                <p><span className="font-semibold text-white/80">📄 Văn bằng:</span> {diplomaData.degree}</p>
                <p><span className="font-semibold text-white/80">🏢 Đơn vị cấp:</span>
                  <span className="break-all block text-gray-300">{diplomaData.issuedBy}</span>
                </p>
                <p><span className="font-semibold text-white/80">📅 Ngày cấp:</span> {formatDate(diplomaData.issuedAt)}</p>
                <p><span className="font-semibold text-white/80">Địa chỉ ví:</span>
                  <span className="break-all block text-gray-300">{diplomaData.address}</span>
                </p>

                <a
                  href={`https://testnets.opensea.io/assets/sepolia/0xe8387C334AC422477785146C5FDF66B52d9654A6/${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-400 hover:underline"
                >
                  🔍 Xem trên Etherscan
                </a>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all"
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
