import { auth } from "@/auth";
import SideNav from "@/components/Dip-Issuer/sidenav";
import { getSchoolNameByCode, IssuerData } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function IssuerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Nếu chưa đăng nhập hoặc role không phải DIP_ISSUER thì redirect
  if (!session || session.user.role !== "DIP_ISSUER") {
    return redirect("/"); // 👈 Chuyển về trang home
  }

  const code = session?.user?.roleId;

  let issuerInfo: IssuerData | null = null;

  if (code) {
    issuerInfo = await getSchoolNameByCode(code);
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-86">
        <SideNav institutionName={issuerInfo?.name || "Không xác định"} />
      </div>
      <div className="flex-grow md:overflow-y-auto md:p-2">{children}</div>
    </div>
  );
}
