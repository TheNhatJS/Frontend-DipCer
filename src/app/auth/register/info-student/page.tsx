'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useWallet } from '@/contexts/WalletContext'
import { useSearchParams, useRouter } from 'next/navigation'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import Contract from '@/data/abi.contract.json'
import { toast, Toaster } from 'sonner'

export default function StudentInfoPage() {
  const { address } = useWallet()
  const params = useSearchParams()
  const router = useRouter()

  const userId = params.get('userId') // lấy từ URL
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [studentId, setStudentId] = useState('')
  const [faculty, setFaculty] = useState('')
  const [schoolCode, setSchoolCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast.warning('Vui lòng kết nối ví trước!')
      return
    }

    if (!userId || isNaN(Number(userId))) {
      toast.error('Thiếu hoặc sai userId!')
      return
    }

    try {
      // Gửi thông tin sinh viên về backend
      const res = await fetch('http://localhost:8080/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(userId),
          id: studentId,
          addressWallet: address,
          name: fullName,
          dayOfBirth: dob,
          phone,
          courseName: faculty,
          institutionCode: schoolCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Gửi thông tin thất bại!')
        return
      }

      // Gọi hàm smart contract
      const provider: any = await detectEthereumProvider()
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

        try {
          const tx = await contract.registerStudent(studentId, schoolCode)
          await tx.wait()

          toast.success('Đăng ký sinh viên thành công! Đang chuyển hướng...')
          setTimeout(() => router.push('/auth/login'), 2000)
        } catch (err) {
          console.error('Smart contract error:', err)
          toast.error('Gửi BE thành công nhưng gọi contract thất bại.')
        }
      }
    } catch (err) {
      console.error('Gửi dữ liệu lỗi:', err)
      toast.error('Đã xảy ra lỗi khi gửi thông tin!')
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Header />
      <Toaster position="top-right" richColors />

      <main className="flex-1 flex justify-center items-center px-4 mt-16">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Thông tin Sinh viên</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Họ và tên" value={fullName} onChange={setFullName} />
            <Input label="Mã trường" value={schoolCode} onChange={setSchoolCode} />
            <Input label="Mã số sinh viên" value={studentId} onChange={setStudentId} />
            <Input label="Ngày sinh" value={dob} onChange={setDob} type="date" />
            <Input label="Số điện thoại" value={phone} onChange={setPhone} />
            <Input label="Tên khoa" value={faculty} onChange={setFaculty} />

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

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block mb-1 text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
        required
      />
    </div>
  )
}
