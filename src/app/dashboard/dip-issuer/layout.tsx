import { auth } from "@/auth";
import SideNavWrapper from "@/components/Dip-Issuer/sidenav-wrapper";
import { redirect } from "next/navigation";

export default async function IssuerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Nếu chưa đăng nhập hoặc role không phải ISSUER thì redirect
  if (!session || session.user.role !== "ISSUER") {
    return redirect("/");
  }

  const name = session?.user?.name;

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full flex-none md:w-86">
        <SideNavWrapper institutionName={name || "Không xác định"} />
      </div>
      <div className="flex-grow md:overflow-y-auto md:p-2 pt-20 md:pt-2">{children}</div>
    </div>
  );
}
