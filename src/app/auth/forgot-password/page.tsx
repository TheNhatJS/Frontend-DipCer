'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import axiosInstance from '@/lib/axios'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email
      })

      console.log('Forgot password response:', response.data)
      
      setIsSuccess(true)
      toast.success('Email đặt lại mật khẩu đã được gửi!')
      
      // Redirect về reset password sau 3 giây
      setTimeout(() => {
        router.push('/auth/reset-password')
      }, 3000)
      
    } catch (error: any) {
      console.error('Forgot password error:', error)
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Không thể gửi email. Vui lòng thử lại sau.')
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
          <h2 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 text-sm">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email đã được gửi!</h3>
              <p className="text-gray-400 text-sm">
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>
              <p className="text-gray-500 text-xs mt-4">
                Đang chuyển về trang đăng nhập...
              </p>
            </div>
          )}

          {/* Link quay về đăng nhập */}
          <div className="text-sm text-gray-400 mt-6 text-center">
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
