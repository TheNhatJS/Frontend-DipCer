'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function IssuerInfoPage() {
  const [issuerInfo, setIssuerInfo] = useState<any>(null)

  useEffect(() => {
    setIssuerInfo({
      code: 'DAUKT',
      name: 'Đại học Kiến Trúc Đà Nẵng',
      addressWallet: '0x5bD...0F72',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col text-white rounded-3xl">

      <main className="flex-1 px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(56,182,255,0.1)] rounded-2xl px-6 py-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">
              🏫 Thông tin đơn vị cấp bằng
            </h1>
            <p className="text-gray-400 text-sm">
              Các thông tin bên dưới được xác thực và lưu trữ trên blockchain.
            </p>
          </div>

          {issuerInfo && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-inner shadow-blue-500/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Mã trường:</span>
                <span className="text-blue-300">{issuerInfo.code}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Tên trường:</span>
                <span className="text-blue-300">{issuerInfo.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Ví blockchain:</span>
                <span className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded-lg text-sm">
                  {issuerInfo.addressWallet}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
