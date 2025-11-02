'use client'

import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaChalkboardTeacher, FaPlus, FaArrowLeft } from 'react-icons/fa'
import { toast, Toaster } from 'sonner'

type Delegate = {
  id: string
  name: string
  email: string
  gender: string
  faculty: string
  addressWallet: string
  dayOfBirth: string
}

export default function DelegateListPage() {
  const router = useRouter()
  const [delegates, setDelegates] = useState<Delegate[]>([])
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDelegates = async () => {
      const session = await getSession()
      const token = session?.access_token

      if (!token) {
        toast.error("Không có token xác thực")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`http://localhost:8080/api/dip-delegate?pageSize=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (res.ok) {
          const json = await res.json()
          setDelegates(json.data || [])
        } else {
          toast.error("Không thể lấy danh sách giảng viên")
        }
      } catch (error) {
        console.error("Lỗi gọi API:", error)
        toast.error("Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchDelegates()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen text-white px-6 py-10 flex items-center justify-center">
        <Toaster position="top-right" richColors />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách giảng viên...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/dip-issuer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                <FaChalkboardTeacher className="inline mr-3" />
                Danh sách Giảng viên
              </h1>
              <p className="text-gray-400">Tổng số: {delegates.length} giảng viên</p>
            </div>
            
            <button
              onClick={() => router.push('/dashboard/dip-issuer/delegates/add')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:scale-105"
            >
              <FaPlus />
              Thêm giảng viên
            </button>
          </div>
        </div>

        {/* Delegates Grid */}
        {delegates.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {delegates.map((delegate) => (
              <div
                key={delegate.id}
                onClick={() => setSelectedDelegate(delegate)}
                className="cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:-translate-y-1 hover:border-purple-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Mã GV</p>
                    <p className="font-mono text-lg text-purple-300 font-semibold">{delegate.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    delegate.gender === 'MALE' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {delegate.gender === 'MALE' ? 'Nam' : 'Nữ'}
                  </span>
                </div>

                <p className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-purple-300">👤 Họ tên:</span>
                  <span className="text-white">{delegate.name}</span>
                </p>
                
                <p className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-purple-300">🏫 Khoa:</span>
                  <span className="text-white">{delegate.faculty}</span>
                </p>

                <p className="text-sm text-gray-400 truncate">
                  📧 {delegate.email}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <FaChalkboardTeacher className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Chưa có giảng viên nào</h3>
            <p className="text-gray-400 mb-6">Thêm giảng viên đầu tiên để bắt đầu</p>
            <button
              onClick={() => router.push('/dashboard/dip-issuer/delegates/add')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              <FaPlus className="inline mr-2" />
              Thêm giảng viên
            </button>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedDelegate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#1f2227] text-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-purple-500/30">
            <button
              onClick={() => setSelectedDelegate(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl transition"
            >
              &times;
            </button>
            
            <h3 className="text-2xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              <FaChalkboardTeacher />
              Chi tiết giảng viên
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Mã giảng viên</p>
                <p className="font-mono text-purple-300 font-semibold">{selectedDelegate.id}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Họ và tên</p>
                <p className="text-white font-semibold">{selectedDelegate.name}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Khoa</p>
                <p className="text-white">{selectedDelegate.faculty}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-blue-300">{selectedDelegate.email}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Giới tính</p>
                <p className="text-white">{selectedDelegate.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Ngày sinh</p>
                <p className="text-white">
                  {selectedDelegate.dayOfBirth 
                    ? new Date(selectedDelegate.dayOfBirth).toLocaleDateString('vi-VN')
                    : 'Không có thông tin'}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Địa chỉ ví</p>
                <p className="font-mono text-green-300 text-sm break-all">{selectedDelegate.addressWallet}</p>
              </div>
            </div>
            
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedDelegate(null)}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
