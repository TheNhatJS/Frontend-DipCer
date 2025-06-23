'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Certificate {
  tokenId: number
  studentId: string
  degree: string
  issuedAt: string
  image: string
}

export default function CertificateListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    // Mock data
    setCertificates([
      {
        tokenId: 1,
        studentId: 'SV001',
        degree: 'Cử nhân Công nghệ thông tin',
        issuedAt: '2025-07-01',
        image: '/diploma-example.png',
      },
      {
        tokenId: 2,
        studentId: 'SV002',
        degree: 'Cử nhân Thiết kế nội thất',
        issuedAt: '2025-08-15',
        image: '/certificate-example.png',
      },
      {
        tokenId: 1,
        studentId: 'SV001',
        degree: 'Cử nhân Công nghệ thông tin',
        issuedAt: '2025-07-01',
        image: '/diploma-example.png',
      },
      {
        tokenId: 2,
        studentId: 'SV002',
        degree: 'Cử nhân Thiết kế nội thất',
        issuedAt: '2025-08-15',
        image: '/certificate-example.png',
      },
      {
        tokenId: 1,
        studentId: 'SV001',
        degree: 'Cử nhân Công nghệ thông tin',
        issuedAt: '2025-07-01',
        image: '/diploma-example.png',
      },
      {
        tokenId: 2,
        studentId: 'SV002',
        degree: 'Cử nhân Thiết kế nội thất',
        issuedAt: '2025-08-15',
        image: '/certificate-example.png',
      },
    ])
  }, [])

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 px-6 py-8">Văn bằng đã cấp</h2>

      <div className="grid sm:grid-cols-2 gap-6 px-6 py-8">
        {certificates.map((c) => (
          <div
            key={c.tokenId}
            className="bg-white/5 p-4 rounded-xl border border-white/10 shadow"
          >
            <Image
              src={c.image}
              alt="Certificate"
              width={400}
              height={200}
              className="rounded mb-3"
            />
            <p><strong>MSSV:</strong> {c.studentId}</p>
            <p><strong>Văn bằng:</strong> {c.degree}</p>
            <p><strong>Ngày cấp:</strong> {c.issuedAt}</p>
            <a
              href={`https://sepolia.etherscan.io/token/0xYourContractAddress?a=${c.tokenId}`}
              className="text-blue-400 hover:underline text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem trên Etherscan
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
