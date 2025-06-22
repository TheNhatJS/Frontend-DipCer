'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaWallet } from 'react-icons/fa'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState('')
  const [certificateData, setCertificateData] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const handleConnectWallet = () => {
    setWalletAddress('0x1234567890abcdef1234567890abcdef12345678')
  }

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
      alert('Không tìm thấy văn bằng')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#202328] text-white relative">

      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        {/* Khối kính mờ Apple style */}
        <div className="flex flex-col gap-6 backdrop-blur-lg bg-white/5 border border-white/10 shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold">Tra cứu văn bằng</h2>
          <input
            type="text"
            placeholder="Nhập Token ID..."
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 rounded-xl transition duration-200 shadow hover:scale-105"
          >
            Tra cứu
          </button>
        </div>
      </main>

      {/* Modal */}
      {showModal && certificateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1F2227] text-white rounded-2xl shadow-2xl overflow-hidden w-[90%] max-w-3xl flex flex-col sm:flex-row">
            {/* Ảnh */}
            <div className="sm:w-1/2 relative h-64 sm:h-auto">
              <Image
                src={certificateData.image}
                alt="Diploma Image"
                fill
                className="object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
              />
            </div>

            {/* Thông tin */}
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
