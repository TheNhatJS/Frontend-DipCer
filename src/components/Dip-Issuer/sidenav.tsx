'use client'

import NavLinks from './nav-link'
import { HiLogout } from 'react-icons/hi'
import { signOut } from 'next-auth/react' // 👈 Import hàm signOut

export default function SideNav({ institutionName }: { institutionName: string }) {
    const handleLogout = async () => {
        await signOut({
            callbackUrl: '/' // 👈 Redirect về home sau khi đăng xuất
        })
    }

    return (
        <div className="w-full md:w-86 h-full bg-[#1A1D24] text-white p-4 flex flex-col justify-between">
            <div>
                <div className="mb-8 text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent break-words w-full max-w-full leading-snug">
                    <span className="bg-gradient-to-r from-yellow-400 to-cyan-500 bg-clip-text text-transparent">
                        Welcome!
                    </span>
                    <br />
                    {institutionName}
                </div>

                <NavLinks />
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded hover:bg-red-700 transition"
            >
                <HiLogout className="text-lg" />
                Đăng xuất
            </button>
        </div>
    )
}
