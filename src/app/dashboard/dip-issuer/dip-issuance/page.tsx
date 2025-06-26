'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Contract from '@/data/abi.contract.json'


export default function IssueCertificatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    studentId: '',
    image: null as File | null,
    classification: '',
  })
  const [loading, setLoading] = useState(false)

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Vui lòng đăng nhập để tiếp tục.')
      router.push('/auth/login')
    }

    if (status === 'authenticated') {
      const role = session?.user?.role // 🧠 bạn cần đảm bảo `role` có trong payload token

      if (role !== 'DIP_ISSUER') {
        toast.error('Bạn không có quyền truy cập trang này!')
        router.push('/') // hoặc router.replace('/unauthorized')
      }
    }
  }, [status, session, router])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { studentId, image, classification } = formData

    if (!studentId || !image || !classification) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    if (!session) {
      toast.error('Bạn chưa đăng nhập!')
      return
    }

    setLoading(true)

    try {
      // 1. Upload ảnh lên IPFS
      const fileData = new FormData()
      fileData.append('file', image)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: fileData,
      })

      const json = await res.json()
      if (!json.success) {
        toast.error('Upload ảnh thất bại!')
        return
      }

      const imageCID = json.pinataURL;

      // 2. Fetch dữ liệu sinh viên từ backend (gửi kèm token)
      const studentRes = await fetch(
        `http://localhost:8080/api/students/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!studentRes.ok) {
        toast.error('Không tìm thấy sinh viên!')
        return
      }

      const student = await studentRes.json()

      // 3. Tạo metadata
      const metadata = {
        fullName: student.name,
        dayOfBirth: student.dayOfBirth,
        classification,
        faculty: student.courseName,
        school: student.institutionCode,
        image: imageCID,
      }

      const metadataUpload = await fetch('/api/upload/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      })

      const metadataJson = await metadataUpload.json()
      if (!metadataJson.success) {
        toast.error('Upload metadata thất bại!')
        return
      }

      const tokenURI = metadataJson.pinataURL
      const issueDate = Math.floor(Date.now() / 1000)

      // 4. Gọi hàm issueDiploma
      const provider: any = await detectEthereumProvider()
      if (!provider) {
        toast.error('Không tìm thấy MetaMask')
        return
      }

      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

      const institutionCode = student.institutionCode;
      const tx = await contract.issueDiploma(studentId, institutionCode, tokenURI, issueDate)
      await tx.wait()

      toast.success(`🎓 Đã cấp phát văn bằng cho MSSV: ${studentId}`)
      setFormData({ studentId: '', image: null, classification: '' })
    } catch (err: any) {
      console.error("🔥 Error issuing diploma:", err)
      toast.error(`Đã xảy ra lỗi: ${err.message || 'Không rõ lỗi'}`)


    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
          🎓 Cấp phát văn bằng
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* MSSV */}
          <div>
            <label className="text-sm text-gray-300 mb-1">Mã số sinh viên</label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
              required
            />
          </div>

          {/* Xếp loại */}
          <div>
            <label className="text-sm text-gray-300 mb-1">Xếp loại</label>
            <input
              type="text"
              value={formData.classification}
              onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600"
              required
            />
          </div>

          {/* File upload */}
          <div>
            <label className="text-sm text-gray-300 mb-1">Ảnh văn bằng</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files?.[0] || null })
              }
              className="text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-4 py-3 rounded-xl text-lg font-semibold"
          >
            {loading ? 'Đang xử lý...' : 'Cấp phát'}
          </button>
        </form>
      </div>
    </div>
  )
}
