import { auth } from "@/auth";
import SideNav from "@/components/Dip-Issuer/sidenav";
import { redirect } from "next/navigation";

export default async function IssuerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Nếu chưa đăng nhập hoặc role không phải ISSUER thì redirect
  if (!session || session.user.role !== "ISSUER") {
    return redirect("/"); // 👈 Chuyển về trang home
  }

  const code = session?.user?.code;
  const name = session?.user?.name;

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-86">
        <SideNav institutionName={name || "Không xác định"} />
      </div>
      <div className="flex-grow md:overflow-y-auto md:p-2">{children}</div>
    </div>
  );
}
