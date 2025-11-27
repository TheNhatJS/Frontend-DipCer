"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiHome,
  HiUserGroup,
  HiDocumentText,
  HiAcademicCap,
  HiChartBar,
  HiUsers,
  HiCog,
  HiChevronDown,
  HiKey,
  HiRefresh,
  HiUser,
} from "react-icons/hi";
import { useSession } from "next-auth/react";
import { canManageInstitution } from "@/lib/roleCheck";

const links = [
  {
    name: "Tổng quan",
    href: "/dashboard/dip-issuer",
    icon: HiHome,
    description: "Dashboard và thống kê",
    requireIssuer: true, // ⚠️ Chỉ ISSUER
  },
  {
    name: "Tổng quan",
    href: "/dashboard/delegate",
    icon: HiUser,
    description: "Dashboard và thống kê",
    requireDelegate: true, // ⚠️ Chỉ DELEGATE
  },
  {
    name: "Chuyên viên",
    href: "/dashboard/dip-issuer/delegates",
    icon: HiUsers,
    description: "Quản lý chuyên viên",
    requireIssuer: true, // ⚠️ Chỉ ISSUER
  },
  {
    name: "Cấp phát",
    href: "/dashboard/dip-issuer/dip-issuance",
    icon: HiChartBar,
    description: "Cấp phát văn bằng mới",
    requireIssuer: false, // ✅ Cả ISSUER và DELEGATE
  },
  {
    name: "Văn bằng",
    href: "/dashboard/dip-issuer/diplomas",
    icon: HiDocumentText,
    description: "Văn bằng đã cấp",
    requireIssuer: false, // ✅ Cả ISSUER và DELEGATE
  },
];

const settingsOptions = [
  {
    name: "Chuyển địa chỉ ví",
    href: "/dashboard/dip-issuer/change-address",
    icon: HiRefresh,
    description: "Chuyển đổi địa chỉ ví",
    requireIssuer: true, // ⚠️ Chỉ ISSUER
  },
  {
    name: "Đổi mật khẩu",
    href: "/dashboard/dip-issuer/change-password",
    icon: HiKey,
    description: "Thay đổi mật khẩu",
    requireIssuer: false, // ✅ Cả ISSUER và DELEGATE
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lọc links dựa trên role
  const filteredLinks = links.filter((link) => {
    const isDelegate = !canManageInstitution(session?.user?.role);

    // Nếu link yêu cầu ISSUER và user không phải ISSUER -> ẩn
    if (link.requireIssuer && isDelegate) {
      return false;
    }

    // Nếu link yêu cầu DELEGATE và user không phải DELEGATE -> ẩn
    if (link.requireDelegate && !isDelegate) {
      return false;
    }

    return true;
  });

  // Lọc settings options dựa trên role
  const filteredSettingsOptions = settingsOptions.filter((option) => {
    if (option.requireIssuer) {
      return canManageInstitution(session?.user?.role);
    }
    return true;
  });

  return (
    <nav className="space-y-2">
      {filteredLinks.map((link) => {
        const Icon = link.icon;
        // Fix: Chỉ highlight chính xác trang đó
        // Trang tổng quan chỉ active khi pathname === '/dashboard/dip-issuer'
        // Các trang khác active khi pathname bắt đầu với href của nó
        const isActive =
          link.href === "/dashboard/dip-issuer"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
            }`}
          >
            <Icon
              className={`text-xl flex-shrink-0 ${
                isActive
                  ? "animate-pulse"
                  : "group-hover:scale-110 transition-transform"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{link.name}</p>
              <p
                className={`text-xs truncate ${
                  isActive
                    ? "text-blue-100"
                    : "text-gray-500 group-hover:text-gray-400"
                }`}
              >
                {link.description}
              </p>
            </div>
          </Link>
        );
      })}

      {/* Settings Dropdown - Chỉ hiển thị nếu có ít nhất 1 option */}
      {filteredSettingsOptions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname.startsWith("/dashboard/dip-issuer/change") ||
              pathname === "/dashboard/dip-issuer/settings"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
            }`}
          >
            <HiCog
              className={`text-xl flex-shrink-0 ${
                pathname.startsWith("/dashboard/dip-issuer/change") ||
                pathname === "/dashboard/dip-issuer/settings"
                  ? "animate-pulse"
                  : "group-hover:scale-110 transition-transform"
              }`}
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold truncate">Cài đặt</p>
              <p
                className={`text-xs truncate ${
                  pathname.startsWith("/dashboard/dip-issuer/change") ||
                  pathname === "/dashboard/dip-issuer/settings"
                    ? "text-blue-100"
                    : "text-gray-500 group-hover:text-gray-400"
                }`}
              >
                Cài đặt tài khoản
              </p>
            </div>
            <HiChevronDown
              className={`text-lg flex-shrink-0 transition-transform duration-200 ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isSettingsOpen && (
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-white/10 pl-4">
              {filteredSettingsOptions.map((option) => {
                const Icon = option.icon;
                const isActive = pathname === option.href;

                return (
                  <Link
                    key={option.name}
                    href={option.href}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`text-lg flex-shrink-0 ${
                        isActive
                          ? ""
                          : "group-hover:scale-110 transition-transform"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-white" : ""
                        }`}
                      >
                        {option.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
