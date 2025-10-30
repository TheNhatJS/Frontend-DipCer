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


