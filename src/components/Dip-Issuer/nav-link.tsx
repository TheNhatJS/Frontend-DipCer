'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiUserGroup, HiDocumentText } from 'react-icons/hi';

const links = [
  { name: 'Thông tin trường', href: '/dashboard/dip-issuer', icon: <HiHome /> },
  { name: 'Danh sách sinh viên', href: '/dashboard/dip-issuer/students', icon: <HiUserGroup /> },
  { name: 'Văn bằng đã cấp', href: '/dashboard/dip-issuer/diplomas', icon: <HiDocumentText /> },
  { name: 'Cấp phát văn bằng', href: '/dashboard/dip-issuer/dip-issuance', icon: <HiDocumentText /> },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${pathname === link.href
            ? 'bg-indigo-600 text-white'
            : 'text-gray-300 hover:bg-indigo-700 hover:text-white'}`}
        >
          <span className="text-lg">{link.icon}</span>
          <span>{link.name}</span>
        </Link>
      ))}
    </>
  );
}