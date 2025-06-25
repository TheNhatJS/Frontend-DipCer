'use client'

import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'

type IssuerInfo = {
  code: string
  name: string
  addressWallet: string
}

export default function IssuerInfoPage() {
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssuerInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const session = await getSession()
        const code = session?.user?.roleId
        const token = session?.access_token
        
        console.log("Session", session)
        console.log("RoleId", code)
        console.log("Token", token)

        if (!code || !token) {
          setError("Không tìm thấy thông tin phiên đăng nhập")
          return
        }

        console.log("Đang tải dữ liệu...")

        const res = await fetch(`http://localhost:8080/api/dip-issuer/${code}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        console.log("Trạng thái phản hồi:", res.status)
        console.log("Phản hồi thành công:", res.ok)

        if (!res.ok) {
          const text = await res.text()
          console.error("Lỗi backend:", res.status, text)
          setError(`Lỗi API: ${res.status} - ${text}`)
          return // Thoát sớm khi có lỗi
        }

        const data = await res.json()
        console.log("Dữ liệu nhận được:", data)
        setIssuerInfo(data)
        
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err)
        setError("Có lỗi xảy ra khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchIssuerInfo()
  }, [])

  useEffect(() => {
    console.log("Trạng thái IssuerInfo được cập nhật:", issuerInfo)
  }, [issuerInfo])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải thông tin...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">Có lỗi xảy ra</h2>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white rounded-3xl">
      <main className="flex-1 px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(56,182,255,0.1)] rounded-2xl px-6 py-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">
              🏫 Thông tin đơn vị cấp bằng
            </h1>
            <p className="text-gray-400 text-sm">
              Các thông tin bên dưới được xác thực và lưu trữ trên blockchain.
            </p>
          </div>

          {issuerInfo && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-inner shadow-blue-500/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Mã trường:</span>
                <span className="text-blue-300">{issuerInfo.code}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Tên trường:</span>
                <span className="text-blue-300">{issuerInfo.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Ví blockchain:</span>
                <span className="font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded-lg text-sm">
                  {issuerInfo.addressWallet}
                </span>
              </div>
            </div>
          )}

          {!issuerInfo && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
              <p className="text-yellow-300">Không tìm thấy thông tin đơn vị cấp bằng</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}