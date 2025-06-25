// import NextAuth, { DefaultSession } from "next-auth"
// import { JWT } from "next-auth/jwt"

// // Kiểu User chính dùng trong token/session
// interface IUser {
//     id: number // id trong bảng User
//     email: string
//     role: "STUDENT" | "DIP_ISSUER" | "CERT_ISSUER"
//     //isEmailVerified: boolean
//     roleId: string // student.id | dipIssuer.code | certIssuer.addressWallet
//     name: string   // tên hiển thị: student.name | issuer.name
//     //addressWallet: string
// }

// declare module "next-auth/jwt" {
//     interface JWT {
//         user: IUser
//         access_token: string
//         refresh_token: string
//         access_expire: number
//         error?: string
//     };
// }

// declare module "next-auth" {
//     interface Session {
//         user: IUser
//         access_token: string
//         refresh_token: string
//         access_expire: number
//         error?: string
//     }
// }

// types/next-auth.d.ts
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface User extends AdapterUser {
    role: string;
    roleId: string;
    access_token: string;
  }

  interface Session {
    user: User;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      role: string;
      roleId: string;
    };
    access_token: string;
  }
}


