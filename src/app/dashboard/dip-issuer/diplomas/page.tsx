'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import Contract from '@/data/abi.contract.json'
import axios from 'axios'
import { toast, Toaster } from 'sonner'

interface Diploma {
  tokenId: number
  studentId: string
  degree: string
  issuedAt: string
  image: string
  rawIssueDate: number
  tokenURI: string
}

export default function CertificateListPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDip, setSelectedDip] = useState<Diploma | null>(null)
  const [revoking, setRevoking] = useState(false)

  const formatDate = (epoch: number) => {
    const d = new Date(epoch * 1000)
    return isNaN(d.getTime()) ? 'Không rõ' : d.toLocaleDateString('vi-VN')
  }

  useEffect(() => {
    const fetchDiplomas = async () => {
      setLoading(true)
      try {
        const provider: any = await detectEthereumProvider()
        if (!provider) {
          toast.error('Không tìm thấy MetaMask')
          return
        }

        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        const userAddress = await signer.getAddress()

        const contract = new ethers.Contract(Contract.address, Contract.abi, signer)
        const diplomas = await contract.getIssuedDiplomas(userAddress)

        const certs: Diploma[] = []

        for (const d of diplomas) {
          if (!d.isValid) continue

          try {
            const tokenId = Number(d.tokenID)
            const tokenURI = await contract.tokenURI(tokenId)
            const metadata = (await axios.get(tokenURI)).data

            certs.push({
              tokenId,
              studentId: d.studentID,
              degree: metadata.classification || 'Không rõ',
              issuedAt: formatDate(Number(d.issueDate)),
              rawIssueDate: Number(d.issueDate),
              image: metadata.image,
              tokenURI,
            })
          } catch (err) {
            console.warn(`⚠️ Token ${d.tokenID} bị lỗi khi fetch metadata:`, err)
          }
        }

        setDiplomas(certs)
      } catch (err: any) {
        console.error(err)
        toast.error('Không thể lấy danh sách văn bằng!')
      } finally {
        setLoading(false)
      }
    }

    fetchDiplomas()
  }, [])

  const handleRevoke = async (tokenId: number) => {
    try {
      setRevoking(true)

      const provider: any = await detectEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      const contract = new ethers.Contract(Contract.address, Contract.abi, signer)

      const tx = await contract.revokeAndBurnDiploma(tokenId)
      await tx.wait()

      toast.success(`✅ Văn bằng token ${tokenId} đã bị thu hồi và xóa`)
      setSelectedDip(null)

      // Cập nhật lại danh sách
      setDiplomas((prev) => prev.filter((c) => c.tokenId !== tokenId))
    } catch (err: any) {
      console.error('❌ Lỗi thu hồi:', err)
      toast.error(err.message || 'Không thể thu hồi văn bằng!')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 py-10">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-blue-400">🎓 Văn bằng đã cấp</h2>

        {loading && <p className="text-gray-400">Đang tải...</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {diplomas.map((c, index) => (
            <div
              key={`${c.tokenId}-${index}`}
              onClick={() => setSelectedDip(c)}
              className="cursor-pointer bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md transition-all hover:shadow-[0_0_25px_rgba(56,182,255,0.2)] hover:-translate-y-1"
            >
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden border border-white/10">
                <img src={c.image} alt="Certificate" className="object-cover w-full h-full" />
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-blue-300 font-semibold">MSSV:</span> <span className="font-mono">{c.studentId}</span></p>
                <p><span className="text-blue-300 font-semibold">Văn bằng:</span> {c.degree}</p>
                <p><span className="text-blue-300 font-semibold">Ngày cấp:</span> {c.issuedAt}</p>
              </div>
            </div>
          ))}
        </div>

        {!loading && diplomas.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Chưa có văn bằng nào được cấp.</p>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedDip && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 text-white max-w-lg w-full p-6 rounded-xl border border-white/20 shadow-xl relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setSelectedDip(null)}
            >
              ×
            </button>

            <h3 className="text-2xl font-bold mb-4 text-blue-400">📜 Chi tiết văn bằng</h3>
            <img src={selectedDip.image} alt="Chi tiết" className="w-full h-auto rounded-lg border mb-4" />
            <p><strong>MSSV:</strong> {selectedDip.studentId}</p>
            <p><strong>Văn bằng:</strong> {selectedDip.degree}</p>
            <p><strong>Ngày cấp:</strong> {selectedDip.issuedAt}</p>
            <p><strong>Token ID:</strong> {selectedDip.tokenId}</p>
            <p>
              <strong>Xem metadata:</strong>{' '}
              <a href={selectedDip.tokenURI} className="text-blue-400 underline" target="_blank" rel="noreferrer">metadata</a>
            </p>

            <div className="mt-6 flex justify-between items-center">
              <button
                disabled={revoking}
                onClick={() => handleRevoke(selectedDip.tokenId)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
              >
                {revoking ? 'Đang thu hồi...' : 'Thu hồi văn bằng'}
              </button>
              <a
                href={`https://sepolia.etherscan.io/token/${Contract.address}?a=${selectedDip.tokenId}`}
                className="text-sm text-blue-400 underline"
                target="_blank"
              >
                🔗 Xem trên Etherscan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
