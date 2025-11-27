'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Link from 'next/link'
import { getSession, signIn } from "next-auth/react"
import { toast, Toaster } from 'sonner'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log("SignIn response:", res); // 🪵 Log xem rõ giá trị

    // ❗ Dựa vào res.error thay vì res.ok
    if (res?.error === "CredentialsSignin") {
      toast.error("Email hoặc mật khẩu không đúng!");
      setErrorMessage("Email hoặc mật khẩu không chính xác!");
      return;
    }

    if (res?.error) {
      toast.error(res.error || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setErrorMessage("Lỗi không xác định.");
      return;
    }

    // ✅ Nếu không có lỗi
    const session = await getSession();
    const role = session?.user?.role;

    if (role === "DELEGATE") router.push("/dashboard/delegate");
    else if (role === "ISSUER") router.push("/dashboard/dip-issuer");
    else router.push("/auth/login");
  };




  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Nền gradient */}
      <div className="absolute inset-0 -z-10" />

      <Header />
      <Toaster position="top-right" richColors />

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

          {/* Link quên mật khẩu */}
          <div className="text-sm text-gray-400 mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-blue-400 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Link đăng ký */}
          <p className="text-sm text-gray-400 mt-2 text-center">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
