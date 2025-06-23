'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@example.com' && password === '123456') {
      alert('Đăng nhập thành công!')
      router.push('/')
    } else {
      alert('Email hoặc mật khẩu không đúng!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Nền gradient */}
      <div className="absolute inset-0 -z-10" />

      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md text-white">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập hệ thống</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block mb-1 text-sm">Mật khẩu</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105"
            >
              Đăng nhập
            </button>
          </form>

          {/* Link đăng ký */}
          <p className="text-sm text-gray-400 mt-6 text-center">
            Chưa có tài khoản?{' '}
            <a href="/auth/register" className="text-blue-400 hover:underline">
              Đăng ký
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
