'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import { FaUserPlus, FaUpload, FaTrash, FaArrowLeft } from 'react-icons/fa'
import axiosInstance from '@/lib/axios'

type StudentForm = {
  id: string
  name: string
  email: string
  address: string
  dayOfBirth: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  nameMajor: string
  class: string
}

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  
  // Single student form
  const [student, setStudent] = useState<StudentForm>({
    id: '',
    name: '',
    email: '',
    address: '',
    dayOfBirth: '',
    gender: 'MALE',
    phone: '',
    nameMajor: '',
    class: ''
  })

  // Batch students
  const [students, setStudents] = useState<StudentForm[]>([])
  const [batchCount, setBatchCount] = useState(1)

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== SINGLE SUBMIT STARTED ===')
    console.log('Student to add:', student)
    setLoading(true)

    try {
      // Dùng axios thay vì fetch
      const { data } = await axiosInstance.post('/students/batch', [student])

      console.log('Single submit response:', data)

      // Xử lý response
      if (data.results && Array.isArray(data.results)) {
        const result = data.results[0] // Chỉ có 1 sinh viên
        
        if (result.success) {
          toast.success('Thêm sinh viên thành công!')
          
          // Reset form
          setStudent({
            id: '',
            name: '',
            email: '',
            address: '',
            dayOfBirth: '',
            gender: 'MALE',
            phone: '',
            nameMajor: '',
            class: ''
          })

          setTimeout(() => router.push('/dashboard/dip-issuer/students'), 1500)
        } else {
          // Hiển thị lỗi chi tiết
          toast.error(`Không thể thêm sinh viên: ${result.error}`, { duration: 5000 })
          console.error('Failed:', result)
        }
      } else {
        // Legacy response hoặc success khác
        toast.success('Thêm sinh viên thành công!')
        
        // Reset form
        setStudent({
          id: '',
          name: '',
          email: '',
          address: '',
          dayOfBirth: '',
          gender: 'MALE',
          phone: '',
          nameMajor: '',
          class: ''
        })

        setTimeout(() => router.push('/dashboard/dip-issuer/students'), 1500)
      }
    } catch (err: any) {
      console.error('Lỗi:', err)
      
      // Axios error response
      if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error)
      } else {
        toast.error(err.message || 'Đã xảy ra lỗi')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== BATCH SUBMIT STARTED ===')
    console.log('Students to add:', students)
    setLoading(true)

    try {
      // Dùng axios thay vì fetch
      const { data } = await axiosInstance.post('/students/batch', students)

      console.log('Batch response:', data)
      console.log('Has results?', data.results, 'Is array?', Array.isArray(data.results))

      // Kiểm tra nếu có mảng kết quả chi tiết
      if (data.results && Array.isArray(data.results)) {
        const successful = data.successful || data.results.filter((r: any) => r.success).length
        const failed = data.failed || data.results.filter((r: any) => !r.success).length
        
        console.log('Stats:', { successful, failed, total: data.total })
        
        if (successful === 0 && failed > 0) {
          // Tất cả thất bại
          const failedList = data.results
            .filter((r: any) => !r.success)
            .map((r: any) => `${r.studentId}: ${r.error}`)
          
          console.log('All failed:', failedList)
          
          toast.error(`Không thể thêm sinh viên. ${failed} sinh viên thất bại!`, { duration: 6000 })
          
          // Hiển thị chi tiết lỗi
          failedList.forEach((msg: string, index: number) => {
            setTimeout(() => {
              toast.error(msg, { duration: 5000 })
            }, index * 100)
          })
        } else if (successful > 0 && failed > 0) {
          // Một số thành công, một số thất bại
          const failedList = data.results
            .filter((r: any) => !r.success)
            .map((r: any) => `${r.studentId}: ${r.error}`)
          
          const failedStudentsText = data.results
            .filter((r: any) => !r.success)
            .map((r: any) => r.studentId)
            .join(', ')
          
          console.log('Partial success:', failedList)
          
          toast.warning(
            `Thêm ${successful}/${students.length} sinh viên thành công. ${failed} sinh viên thất bại: ${failedStudentsText}`,
            { duration: 6000 }
          )
          
          // Hiển thị chi tiết lỗi
          failedList.forEach((msg: string, index: number) => {
            setTimeout(() => {
              toast.error(msg, { duration: 5000 })
            }, index * 100)
          })
          
          setTimeout(() => router.push('/dashboard/dip-issuer/students'), 3000)
        } else if (successful > 0 && failed === 0) {
          // Tất cả thành công
          toast.success(`Thêm ${successful} sinh viên thành công!`)
          setTimeout(() => router.push('/dashboard/dip-issuer/students'), 1500)
        }
      } else {
        // Legacy response
        toast.success(`Thêm ${students.length} sinh viên thành công!`)
        setTimeout(() => router.push('/dashboard/dip-issuer/students'), 1500)
      }

    } catch (err: any) {
      console.error('Lỗi:', err)
      
      // Axios error response
      if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error)
      } else {
        toast.error(err.message || 'Đã xảy ra lỗi')
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeBatchForms = (count: number) => {
    const newStudents: StudentForm[] = []
    for (let i = 0; i < count; i++) {
      newStudents.push({
        id: '',
        name: '',
        email: '',
        address: '',
        dayOfBirth: '',
        gender: 'MALE',
        phone: '',
        nameMajor: '',
        class: ''
      })
    }
    setStudents(newStudents)
  }

  const updateBatchStudent = (index: number, field: keyof StudentForm, value: string) => {
    const newStudents = [...students]
    newStudents[index] = { ...newStudents[index], [field]: value }
    setStudents(newStudents)
  }

  const removeBatchStudent = (index: number) => {
    const newStudents = students.filter((_, i) => i !== index)
    setStudents(newStudents)
    setBatchCount(newStudents.length)
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            <FaUserPlus className="inline mr-3" />
            Thêm Sinh viên
          </h1>
          <p className="text-gray-400">Thêm một hoặc nhiều sinh viên vào hệ thống</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Thêm 1 sinh viên
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'batch'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Thêm nhiều sinh viên
          </button>
        </div>

        {/* Single Student Form */}
        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">MSSV *</label>
                <input
                  type="text"
                  required
                  value={student.id}
                  onChange={(e) => setStudent({ ...student, id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="B21DCCN001"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={student.name}
                  onChange={(e) => setStudent({ ...student, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={student.email}
                  onChange={(e) => setStudent({ ...student, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Địa chỉ ví *</label>
                <input
                  type="text"
                  required
                  value={student.address}
                  onChange={(e) => setStudent({ ...student, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Ngày sinh *</label>
                <input
                  type="date"
                  required
                  value={student.dayOfBirth}
                  onChange={(e) => setStudent({ ...student, dayOfBirth: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Giới tính *</label>
                <select
                  required
                  value={student.gender}
                  onChange={(e) => setStudent({ ...student, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-black [&>option]:bg-white"
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
                  value={student.phone}
                  onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Ngành học *</label>
                <input
                  type="text"
                  required
                  value={student.nameMajor}
                  onChange={(e) => setStudent({ ...student, nameMajor: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Công nghệ thông tin"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Lớp *</label>
                <input
                  type="text"
                  required
                  value={student.class}
                  onChange={(e) => setStudent({ ...student, class: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="D21CQCN01-B"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Thêm sinh viên'}
            </button>
          </form>
        )}

        {/* Batch Students Form */}
        {mode === 'batch' && (
          <div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
              <label className="block mb-2 text-sm font-medium">Số lượng sinh viên</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => initializeBatchForms(batchCount)}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
                >
                  Tạo form
                </button>
              </div>
            </div>

            {students.length > 0 && (
              <form onSubmit={handleBatchSubmit} className="space-y-6">
                {students.map((st, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Sinh viên #{index + 1}</h3>
                      {students.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBatchStudent(index)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm">MSSV *</label>
                        <input
                          type="text"
                          required
                          value={st.id}
                          onChange={(e) => updateBatchStudent(index, 'id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Họ tên *</label>
                        <input
                          type="text"
                          required
                          value={st.name}
                          onChange={(e) => updateBatchStudent(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Email *</label>
                        <input
                          type="email"
                          required
                          value={st.email}
                          onChange={(e) => updateBatchStudent(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Địa chỉ ví *</label>
                        <input
                          type="text"
                          required
                          value={st.address}
                          onChange={(e) => updateBatchStudent(index, 'address', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Ngày sinh *</label>
                        <input
                          type="date"
                          required
                          value={st.dayOfBirth}
                          onChange={(e) => updateBatchStudent(index, 'dayOfBirth', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Giới tính *</label>
                        <select
                          required
                          value={st.gender}
                          onChange={(e) => updateBatchStudent(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
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
                          value={st.phone}
                          onChange={(e) => updateBatchStudent(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Ngành *</label>
                        <input
                          type="text"
                          required
                          value={st.nameMajor}
                          onChange={(e) => updateBatchStudent(index, 'nameMajor', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm">Lớp *</label>
                        <input
                          type="text"
                          required
                          value={st.class}
                          onChange={(e) => updateBatchStudent(index, 'class', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : `Thêm ${students.length} sinh viên`}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
