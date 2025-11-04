'use client'

import { useSession } from 'next-auth/react'
import { updateAxiosSession } from '@/lib/axios'
import { useEffect } from 'react'

/**
 * Component này đồng bộ NextAuth session với axios instance
 * Cần đặt trong layout để chạy ở mọi trang
 */
export default function SessionSync() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      // Cập nhật axios cached session mỗi khi NextAuth session thay đổi
      updateAxiosSession(session)
      console.log('🔄 [SessionSync] Session synced with axios')
    } else {
      // Clear session nếu user logout
      updateAxiosSession(null)
      console.log('🔄 [SessionSync] Session cleared from axios')
    }
  }, [session, status])

  // Component này không render gì
  return null
}
