"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  FaUser,
  FaEnvelope,
  FaWallet,
  FaUniversity,
  FaCalendar,
  FaPhone,
  FaGraduationCap,
  FaCertificate,
  FaPlus,
  FaUserGraduate,
} from "react-icons/fa";
import axiosInstance from "@/lib/axios";

type DelegateInfo = {
  id: string;
  name: string;
  email: string;
  addressWallet: string;
  schoolCode: string;
  phone: string;
  dayOfBirth: string;
  gender: string;
  isActivated: boolean;
  issuer?: {
    code: string;
    schoolName: string;
  };
};

type DashboardStats = {
  totalDiplomas: number;
};

export default function DelegateDashboard() {
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalDiplomas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchDelegateInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kiểm tra session và role
        if (!session || session.user.role !== "DELEGATE") {
          router.push("/auth/login");
          return;
        }

        const delegateId = session.user.roleId;

        if (!delegateId) {
          setError("Không tìm thấy thông tin phiên đăng nhập");
          toast.error("Không tìm thấy thông tin phiên đăng nhập");
          return;
        }

        // ✅ Fetch delegate info - Sử dụng axiosInstance
        const res = await axiosInstance.get(`/dip-delegate/${delegateId}`);
        setDelegateInfo(res.data);

        // Fetch statistics
        await fetchStatistics();
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu:", err);
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu"
        );
        toast.error(
          err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchStatistics = async () => {
      try {
        // ✅ Fetch diplomas count
        const diplomasRes = await axiosInstance.get(`/diplomas/by-institution`);
        console.log("📊 Diploma stats response:", diplomasRes.data);

        setStats({
          totalDiplomas: diplomasRes.data.pagination?.totalItems || 0,
        });
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      }
    };

    if (session) {
      fetchDelegateInfo();
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải thông tin...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-white rounded-3xl">
        <Toaster position="top-right" richColors />
        <main className="flex-1 px-6 py-10 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">
                Có lỗi xảy ra
              </h2>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Toaster position="top-right" richColors />

      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
            Dashboard Chuyên viên
          </h1>
          <p className="text-gray-400">Quản lý văn bằng và thông tin cá nhân</p>
        </div>

        {delegateInfo && (
          <>
            {/* Delegate Info Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Delegate Info */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-3xl text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Tên chuyên viên</p>
                      <h2 className="text-xl font-bold text-white">
                        {delegateInfo.name}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUser className="text-3xl text-pink-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Mã chuyên viên</p>
                      <p className="text-lg font-semibold text-purple-300">
                        {delegateInfo.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - School Info */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <FaUniversity className="text-3xl text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Tên trường</p>
                      <p className="text-lg font-semibold text-white">
                        {delegateInfo.issuer?.schoolName ||
                          "Không có thông tin"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUniversity className="text-3xl text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Mã trường</p>
                      <p className="text-lg font-semibold text-white">
                        {delegateInfo.issuer?.code || delegateInfo.schoolCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="mb-8">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-green-500/20 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <FaCertificate className="text-4xl text-green-400" />
                  <span className="text-3xl font-bold text-green-400">
                    {stats.totalDiplomas}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Văn bằng
                </h3>
                <p className="text-sm text-gray-400">Đã cấp phát</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaPlus className="text-purple-400" />
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    router.push("/dashboard/dip-issuer/dip-issuance")
                  }
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-6 rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-4"
                >
                  <FaUserGraduate className="text-3xl" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Cấp phát văn bằng</h3>
                    <p className="text-sm text-purple-100">
                      Thêm một hoặc nhiều văn bằng
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/dip-issuer/diplomas")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-4"
                >
                  <FaCertificate className="text-3xl" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Quản lý văn bằng</h3>
                    <p className="text-sm text-blue-100">
                      Xem và quản lý văn bằng đã cấp
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaUser className="text-blue-400" />
                Thông tin cá nhân
              </h2>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <FaEnvelope className="text-green-400 mt-1 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-lg font-semibold text-blue-300">
                        {delegateInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <FaPhone className="text-pink-400 mt-1 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Số điện thoại</p>
                      <p className="text-lg font-semibold text-white">
                        {delegateInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <FaCalendar className="text-orange-400 mt-1 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Ngày sinh</p>
                      <p className="text-lg font-semibold text-white">
                        {delegateInfo.dayOfBirth
                          ? new Date(
                              delegateInfo.dayOfBirth
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <FaUser className="text-purple-400 mt-1 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Giới tính</p>
                      <p className="text-lg font-semibold text-white">
                        {delegateInfo.gender === "MALE" ? "Nam" : "Nữ"}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <FaWallet className="text-cyan-400 mt-1 text-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        Địa chỉ ví Blockchain
                      </p>
                      <p className="text-sm font-mono text-green-400 bg-green-900/20 px-3 py-2 rounded-lg mt-1 break-all">
                        {delegateInfo.addressWallet}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!delegateInfo && !loading && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center backdrop-blur-sm">
            <p className="text-yellow-300 text-lg">
              ⚠️ Không tìm thấy thông tin chuyên viên
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
