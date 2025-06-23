'use client'

import { FaGraduationCap, FaWallet } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  name?: string
  onLogout?: () => void
}

export default function Header({ name, onLogout }: HeaderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  const handleConnectWallet = () => {
    setWalletAddress('0x1234567890abcdef1234567890abcdef12345678')
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

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
        <button
          onClick={handleConnectWallet}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-sm px-4 py-2 rounded-xl transition shadow hover:cursor-pointer"
        >
          <FaWallet />
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Kết nối ví'}
        </button>

        {name ? (
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="w-48 truncate text-sm text-white font-medium px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition text-left hover:cursor-pointer"

            >
              {name}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#2B2F36] rounded-lg shadow-lg border border-[#3A3D45] z-50">
                <button
                  onClick={onLogout}
                  className="w-48 rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white text-center hover:cursor-pointer"
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
