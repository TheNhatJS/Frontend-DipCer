"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateAxiosSession } from "@/lib/axios";

/**
 * Hook để lắng nghe sự kiện refresh token và cập nhật session
 */
export function useTokenRefresh() {
  const { data: session, update } = useSession();

  console.log("🔵 [useTokenRefresh] Hook initialized");

  // ✅ Update axios session mỗi khi NextAuth session thay đổi
  useEffect(() => {
    console.log("🔵 [useTokenRefresh Effect 1] Running - Session changed");
    console.log("🔵 [useTokenRefresh Effect 1] Session:", {
      hasSession: !!session,
      email: session?.user?.email,
      hasAccessToken: !!session?.access_token,
      hasRefreshToken: !!session?.refresh_token,
    });

    if (session) {
      console.log("🔵 [useTokenRefresh Effect 1] Calling updateAxiosSession()");
      updateAxiosSession(session);
    } else {
      console.log("⚠️ [useTokenRefresh Effect 1] No session available");
    }
  }, [session]);

  // ✅ Lắng nghe event refresh token
  useEffect(() => {
    console.log("🔵 [useTokenRefresh Effect 2] Registering event listener for 'token-refreshed'");

    const handleTokenRefresh = async (event: Event) => {
      console.log("🟢 [useTokenRefresh Effect 2] 'token-refreshed' event received!");
      
      const customEvent = event as CustomEvent;
      const newAccessToken =
        customEvent.detail?.access_token ||
        localStorage.getItem("new_access_token");

      console.log("🟢 [useTokenRefresh Effect 2] New token from event:", {
        fromEventDetail: !!customEvent.detail?.access_token,
        fromLocalStorage: !!localStorage.getItem("new_access_token"),
        hasSession: !!session,
      });

      if (newAccessToken && session) {
        console.log("🔄 [useTokenRefresh Effect 2] Updating NextAuth session with new token...");

        // Cập nhật NextAuth session
        await update({
          ...session,
          access_token: newAccessToken,
        });

        // Xóa token khỏi localStorage sau khi đã update
        localStorage.removeItem("new_access_token");

        console.log("✅ [useTokenRefresh Effect 2] NextAuth session updated successfully");
      } else {
        console.warn("⚠️ [useTokenRefresh Effect 2] Cannot update - missing token or session");
      }
    };

    // Lắng nghe event từ axios interceptor
    window.addEventListener("token-refreshed", handleTokenRefresh);

    return () => {
      console.log("🔴 [useTokenRefresh Effect 2] Cleaning up event listener");
      window.removeEventListener("token-refreshed", handleTokenRefresh);
    };
  }, [session, update]);
}
