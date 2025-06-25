'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useWallet } from '@/contexts/WalletContext'
import { useSearchParams } from 'next/navigation'
import { ethers } from 'ethers'
import Contract from '@/data/abi.contract.json'
import detectEthereumProvider from '@metamask/detect-provider'
import { toast, Toaster } from 'sonner'
import { useRouter } from 'next/navigation'

export default function IssuerInfoPage() {
  const router = useRouter()
  const { address } = useWallet()
  const params = useSearchParams()
  const userId = params.get('userId')
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast.warning('Vui lòng kết nối ví trước!')
      return
    }

    try {
      // Bước 1: Gửi thông tin BE
      const res = await fetch('http://localhost:8080/api/dip-issuer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          code: schoolCode,
          name: schoolName,
          addressWallet: address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Gửi thông tin thất bại')
        return
      }

      // Bước 2: Gọi contract approveIssuer
      const provider: any = await detectEthereumProvider()
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

        try {
          const tx = await contract.approveIssuer(schoolCode)
          await tx.wait()

          toast.success('Đăng ký và cấp quyền cho trường thành công!')

          // ✅ Chuyển sang trang đăng nhập sau 2 giây
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        } catch (err) {
          console.error('Lỗi contract:', err)
          toast.error('BE thành công nhưng cấp quyền blockchain thất bại.')
        }
      }
    } catch (err) {
      console.error('Lỗi gửi thông tin:', err)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    }
  }


  return (
    <div className="min-h-screen text-white flex flex-col">
      <Header />
      <Toaster position="top-right" richColors />


      <main className="flex-1 flex justify-center items-center px-4">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Thông tin Trường cấp bằng</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm">Mã trường</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-4 py-2 bg-[#292C33]/70 border border-gray-600 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Tên trường</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2 bg-[#292C33]/70 border border-gray-600 rounded-lg"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl"
            >
              Gửi thông tin
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
