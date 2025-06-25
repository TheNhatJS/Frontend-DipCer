import { jwtDecode } from "jwt-decode";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"


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
          const res = await fetch("http://localhost:8080/api/auth/login", {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (!res.ok || !data.access_token) {
            console.error("Login API error:", res.status, data);
            return null; // ✅ Return null để NextAuth hiểu là login thất bại
          }

          const decoded: any = jwtDecode(data.access_token);

          return {
            id: decoded.sub.toString(),
            email: decoded.username,
            role: decoded.role,
            roleId: decoded.roleId,
            access_token: data.access_token,
            emailVerified: null,
            name: decoded.username,
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      }

    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any; // hoặc ép kiểu rõ ràng: `as User`
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any; // hoặc ép kiểu rõ ràng: `as User`
      session.access_token = token.access_token as string;
      return session;
    }
  },

  pages: {
    signIn: '/auth/login',
  }
})