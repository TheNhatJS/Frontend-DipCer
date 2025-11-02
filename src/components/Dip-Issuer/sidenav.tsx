'use client'

import NavLinks from './nav-link'
import { HiLogout, HiHome } from 'react-icons/hi'
import { FaUniversity } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { logoutUser } from '@/lib/axios'
import { toast } from 'sonner'

export default function SideNav({ institutionName }: { institutionName: string }) {
    const { data: session } = useSession()
    const [issuerCode, setIssuerCode] = useState<string>('')

    useEffect(() => {
        if (session?.user?.roleId) {
            setIssuerCode(session.user.roleId)
        }
    }, [session])

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

    return (
        <div className="w-full md:w-86 h-full bg-gradient-to-b from-[#1A1D24] to-[#0F1115] text-white flex flex-col shadow-2xl border-r border-white/10">
            {/* Header Section */}
            <div className="p-6 border-b border-white/10">
                {/* Welcome Message */}
                <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-1">Xin chào 🖐️,</p>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent break-words leading-tight">
                        {institutionName}
                    </h2>
                </div>

                {/* Institution Info Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FaUniversity className="text-blue-400 text-lg" />
                        <p className="text-xs text-gray-400 font-semibold">Thông tin trường</p>
                    </div>
                    {issuerCode && (
                        <p className="text-sm text-blue-300 font-mono">
                            Mã trường: {issuerCode}
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                        Menu chính
                    </p>
                    <NavLinks />
                </div>
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-white/10 space-y-3">
                {/* Home Button */}
                <Link href="/">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-1 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-200 group">
                        <HiHome className="text-lg group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Trang chủ</span>
                    </button>
                </Link>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 hover:border-red-500/50 transition-all duration-200 group"
                >
                    <HiLogout className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Đăng xuất</span>
                </button>
            </div>
        </div>
    )
}
