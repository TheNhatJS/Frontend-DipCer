'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiHome, 
  HiUserGroup, 
  HiDocumentText, 
  HiAcademicCap,
  HiChartBar,
  HiUsers
} from 'react-icons/hi';

const links = [
  { 
    name: 'Tổng quan', 
    href: '/dashboard/dip-issuer', 
    icon: HiHome,
    description: 'Dashboard và thống kê'
  },
  { 
    name: 'Chuyên viên', 
    href: '/dashboard/dip-issuer/delegates', 
    icon: HiUsers,
    description: 'Quản lý chuyên viên'
  },
  { 
    name: 'Văn bằng', 
    href: '/dashboard/dip-issuer/diplomas', 
    icon: HiDocumentText,
    description: 'Văn bằng đã cấp'
  },
  { 
    name: 'Cấp phát', 
    href: '/dashboard/dip-issuer/dip-issuance', 
    icon: HiChartBar,
    description: 'Cấp phát văn bằng mới'
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        // Fix: Chỉ highlight chính xác trang đó
        // Trang tổng quan chỉ active khi pathname === '/dashboard/dip-issuer'
        // Các trang khác active khi pathname bắt đầu với href của nó
        const isActive = link.href === '/dashboard/dip-issuer' 
          ? pathname === link.href 
          : pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
            }`}
          >
            <Icon className={`text-xl flex-shrink-0 ${
              isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{link.name}</p>
              <p className={`text-xs truncate ${
                isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'
              }`}>
                {link.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}