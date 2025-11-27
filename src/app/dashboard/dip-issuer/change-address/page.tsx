"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { HiArrowLeft, HiRefresh } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { getCurrentWalletAddress, transferIssuerRole } from "@/lib/contract";
import axios from "@/lib/axios";
import { logoutUser } from "@/lib/axios";
import { canManageInstitution } from "@/lib/roleCheck";

interface IssuerInfo {
  code: string;
  schoolName: string;
  email: string;
  addressWallet: string;
}

export default function IssuerSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // ⚠️ CHỈ ISSUER mới được đổi địa chỉ ví
    if (session && !canManageInstitution(session.user.role)) {
      toast.error("Bạn không có quyền truy cập trang này!");
      router.push("/");
      return;
    }

    if (session?.user?.roleId) {
      fetchIssuerInfo();
    }
  }, [session]);

  const fetchIssuerInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/dip-issuer/me/info");
      setIssuerInfo(response.data);
    } catch (error: any) {
      console.error("Error fetching issuer info:", error);
      toast.error("Không thể tải thông tin trường!");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWallet = async () => {
    if (!newWalletAddress) {
      toast.error("Vui lòng nhập địa chỉ ví mới!");
      return;
    }

    if (!newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Địa chỉ ví không hợp lệ!");
      return;
    }

    if (
      newWalletAddress.toLowerCase() === issuerInfo?.addressWallet.toLowerCase()
    ) {
      toast.error("Địa chỉ ví mới trùng với địa chỉ hiện tại!");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmChangeWallet = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      // Bước 1: Kiểm tra session
      if (!session?.user) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      // Bước 2: Lấy địa chỉ ví hiện tại từ MetaMask
      toast.info("Đang kết nối với MetaMask...");
      const walletAddress = await getCurrentWalletAddress();

      if (!walletAddress) {
        toast.error("Không thể lấy địa chỉ ví. Vui lòng kiểm tra MetaMask.");
        return;
      }

      // Bước 3: Kiểm tra địa chỉ ví có khớp với session không
      const sessionAddress = (session.user as any).address;
      console.log(`Địa chỉ ví trong session: ${sessionAddress}`);
      if (walletAddress.toLowerCase() !== sessionAddress?.toLowerCase()) {
        toast.error(
          `Địa chỉ ví không khớp!\nVí hiện tại: ${walletAddress}\nVí đã đăng ký: ${sessionAddress}`
        );
        return;
      }

      // Step 1: Call smart contract to transfer issuer role
      toast.info("🔄 Đang chuyển quyền trên blockchain...");

      const result = await transferIssuerRole(newWalletAddress);

      if (!result.success) {
        toast.error(result.error || "Lỗi khi chuyển quyền trên blockchain!");
        setSubmitting(false);
        return;
      }

      toast.success("✅ Chuyển quyền trên blockchain thành công!");

      // Step 2: Update wallet address in backend
      toast.info("💾 Đang cập nhật database...");

      await axios.patch("/dip-issuer/update-wallet", {
        addressWallet: newWalletAddress,
      });

      toast.success("✅ Cập nhật địa chỉ ví thành công!");

      // Step 3: Đăng xuất và yêu cầu đăng nhập lại
      toast.info("🔄 Đang đăng xuất...");

      // Xóa refresh token khỏi database
      try {
        await logoutUser();
      } catch (error) {
        console.error("Logout error:", error);
      }

      // Hiển thị thông báo trước khi đăng xuất
      toast.success("✅ Chuyển đổi địa chỉ ví thành công!");

      setTimeout(async () => {
        toast.info("📱 Vui lòng đăng nhập lại với địa chỉ ví mới!", {
          duration: 5000,
        });

        // Đăng xuất sau 2 giây
        setTimeout(async () => {
          await signOut({
            redirect: true,
            callbackUrl:
              "/login?message=Vui lòng đăng nhập lại với địa chỉ ví mới",
          });
        }, 2000);
      }, 1000);
    } catch (error: any) {
      console.error("Error changing wallet:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật địa chỉ ví!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-6 py-10 flex items-center justify-center">
      <Toaster position="top-right" richColors />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Chuyển địa chỉ ví</h1>
            <p className="text-gray-400 mt-1">
              Chuyển quyền issuer sang địa chỉ ví mới
            </p>
          </div>
        </div>

        {/* Current Wallet Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📋 Địa chỉ ví hiện tại
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Tên trường
              </label>
              <div className="text-white font-semibold text-lg">
                {issuerInfo?.schoolName}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Địa chỉ ví đang sử dụng
              </label>
              <div className="text-purple-400 font-mono text-sm bg-purple-500/10 p-4 rounded-lg border border-purple-500/30 break-all">
                {issuerInfo?.addressWallet}
              </div>
            </div>
          </div>
        </div>

        {/* Change Wallet Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            🔄 Chuyển đổi địa chỉ ví
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            Chuyển quyền issuer sang một địa chỉ ví mới. Địa chỉ mới sẽ có toàn
            quyền quản lý văn bằng của trường.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-1">
                  Lưu ý quan trọng
                </h3>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>
                    • Địa chỉ ví hiện tại sẽ <strong>mất toàn bộ quyền</strong>{" "}
                    sau khi chuyển đổi
                  </li>
                  <li>
                    • Địa chỉ ví mới sẽ có <strong>toàn quyền quản lý</strong>{" "}
                    văn bằng của trường
                  </li>
                  <li>
                    • Hành động này <strong>không thể hoàn tác</strong>
                  </li>
                  <li>
                    • Bạn sẽ bị <strong>đăng xuất tự động</strong> và cần{" "}
                    <strong>đăng nhập lại</strong> với địa chỉ ví mới
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ ví mới *
              </label>
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <p className="text-gray-400 text-xs mt-2">
                Nhập địa chỉ ví MetaMask mới sẽ trở thành issuer chính
              </p>
            </div>

            <button
              onClick={handleChangeWallet}
              disabled={submitting || !newWalletAddress}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <HiRefresh className="text-xl" />
                  <span>Chuyển đổi địa chỉ ví</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-red-500/50 max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Xác nhận chuyển đổi
                </h2>
                <p className="text-gray-300">
                  Bạn có chắc chắn muốn chuyển quyền issuer sang địa chỉ ví mới?
                </p>
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Bạn sẽ bị đăng xuất ngay sau khi chuyển đổi thành công
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-300 text-sm font-mono break-all">
                  <strong>Địa chỉ mới:</strong>
                  <br />
                  {newWalletAddress}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  <strong>📌 Sau khi chuyển đổi:</strong>
                  <br />
                  1. Địa chỉ ví cũ mất toàn bộ quyền
                  <br />
                  2. Bạn sẽ bị đăng xuất tự động
                  <br />
                  3. Đăng nhập lại với địa chỉ ví mới
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmChangeWallet}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
