'use client'

import { FaGraduationCap, FaWallet } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/lib/axios'
import { toast } from 'sonner'

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const { address, connectWallet, disconnectWallet } = useWallet()
  const { data: session } = useSession()
  const router = useRouter()

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const handleLogout = async () => {
    try {      
      // Gọi hàm logout để xóa refresh token khỏi DB
      await logoutUser()
      toast.success('Đăng xuất thành công!')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Đã xảy ra lỗi khi đăng xuất!')
    }
  }

  // Xác định dashboard URL dựa trên role
  const getDashboardUrl = () => {
    const role = session?.user?.role
    if (role === 'STUDENT') return '/dashboard/student'
    if (role === 'ISSUER') return '/dashboard/dip-issuer'
    if (role === 'DELEGATE') return '/dashboard/delegate'
    return '/dashboard'
  }

  // Lấy tên hiển thị (ưu tiên từ session, fallback về email hoặc label mặc định)
  const displayName = session?.user?.name

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#1A1D24]/80 backdrop-blur border-b border-[#2C2F35] shadow-lg">
      <Link href="/">
        <div className="flex items-center space-x-2 cursor-pointer">
          <FaGraduationCap className="text-3xl text-cyan-500" />
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Dip-Cert
          </h1>
        </div>
      </Link>


      <div className="flex gap-2 items-center relative">
        {/* Nút kết nối ví */}
        <button
          onClick={address ? disconnectWallet : connectWallet}
          className=
          {
            `flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition shadow hover:cursor-pointer 
            ${address ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
            `
          }
        >
          <FaWallet />
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : 'Kết nối ví'}
        </button>

        {displayName ? (
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="w-48 truncate text-sm text-white font-medium px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition text-center hover:cursor-pointer"

            >
              {displayName}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2B2F36] rounded-lg shadow-lg border border-[#3A3D45] z-50">
                <Link href={getDashboardUrl()}>
                  <button className="w-full rounded-t-lg px-4 py-2 text-sm text-white hover:bg-indigo-600 text-center hover:cursor-pointer">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-b-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white text-center hover:cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/auth/login">
              <button className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-xl transition shadow hover:cursor-pointer">
                Đăng nhập
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-xl transition shadow hover:cursor-pointer">
                Đăng ký
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
