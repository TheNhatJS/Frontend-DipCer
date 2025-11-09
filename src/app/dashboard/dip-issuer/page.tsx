'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaUniversity, FaUserGraduate, FaChalkboardTeacher, FaCertificate, FaPlus } from 'react-icons/fa'
import { toast, Toaster } from 'sonner'
import axiosInstance from '@/lib/axios'

type IssuerInfo = {
  code: string
  schoolName: string
  addressWallet: string
}

type DashboardStats = {
  totalDelegates: number
  totalDiplomas: number
}

export default function IssuerInfoPage() {
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ totalDelegates: 0, totalDiplomas: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const fetchIssuerInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const code = session?.user?.roleId
        
        if (!code) {
          setError("Không tìm thấy thông tin phiên đăng nhập")
          return
        }

        // ✅ Fetch issuer info - Sử dụng axiosInstance
        const res = await axiosInstance.get(`/dip-issuer/${code}`)
        setIssuerInfo(res.data)

        // Fetch statistics
        await fetchStatistics()
        
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu:", err)
        setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    const fetchStatistics = async () => {
      try {
        // ✅ Fetch delegates count - Sử dụng axiosInstance
        const delegatesRes = await axiosInstance.get(`/dip-delegate`)

        const diplomasRes = await axiosInstance.get(`/diplomas/by-institution`)
        console.log('📊 Diploma stats response:', diplomasRes.data)

        setStats({
          totalDelegates: delegatesRes.data.pagination?.total || 0,
          totalDiplomas: diplomasRes.data.pagination?.totalItems || 0, // ✅ Fix: sử dụng totalItems thay vì total
        })
      } catch (err) {
        console.error("Lỗi tải thống kê:", err)
      }
    }

    if (session) {
      fetchIssuerInfo()
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải thông tin...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">Có lỗi xảy ra</h2>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Toaster position="top-right" richColors />
      
      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Dashboard Nhà trường
          </h1>
          <p className="text-gray-400">
            Quản lý chuyên viên và văn bằng
          </p>
        </div>

        {/* Institution Info Card */}
        {issuerInfo && (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FaUniversity className="text-4xl text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">{issuerInfo.schoolName}</h2>
                <p className="text-blue-300">Mã trường: {issuerInfo.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="font-semibold text-gray-300">Ví blockchain:</span>
              <span className="font-mono text-green-400 bg-green-900/20 px-3 py-1 rounded-lg text-sm">
                {issuerInfo.addressWallet}
              </span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-purple-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <FaChalkboardTeacher className="text-4xl text-purple-400" />
              <span className="text-3xl font-bold text-purple-400">{stats.totalDelegates}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Chuyên viên</h3>
            <p className="text-sm text-gray-400">Tổng số chuyên viên</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-green-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <FaCertificate className="text-4xl text-green-400" />
              <span className="text-3xl font-bold text-green-400">{stats.totalDiplomas}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Văn bằng</h3>
            <p className="text-sm text-gray-400">Đã cấp phát</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaPlus className="text-blue-400" />
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/dip-issuer/dip-issuance')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-4"
            >
              <FaUserGraduate className="text-3xl" />
              <div className="text-left">
                <h3 className="text-xl font-bold">Nhập văn bằng</h3>
                <p className="text-sm text-blue-100">Thêm một hoặc nhiều văn bằng</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/dip-issuer/delegates/add')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-6 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-4"
            >
              <FaChalkboardTeacher className="text-3xl" />
              <div className="text-left">
                <h3 className="text-xl font-bold">Thêm Chuyên viên</h3>
                <p className="text-sm text-purple-100">Thêm một hoặc nhiều chuyên viên</p>
              </div>
            </button>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/dip-issuer/delegates')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-left"
          >
            <h3 className="font-semibold text-lg mb-1">👨‍🏫 Danh sách Chuyên viên</h3>
            <p className="text-sm text-gray-400">Xem và quản lý chuyên viên</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/dip-issuer/diplomas')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-left"
          >
            <h3 className="font-semibold text-lg mb-1">🎓 Quản lý Văn bằng</h3>
            <p className="text-sm text-gray-400">Cấp phát và thu hồi văn bằng</p>
          </button>
        </div>
      </main>
    </div>
  )
}