'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axios'
import axios from 'axios'
import { issueDiplomaOnBlockchain } from '@/lib/contract'

export default function IssueCertificatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    studentId: '',
    serialNumber: '',
    image: null as File | null,
    gpa: '',
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

      if (role !== 'ISSUER' && role !== 'DELEGATE') {
        toast.error('Bạn không có quyền truy cập trang này!')
        router.push('/') // hoặc router.replace('/unauthorized')
      }
    }
  }, [status, session, router])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { studentId, serialNumber, image, gpa } = formData

    if (!studentId || !serialNumber || !image || !gpa) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    // Validate GPA
    const gpaValue = parseFloat(gpa)
    if (isNaN(gpaValue) || gpaValue < 1.0 || gpaValue > 4.0) {
      toast.error('GPA phải từ 1.0 đến 4.0!')
      return
    }

    if (!session) {
      toast.error('Bạn chưa đăng nhập!')
      return
    }

    setLoading(true)

    try {
      // 1. Kiểm tra sinh viên tồn tại TRƯỚC KHI upload (tiết kiệm IPFS quota)
      toast.info('� Đang kiểm tra thông tin sinh viên...')
      
      let student: any
      try {
        const studentRes = await axiosInstance.get(`/students/${studentId}`)
        student = studentRes.data
        console.log('✅ Student found:', student.name)
        toast.success(`Tìm thấy sinh viên: ${student.name}`)
      } catch (err: any) {
        if (err.response?.status === 404) {
          toast.error(`❌ Không tìm thấy sinh viên với MSSV: ${studentId}`)
        } else {
          toast.error(`❌ Lỗi khi kiểm tra sinh viên: ${err.message}`)
        }
        return
      }

      // Validate địa chỉ ví
      if (!student.addressWallet) {
        toast.error('❌ Sinh viên chưa có địa chỉ ví blockchain!')
        return
      }

      // 2. Upload ảnh lên IPFS (chỉ khi sinh viên hợp lệ)
      toast.info('� Đang upload ảnh lên IPFS...')
      const fileData = new FormData()
      fileData.append('file', image)

      const imageRes = await axios.post('/api/upload/image', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes
      })

      if (!imageRes.data.success) {
        toast.error(`Upload ảnh thất bại: ${imageRes.data.message || 'Unknown error'}`)
        return
      }

      const imageCID = imageRes.data.pinataURL
      console.log('✅ Image uploaded to IPFS:', imageCID)

      // 3. Tạo metadata (không cần classification, backend tự tính)
      const metadata = {
        name: `Diploma - ${student.nameMajor}`,
        description: 'Bằng cấp đại học',
        studentID: studentId,
        studentName: student.name,
        gpa: gpaValue,
        faculty: student.nameMajor,
        class: student.nameClass || 'N/A',
        issueDate: new Date().toISOString().split('T')[0],
        institutionName: student.schoolName || session.user?.name || 'Unknown',
        institutionCode: student.schoolCode,
        image: imageCID,
      }

      toast.info('📤 Đang upload metadata lên IPFS...')
      const metadataRes = await axios.post('/api/upload/metadata', metadata, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // 1 minute
      })

      if (!metadataRes.data.success) {
        toast.error(`Upload metadata thất bại: ${metadataRes.data.message || 'Unknown error'}`)
        return
      }

      const tokenURI = metadataRes.data.pinataURL
      console.log('✅ Metadata uploaded to IPFS:', tokenURI)
      
      const issueDate = Math.floor(Date.now() / 1000)
      const institutionCode = student.schoolCode.toUpperCase()
      const studentAddress = student.addressWallet

      // 4. Mint NFT trên blockchain (bao gồm cả kiểm tra quyền)
      toast.info('⛓️ Đang cấp phát văn bằng lên blockchain...')
      
      const blockchainResult = await issueDiplomaOnBlockchain({
        studentAddress,
        institutionCode,
        serialNumber,
        tokenURI,
        issueDate,
      })

      if (!blockchainResult.success) {
        // Kiểm tra lỗi authorization
        if (blockchainResult.authorizationError) {
          const { approvedAddress, currentAddress } = blockchainResult.authorizationError
          toast.error(
            <div className="flex flex-col gap-2">
              <p className="font-semibold">❌ Không có quyền cấp phát</p>
              <p className="text-sm">
                Địa chỉ hiện tại: <code className="bg-black/20 px-1 rounded">{currentAddress.substring(0, 10)}...</code>
              </p>
              {approvedAddress && (
                <p className="text-sm">
                  Địa chỉ được approve: <code className="bg-black/20 px-1 rounded">{approvedAddress.substring(0, 10)}...</code>
                </p>
              )}
              <p className="text-xs text-amber-600">
                💡 Vui lòng chuyển sang địa chỉ ví đã được approve trong MetaMask
              </p>
            </div>,
            { duration: 8000 }
          )
        } else {
          toast.error(`❌ ${blockchainResult.error}`)
        }
        return
      }

      const { tokenId, txHash } = blockchainResult
      console.log('✅ NFT minted! TokenID:', tokenId, 'TxHash:', txHash)
      toast.success(`✅ NFT đã được mint! Token ID: ${tokenId}`)

      // 5. Lưu vào database với tokenId từ blockchain
      toast.info('💾 Đang lưu vào database...')
      
      const saveRes = await axiosInstance.post('/diplomas', {
        id: tokenId,  // tokenId từ blockchain event
        serialNumber,
        studentId,
        tokenURI,
        GPA: gpaValue,
      })

      const savedDiploma = saveRes.data
      console.log('✅ Diploma saved to database:', savedDiploma)

      toast.success(`🎉 Đã cấp phát văn bằng thành công!
        ✅ Transaction: ${txHash}
        🆔 Token ID: ${tokenId}
        🎓 MSSV: ${studentId}
        📜 Serial: ${serialNumber}
      `)

      // Reset form
      setFormData({ studentId: '', serialNumber: '', image: null, gpa: '' })
    } catch (err: any) {
      console.error('🔥 Error issuing diploma:', err)
      
      // Chi tiết error message
      let errorMessage = 'Không rõ lỗi'
      
      if (err.code === 'ECONNRESET') {
        errorMessage = 'Kết nối bị ngắt. Vui lòng thử lại!'
      } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. File có thể quá lớn!'
      } else if (err.response) {
        // Server response error
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`
      } else if (err.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến server'
      } else {
        errorMessage = err.message || 'Lỗi không xác định'
      }
      
      toast.error(`❌ ${errorMessage}`)
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
            <label className="text-sm text-gray-300 mb-1 block">Mã số sinh viên</label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white"
              placeholder="VD: 20241234"
              required
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Số hiệu văn bằng (Serial Number)</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white"
              placeholder="VD: HUST-2024-001"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Format: MãTrường-Năm-STT (VD: HUST-2024-001)
            </p>
          </div>

          {/* GPA */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Điểm GPA (1.0 - 4.0)</label>
            <input
              type="number"
              step="0.01"
              min="1.0"
              max="4.0"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white"
              placeholder="VD: 3.75"
              required
            />
            {formData.gpa && (
              <p className="text-xs text-gray-400 mt-1">
                💡 Xếp loại tự động: {parseFloat(formData.gpa) >= 3.6 ? '🏆 Xuất sắc' : parseFloat(formData.gpa) >= 3.2 ? '🥇 Giỏi' : parseFloat(formData.gpa) >= 2.5 ? '🥈 Khá' : parseFloat(formData.gpa) >= 2.0 ? '🥉 Trung bình' : '❌ Không đạt'}
              </p>
            )}
          </div>

          {/* File upload */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Ảnh văn bằng</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files?.[0] || null })
              }
              className="w-full text-sm text-white bg-[#292C33]/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              required
            />
            {formData.image && (
              <p className="text-xs text-gray-400 mt-1">
                📎 {formData.image.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-4 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang xử lý...' : '🎓 Cấp phát văn bằng'}
          </button>
        </form>

        {/* Thông tin hướng dẫn */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Lưu ý:</strong> Quá trình cấp phát bao gồm:
            <br />• Upload ảnh & metadata lên IPFS
            <br />• Lưu thông tin vào database
            <br />• Mint NFT trên blockchain (cần MetaMask)
          </p>
        </div>
      </div>
    </div>
  )
}
