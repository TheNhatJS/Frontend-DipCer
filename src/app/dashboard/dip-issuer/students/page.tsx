'use client'

import { useEffect, useState } from 'react'

export default function StudentListPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  useEffect(() => {
    setStudents([
      {
        id: 'SV001',
        name: 'Nguyễn Văn A',
        courseName: 'Công nghệ thông tin',
        phone: '0909123456',
        institutionCode: 'DAUKT',
      },
      {
        id: 'SV002',
        name: 'Trần Thị B',
        courseName: 'Kiến trúc',
        phone: '0912345678',
        institutionCode: 'DAUKT',
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-blue-400">📚 Danh sách sinh viên</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,182,255,0.15)] hover:-translate-y-1"
            >
              <p className="mb-2">
                <span className="font-semibold text-blue-300">🎓 MSSV:</span>{' '}
                <span className="font-mono text-white">{student.id}</span>
              </p>
              <p className="mb-2">
                <span className="font-semibold text-blue-300">👤 Họ tên:</span>{' '}
                {student.name}
              </p>
              <p className="mb-2">
                <span className="font-semibold text-blue-300">🏫 Khoa:</span>{' '}
                {student.courseName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal hiển thị chi tiết sinh viên */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#1f2227] text-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Chi tiết sinh viên</h3>
            <div className="space-y-2">
              <p><strong>MSSV:</strong> <span className="font-mono text-blue-200">{selectedStudent.id}</span></p>
              <p><strong>Họ tên:</strong> {selectedStudent.name}</p>
              <p><strong>Khoa:</strong> {selectedStudent.courseName}</p>
              <p><strong>Số điện thoại:</strong> <span className="text-green-400">{selectedStudent.phone}</span></p>
              <p><strong>Mã trường:</strong> <span className="text-purple-400">{selectedStudent.institutionCode}</span></p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
