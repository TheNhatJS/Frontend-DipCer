// types/next-auth.d.ts
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface User extends AdapterUser {
    id: string;
    email: string;
    name: string;
    code: string;           // schoolCode (student/delegate) hoặc code (issuer)
    address: string;        // addressWallet
    role: string;           // STUDENT | ISSUER | DELEGATE
    roleId: string;         // id của student/issuer/delegate
    access_token: string;
    refresh_token: string;
  }

  interface Session {
    user: User;
    access_token: string;
    refresh_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      name: string;
      code: string;
      address: string;
      role: string;
      roleId: string;
    };
    access_token: string;
    refresh_token: string;
  }
}

