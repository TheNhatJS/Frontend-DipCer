// // src/lib/api.ts

// import { auth } from "@/auth";

// export type IssuerData = {
//   name: string;
//   code: string;
//   userId: number;
//   addressWallet: string;
// };

// export async function getSchoolNameByCode(code: string): Promise<IssuerData | null> {
//   const session = await auth();

//   if (!session?.access_token) {
//     console.error("Không có access token.");
//     return null;
//   }

//   const res = await fetch(`http://localhost:8080/api/dip-issuer/${code}`, {
//     headers: {
//       Authorization: `Bearer ${session.access_token}`,
//       "Content-Type": "application/json",
//     },
//     next: { revalidate: 60 },
//   });

//   if (!res.ok) {
//     console.error("RES: ", res);
//     return null;
//   }

//   const data = await res.json();
//   return data;
// }

