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
    <div className="min-h-screen flex flex-col bg-[#202328] text-white">

      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Thông tin trường</h1>
        {issuerInfo && (
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 max-w-xl">
            <p className="mb-2"><strong>Mã trường:</strong> {issuerInfo.code}</p>
            <p className="mb-2"><strong>Tên trường:</strong> {issuerInfo.name}</p>
            <p className="mb-2"><strong>Ví blockchain:</strong> {issuerInfo.addressWallet}</p>
          </div>
        )}
      </main>
    </div>
  )
}
