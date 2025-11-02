import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const session = await getSession()
        
        // Thử refresh token
        if (session?.refresh_token) {
          const response = await axios.post(
            'http://localhost:8080/api/auth/refresh',
            { refresh_token: session.refresh_token },
            { headers: { 'Content-Type': 'application/json' } }
          )

          if (response.data?.access_token) {
            // Update session với access token mới
            // Note: NextAuth không tự động update session, cần reload
            window.location.reload()
            return
          }
        }

        // Refresh token thất bại - đăng xuất
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
        await signOut({ callbackUrl: '/auth/login' })
        return Promise.reject(error)
      } catch (refreshError) {
        toast.error('Không thể làm mới phiên đăng nhập!')
        await signOut({ callbackUrl: '/auth/login' })
        return Promise.reject(refreshError)
      }
    }

    // Xử lý các lỗi khác
    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này!')
    } else if (error.response?.status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau!')
    }

    return Promise.reject(error)
  }
)

// Hàm logout - Xóa refresh token khỏi database
export const logoutUser = async () => {
  try {
    const session = await getSession()
    
    if (session?.refresh_token) {
      // Gọi API logout để xóa refresh token khỏi DB
      await axiosInstance.post('/auth/logout', {
        refresh_token: session.refresh_token,
      })
    }
  } catch (error) {
    // Log lỗi nhưng vẫn tiếp tục logout ở frontend
    console.error('Logout API error:', error)
  } finally {
    // Luôn signOut dù API có lỗi hay không
    await signOut({ callbackUrl: '/auth/login' })
  }
}

export default axiosInstance
