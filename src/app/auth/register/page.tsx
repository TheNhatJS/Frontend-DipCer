'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== rePassword) {
      setError('Mật khẩu không khớp!')
      return
    }

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    if (!isValidEmail(email)) {
      setError('Email không hợp lệ!')
      return
    }

    try {
      const res = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: role === 'student' ? 'STUDENT' : 'DIP_ISSUER',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại')
        return
      }

      const userId = data.id // 👈 lấy ID từ response

      // ✅ Điều hướng kèm ID trên URL
      if (role === 'student') {
        router.push(`/auth/register/info-student?userId=${userId}`)
      } else {
        router.push(`/auth/register/info-dip-issuer?userId=${userId}`)
      }

    } catch (err) {
      console.error('Lỗi khi đăng ký:', err)
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10" />

      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md text-white">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

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
                  className="absolute top-2.5 right-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Nhập lại mật khẩu */}
            <div>
              <label htmlFor="repassword" className="block mb-1 text-sm">Nhập lại mật khẩu</label>
              <div className="relative">
                <input
                  id="repassword"
                  type={showRePassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRePassword(!showRePassword)}
                  className="absolute top-2.5 right-3 text-gray-400 hover:text-white"
                >
                  {showRePassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label htmlFor="role" className="block mb-1 text-sm">Vai trò</label>
              <select
                id="role"
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Sinh viên</option>
                <option value="DIP_ISSUER">Trường Đại học</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Đã có tài khoản? <Link href="/auth/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
