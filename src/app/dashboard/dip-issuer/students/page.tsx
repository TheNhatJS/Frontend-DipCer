'use client'

import { useEffect, useState } from 'react'

export default function StudentListPage() {
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    // Mock data: danh sách sinh viên
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
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-6 px-6 py-8">Danh sách sinh viên</h2>
      <div className="grid sm:grid-cols-2 gap-4 px-6 py-8">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white/5 p-4 rounded-lg border border-white/10"
          >
            <p><strong>MSSV:</strong> {student.id}</p>
            <p><strong>Họ tên:</strong> {student.name}</p>
            <p><strong>Khoa:</strong> {student.courseName}</p>
            <p><strong>SĐT:</strong> {student.phone}</p>
            <p><strong>Mã trường:</strong> {student.institutionCode}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
