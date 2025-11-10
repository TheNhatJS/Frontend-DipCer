'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import axiosInstance from '@/lib/axios'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!token.trim()) {
      toast.error('Vui lòng nhập mã xác thực từ email!')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token: token.trim(),
        newPassword
      })

      console.log('Reset password response:', response.data)
      
      toast.success('Đặt lại mật khẩu thành công!')
      
      // Redirect về login sau 2 giây
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Reset password error:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Không thể đặt lại mật khẩu. Token có thể đã hết hạn.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Nền gradient */}
      <div className="absolute inset-0 -z-10" />

      <Header />
      <Toaster position="top-right" richColors />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md text-white">
          <h2 className="text-2xl font-bold text-center mb-2">Đặt lại mật khẩu</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Nhập mã xác thực từ email và mật khẩu mới
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Token */}
            <div>
              <label htmlFor="token" className="block mb-1 text-sm">
                Mã xác thực <span className="text-red-400">*</span>
              </label>
              <input
                id="token"
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Nhập mã từ email (64 ký tự)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mã xác thực đã được gửi đến email của bạn
              </p>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label htmlFor="newPassword" className="block mb-1 text-sm">
                Mật khẩu mới <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-sm">
                Xác nhận mật khẩu <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-2 mt-6 text-sm text-gray-400 text-center">
            <Link href="/auth/forgot-password" className="text-blue-400 hover:underline">
              Chưa nhận được email?
            </Link>
            <Link href="/auth/login" className="text-gray-500 hover:text-gray-300">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

