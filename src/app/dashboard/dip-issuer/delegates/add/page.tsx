'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import { FaChalkboardTeacher, FaTrash, FaArrowLeft } from 'react-icons/fa'
import axiosInstance from '@/lib/axios'

type DelegateForm = {
  id: string
  name: string
  email: string
  address: string
  dayOfBirth: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  faculty: string
}

export default function AddDelegatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  
  // Single delegate form
  const [delegate, setDelegate] = useState<DelegateForm>({
    id: '',
    name: '',
    email: '',
    address: '',
    dayOfBirth: '',
    gender: 'MALE',
    phone: '',
    faculty: ''
  })

  // Batch delegates
  const [delegates, setDelegates] = useState<DelegateForm[]>([])
  const [batchCount, setBatchCount] = useState(1)

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== SINGLE SUBMIT STARTED ===')
    console.log('Delegate to add:', delegate)
    setLoading(true)

    try {
      // Dùng axios thay vì fetch
      const { data } = await axiosInstance.post('/dip-delegate', [delegate])

      console.log('Single submit response:', data)

      // Xử lý response - Backend trả về array của results
      if (Array.isArray(data)) {
        const result = data[0] // Lấy kết quả đầu tiên
        
        if (result.status === 'success') {
          toast.success('Thêm giảng viên thành công!')
          
          // Reset form
          setDelegate({
            id: '',
            name: '',
            email: '',
            address: '',
            dayOfBirth: '',
            gender: 'MALE',
            phone: '',
            faculty: ''
          })

          setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 1500)
        } else {
          // Hiển thị lỗi chi tiết từ backend
          const errorMsg = result.error || 'Không thể thêm giảng viên'
          
          // Parse error message để hiển thị user-friendly
          if (errorMsg.includes('Unique constraint failed') && errorMsg.includes('email')) {
            toast.error('Email này đã được sử dụng. Vui lòng chọn email khác.', { duration: 5000 })
          } else if (errorMsg.includes('Unique constraint failed') && errorMsg.includes('schoolCode')) {
            toast.error('Mã giảng viên này đã tồn tại. Vui lòng chọn mã khác.', { duration: 5000 })
          } else {
            toast.error(`Lỗi: ${errorMsg}`, { duration: 5000 })
          }
          
          console.error('Failed:', result)
        }
      } else if (data.results && Array.isArray(data.results)) {
        // Fallback cho format cũ
        const result = data.results[0]
        
        if (result.success) {
          toast.success('Thêm giảng viên thành công!')
          
          // Reset form
          setDelegate({
            id: '',
            name: '',
            email: '',
            address: '',
            dayOfBirth: '',
            gender: 'MALE',
            phone: '',
            faculty: ''
          })

          setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 1500)
        } else {
          toast.error(`Không thể thêm giảng viên: ${result.error}`, { duration: 5000 })
          console.error('Failed:', result)
        }
      } else {
        // Legacy response hoặc success khác
        toast.success('Thêm giảng viên thành công!')
        
        // Reset form
        setDelegate({
          id: '',
          name: '',
          email: '',
          address: '',
          dayOfBirth: '',
          gender: 'MALE',
          phone: '',
          faculty: ''
        })

        setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 1500)
      }
    } catch (err: any) {
      console.error('=== ERROR ===')
      console.error('Error details:', err)
      console.error('Response data:', err.response?.data)
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Đã xảy ra lỗi'
      
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== BATCH SUBMIT STARTED ===')
    console.log('Delegates to add:', delegates)
    setLoading(true)

    try {
      // Dùng axios thay vì fetch
      const { data } = await axiosInstance.post('/dip-delegate', delegates)

      console.log('Batch submit response:', data)

      // Xử lý response
      if (data.results && Array.isArray(data.results)) {
        const successCount = data.results.filter((r: any) => r.success).length
        const failedCount = data.results.length - successCount

        if (failedCount === 0) {
          toast.success(`Thêm ${successCount} giảng viên thành công!`)
          setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 1500)
        } else if (successCount === 0) {
          toast.error(`Không thể thêm ${failedCount} giảng viên!`, { duration: 5000 })
          
          // Log chi tiết lỗi
          data.results.forEach((r: any, index: number) => {
            if (!r.success) {
              console.error(`Delegate ${index + 1} (${delegates[index].id}):`, r.error)
            }
          })
        } else {
          // Một phần thành công, một phần thất bại
          toast.warning(
            `Thêm ${successCount} giảng viên thành công, ${failedCount} thất bại!`,
            { duration: 5000 }
          )

          // Log chi tiết lỗi
          data.results.forEach((r: any, index: number) => {
            if (!r.success) {
              console.error(`Delegate ${index + 1} (${delegates[index].id}):`, r.error)
            }
          })

          setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 2000)
        }
      } else {
        // Legacy response
        toast.success(`Thêm ${delegates.length} giảng viên thành công!`)
        setTimeout(() => router.push('/dashboard/dip-issuer/delegates'), 1500)
      }
    } catch (err: any) {
      console.error('=== ERROR ===')
      console.error('Error details:', err)
      console.error('Response data:', err.response?.data)
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Đã xảy ra lỗi'
      
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const initializeBatchForms = (count: number) => {
    const newDelegates: DelegateForm[] = []
    for (let i = 0; i < count; i++) {
      newDelegates.push({
        id: '',
        name: '',
        email: '',
        address: '',
        dayOfBirth: '',
        gender: 'MALE',
        phone: '',
        faculty: ''
      })
    }
    setDelegates(newDelegates)
  }

  const updateBatchDelegate = (index: number, field: keyof DelegateForm, value: string) => {
    const newDelegates = [...delegates]
    newDelegates[index] = { ...newDelegates[index], [field]: value }
    setDelegates(newDelegates)
  }

  const removeBatchDelegate = (index: number) => {
    const newDelegates = delegates.filter((_, i) => i !== index)
    setDelegates(newDelegates)
    setBatchCount(newDelegates.length)
  }

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/dip-issuer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Quay lại Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            <FaChalkboardTeacher className="inline mr-3" />
            Thêm Giảng viên
          </h1>
          <p className="text-gray-400">Thêm một hoặc nhiều giảng viên vào hệ thống</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'single'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Thêm 1 giảng viên
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'batch'
                ? 'bg-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Thêm nhiều giảng viên
          </button>
        </div>

        {/* Single Delegate Form */}
        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Mã giảng viên *</label>
                <input
                  type="text"
                  required
                  value={delegate.id}
                  onChange={(e) => setDelegate({ ...delegate, id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="GV001"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={delegate.name}
                  onChange={(e) => setDelegate({ ...delegate, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={delegate.email}
                  onChange={(e) => setDelegate({ ...delegate, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="lecturer@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Địa chỉ ví *</label>
                <input
                  type="text"
                  required
                  value={delegate.address}
                  onChange={(e) => setDelegate({ ...delegate, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Ngày sinh *</label>
                <input
                  type="date"
                  required
                  value={delegate.dayOfBirth}
                  onChange={(e) => setDelegate({ ...delegate, dayOfBirth: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Giới tính *</label>
                <select
                  required
                  value={delegate.gender}
                  onChange={(e) => setDelegate({ ...delegate, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
                >
                  <option value="MALE" className="text-black bg-white">Nam</option>
                  <option value="FEMALE" className="text-black bg-white">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={delegate.phone}
                  onChange={(e) => setDelegate({ ...delegate, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Khoa *</label>
                <input
                  type="text"
                  required
                  value={delegate.faculty}
                  onChange={(e) => setDelegate({ ...delegate, faculty: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Công nghệ thông tin"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Thêm giảng viên'}
            </button>
          </form>
        )}

        {/* Batch Delegates Form */}
        {mode === 'batch' && (
          <div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
              <label className="block mb-2 text-sm font-medium">Số lượng giảng viên</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={() => initializeBatchForms(batchCount)}
                  className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg transition"
                >
                  Tạo form
                </button>
              </div>
            </div>

            {delegates.length > 0 && (
              <form onSubmit={handleBatchSubmit} className="space-y-6">
                {delegates.map((del, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Giảng viên #{index + 1}</h3>
                      {delegates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBatchDelegate(index)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm">Mã GV *</label>
                        <input
                          type="text"
                          required
                          value={del.id}
                          onChange={(e) => updateBatchDelegate(index, 'id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Họ tên *</label>
                        <input
                          type="text"
                          required
                          value={del.name}
                          onChange={(e) => updateBatchDelegate(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Email *</label>
                        <input
                          type="email"
                          required
                          value={del.email}
                          onChange={(e) => updateBatchDelegate(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Địa chỉ ví *</label>
                        <input
                          type="text"
                          required
                          value={del.address}
                          onChange={(e) => updateBatchDelegate(index, 'address', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Ngày sinh *</label>
                        <input
                          type="date"
                          required
                          value={del.dayOfBirth}
                          onChange={(e) => updateBatchDelegate(index, 'dayOfBirth', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Giới tính *</label>
                        <select
                          required
                          value={del.gender}
                          onChange={(e) => updateBatchDelegate(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 [&>option]:text-black [&>option]:bg-white"
                        >
                          <option value="MALE" className="text-black bg-white">Nam</option>
                          <option value="FEMALE" className="text-black bg-white">Nữ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">SĐT *</label>
                        <input
                          type="tel"
                          required
                          value={del.phone}
                          onChange={(e) => updateBatchDelegate(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Khoa *</label>
                        <input
                          type="text"
                          required
                          value={del.faculty}
                          onChange={(e) => updateBatchDelegate(index, 'faculty', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : `Thêm ${delegates.length} giảng viên`}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
