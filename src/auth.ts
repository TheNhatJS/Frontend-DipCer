import { jwtDecode } from "jwt-decode";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"
import axios from "axios";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Sử dụng axios thay vì fetch
          const response = await axios.post(
            "http://localhost:8080/api/auth/login",
            credentials,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = response.data;

          if (!data.access_token) {
            console.error("Login API error: No access token");
            return null; // ✅ Return null để NextAuth hiểu là login thất bại
          }

          const decoded: any = jwtDecode(data.access_token);
          console.log("Decoded JWT:", decoded); // Debug log

          return {
            id: decoded.id?.toString() || '',
            email: decoded.email || '',
            name: decoded.name || '',
            code: decoded.code || '',
            address: decoded.address || '',
            role: decoded.role || '',
            roleId: decoded.roleId || '',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            emailVerified: null,
          };
        } catch (err: any) {
          console.error("Authorize error:", err.response?.data || err.message);
          return null;
        }
      }

    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.user = user as any;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        // Lưu thời điểm đăng nhập
        token.accessTokenExpires = Date.now() + 30 * 60 * 1000; // 30 phút
        return token;
      }
      
      // Session update triggered (for refresh token)
      if (trigger === "update" && session?.access_token) {
        token.access_token = session.access_token;
        token.accessTokenExpires = Date.now() + 30 * 60 * 1000; // 30 phút
        return token;
      }
      
      // Kiểm tra nếu token còn hơn 5 phút thì không cần refresh
      if (Date.now() < (token.accessTokenExpires as number) - 5 * 60 * 1000) {
        return token;
      }
      
      // Token sắp hết hạn hoặc đã hết hạn - refresh token
      console.log("🔄 [JWT Callback] Token expiring soon, refreshing...");
      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          { refresh_token: token.refresh_token },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.access_token) {
          console.log("✅ [JWT Callback] Token refreshed successfully");
          return {
            ...token,
            access_token: response.data.access_token,
            accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 phút
          };
        }
      } catch (error) {
        console.error("❌ [JWT Callback] Token refresh failed:", error);
        // Giữ nguyên token cũ, để interceptor xử lý
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.access_token = token.access_token as string;
      session.refresh_token = token.refresh_token as string;
      return session;
    }
  },

  pages: {
    signIn: '/auth/login',
  }
})