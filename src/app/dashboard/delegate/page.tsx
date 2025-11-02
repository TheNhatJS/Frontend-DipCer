'use client'

import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { toast, Toaster } from 'sonner'
import { FaUser, FaEnvelope, FaWallet, FaUniversity, FaCalendar, FaPhone, FaGraduationCap } from 'react-icons/fa'

type DelegateInfo = {
  id: string
  name: string
  email: string
  addressWallet: string
  schoolCode: string
  faculty: string
  phone: string
  dayOfBirth: string
  gender: string
  isActivated: boolean
  issuer?: {
    code: string
    schoolName: string
  }
}

export default function DelegateDashboard() {
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDelegateInfo = async () => {
      try {
        setLoading(true)
        setError(null)

        const session = await getSession()
        
        // Kiểm tra session và role
        if (!session || session.user.role !== "DELEGATE") {
          router.push("/auth/login")
          return
        }

        const delegateId = session.user.roleId
        const token = session.access_token

        if (!delegateId || !token) {
          setError("Không tìm thấy thông tin phiên đăng nhập")
          toast.error("Không tìm thấy thông tin phiên đăng nhập")
          return
        }

        // Gọi API để lấy thông tin delegate
        const res = await fetch(`http://localhost:8080/api/dip-delegate/${delegateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Không thể tải thông tin")
        }

        const data = await res.json()
        setDelegateInfo(data)
        
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu:", err)
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
        toast.error(err.message || "Có lỗi xảy ra khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchDelegateInfo()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-white">
        <Header />
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Đang tải thông tin...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-white">
        <Header />
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center mt-16">
          <div className="w-full max-w-2xl">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center backdrop-blur-sm">
              <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ Có lỗi xảy ra</h2>
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Header />
      <Toaster position="top-right" richColors />
      
      <main className="flex-1 px-6 py-10 pt-24 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            👨‍🏫 Dashboard Giảng viên
          </h1>
          <p className="text-gray-400">
            Quản lý thông tin cá nhân và văn bằng của bạn
          </p>
        </div>

        {delegateInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thông tin cá nhân */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/10 transition-shadow">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaUser className="text-blue-400" />
                Thông tin cá nhân
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaGraduationCap className="text-purple-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Mã giảng viên</p>
                    <p className="text-lg font-semibold text-white">{delegateInfo.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaUser className="text-blue-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Họ và tên</p>
                    <p className="text-lg font-semibold text-white">{delegateInfo.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaEnvelope className="text-green-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-lg font-semibold text-blue-300">{delegateInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaUniversity className="text-yellow-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Khoa</p>
                    <p className="text-lg font-semibold text-white">{delegateInfo.faculty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaPhone className="text-pink-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Số điện thoại</p>
                    <p className="text-lg font-semibold text-white">{delegateInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaCalendar className="text-orange-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Ngày sinh</p>
                    <p className="text-lg font-semibold text-white">
                      {delegateInfo.dayOfBirth 
                        ? new Date(delegateInfo.dayOfBirth).toLocaleDateString('vi-VN')
                        : 'Không có thông tin'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <FaWallet className="text-cyan-400 mt-1 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Địa chỉ ví Blockchain</p>
                    <p className="text-sm font-mono text-green-400 bg-green-900/20 px-3 py-2 rounded-lg mt-1 break-all">
                      {delegateInfo.addressWallet}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Thông tin trường & Trạng thái */}
            <div className="space-y-6">
              {/* Thông tin trường */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaUniversity className="text-blue-400" />
                  Trường
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Mã trường</p>
                    <p className="text-lg font-bold text-blue-300">{delegateInfo.schoolCode}</p>
                  </div>
                  {delegateInfo.issuer && (
                    <div>
                      <p className="text-sm text-gray-400">Tên trường</p>
                      <p className="text-lg font-semibold text-white">{delegateInfo.issuer.schoolName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trạng thái tài khoản */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-lg ${
                delegateInfo.isActivated 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <h3 className="text-xl font-bold mb-4">📊 Trạng thái</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      delegateInfo.isActivated ? 'bg-green-500' : 'bg-yellow-500'
                    } animate-pulse`} />
                    <span className={`font-semibold ${
                      delegateInfo.isActivated ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {delegateInfo.isActivated ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {delegateInfo.isActivated 
                      ? 'Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.' 
                      : 'Vui lòng kích hoạt tài khoản để sử dụng đầy đủ tính năng.'}
                  </p>
                </div>
              </div>

              {/* Giới tính */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-3">👤 Giới tính</h3>
                <p className="text-lg font-semibold text-purple-300">
                  {delegateInfo.gender === 'MALE' ? 'Nam' : 'Nữ'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!delegateInfo && !loading && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center backdrop-blur-sm">
            <p className="text-yellow-300 text-lg">⚠️ Không tìm thấy thông tin giảng viên</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
