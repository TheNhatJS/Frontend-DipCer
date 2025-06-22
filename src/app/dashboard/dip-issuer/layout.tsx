import SideNav from '@/components/Dip-Issuer/sidenav';

export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  const institutionName = 'Đại học Kiến Trúc Đà Nẵng' // 👈 tạm hardcode hoặc lấy từ context/API

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-86">
        <SideNav institutionName={institutionName} />
      </div>
      <div className="flex-grow md:overflow-y-auto md:p-2">{children}</div>
    </div>
  );
}
