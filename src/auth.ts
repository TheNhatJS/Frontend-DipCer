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
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
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