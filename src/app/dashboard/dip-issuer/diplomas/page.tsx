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
        tokenId: 3,
        studentId: 'SV003',
        degree: 'Thạc sĩ Quản trị kinh doanh',
        issuedAt: '2025-09-01',
        image: '/diploma-example.png',
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-blue-400">🎓 Văn bằng đã cấp</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((c, index) => (
            <div
              key={`${c.tokenId}-${index}`}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md transition-all hover:shadow-[0_0_25px_rgba(56,182,255,0.2)] hover:-translate-y-1"
            >
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden border border-white/10">
                <Image
                  src= {`/img/mau-moi-bang-dai-hoc.jpg`}
                  alt="Certificate"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="text-blue-300 font-semibold">MSSV:</span> <span className="font-mono">{c.studentId}</span></p>
                <p><span className="text-blue-300 font-semibold">Văn bằng:</span> {c.degree}</p>
                <p><span className="text-blue-300 font-semibold">Ngày cấp:</span> {c.issuedAt}</p>
                <a
                  href={`https://sepolia.etherscan.io/token/0xYourContractAddress?a=${c.tokenId}`}
                  className="text-blue-400 hover:underline block mt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Xem trên Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
