import axios from "axios";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Cache session để tránh multiple getSession calls
let cachedSession: any = null;

// ✅ Export function để update cached session từ bên ngoài
export const updateAxiosSession = (session: any) => {
  console.log("📝 [updateAxiosSession] Called with session:", {
    hasSession: !!session,
    email: session?.user?.email,
    hasAccessToken: !!session?.access_token,
    hasRefreshToken: !!session?.refresh_token,
    accessTokenPreview: session?.access_token?.substring(0, 20) + "...",
  });
  
  cachedSession = session;
  
  console.log("✅ [updateAxiosSession] Cached session updated successfully");
};

// Biến để tránh nhiều request refresh cùng lúc
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log("🔍 [Request Interceptor] Starting:", {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasCachedSession: !!cachedSession,
      hasAccessToken: !!cachedSession?.access_token,
      hasRefreshToken: !!cachedSession?.refresh_token,
    });

    // ✅ Sử dụng cached session
    if (cachedSession?.access_token) {
      config.headers.Authorization = `Bearer ${cachedSession.access_token}`;
      console.log("✅ [Request Interceptor] Token added to request header");
    } else {
      console.warn("⚠️ [Request Interceptor] No access token available!");
    }

    return config;
  },
  (error) => {
    console.error("❌ [Request Interceptor] Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ [Response Interceptor] Success:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.log("❌ [Response Interceptor] Error detected:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
    });

    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔴 [Response Interceptor] 401 Unauthorized - Token expired or invalid");

      if (isRefreshing) {
        console.log("⏳ [Response Interceptor] Already refreshing - Adding to queue");
        console.log("⏳ [Response Interceptor] Queue size:", failedQueue.length);
        
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("🟢 [Response Interceptor] Queue resolved - Retrying with new token");
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            console.error("❌ [Response Interceptor] Queue rejected:", err);
            return Promise.reject(err);
          });
      }

      console.log("🔄 [Response Interceptor] Starting token refresh process");
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Sử dụng cached session
        if (!cachedSession?.refresh_token) {
          console.error("❌ [Response Interceptor] No refresh token in cached session");
          throw new Error("No refresh token available");
        }

        console.log("🔄 [Response Interceptor] Calling /auth/refresh endpoint");
        console.log("🔄 [Response Interceptor] Refresh token preview:", 
          cachedSession.refresh_token.substring(0, 20) + "...");

        // Thử refresh token
        const response = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          { refresh_token: cachedSession.refresh_token },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.access_token) {
          const newAccessToken = response.data.access_token;

          console.log("✅ [Response Interceptor] Token refreshed successfully!");
          console.log("✅ [Response Interceptor] New token preview:", 
            newAccessToken.substring(0, 20) + "...");

          // ✅ Update cached session
          cachedSession = {
            ...cachedSession,
            access_token: newAccessToken,
          };
          console.log("✅ [Response Interceptor] Updated cachedSession with new token");

          // Cập nhật token trong request hiện tại
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("✅ [Response Interceptor] Updated original request header");

          // Xử lý các request đang chờ
          console.log("🟢 [Response Interceptor] Processing queue:", failedQueue.length, "requests");
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Lưu token mới vào localStorage để update session
          if (typeof window !== "undefined") {
            localStorage.setItem("new_access_token", newAccessToken);
            console.log("💾 [Response Interceptor] Saved new token to localStorage");
            
            // Trigger custom event để components có thể update session
            console.log("📡 [Response Interceptor] Dispatching 'token-refreshed' event");
            window.dispatchEvent(
              new CustomEvent("token-refreshed", {
                detail: { access_token: newAccessToken },
              })
            );
          }

          // Thử lại request ban đầu với token mới
          console.log("🔄 [Response Interceptor] Retrying original request with new token");
          return axiosInstance(originalRequest);
        }

        // Refresh token thất bại - đăng xuất
        throw new Error("No access token in refresh response");
      } catch (refreshError: any) {
        console.error("❌ [Response Interceptor] Token refresh FAILED:", refreshError.message);
        console.error("❌ [Response Interceptor] Error details:", refreshError.response?.data);
        
        console.log("🔴 [Response Interceptor] Processing queue with error");
        processQueue(refreshError, null);
        isRefreshing = false;
        cachedSession = null;

        console.log("🚪 [Response Interceptor] Logging out user");
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        await signOut({ callbackUrl: "/auth/login" });
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    if (error.response?.status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này!");
    } else if (error.response?.status >= 500) {
      toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
    }

    return Promise.reject(error);
  }
);

// Hàm logout - Xóa refresh token khỏi database
export const logoutUser = async () => {
  try {
    if (cachedSession?.refresh_token) {
      // Gọi API logout để xóa refresh token khỏi DB
      await axiosInstance.post("/auth/logout", {
        refresh_token: cachedSession.refresh_token,
      });
    }
  } catch (error) {
    // Log lỗi nhưng vẫn tiếp tục logout ở frontend
    console.error("Logout API error:", error);
  } finally {
    // Clear cached session
    cachedSession = null;
    // Luôn signOut dù API có lỗi hay không
    await signOut({ callbackUrl: "/auth/login" });
  }
};

export default axiosInstance;
