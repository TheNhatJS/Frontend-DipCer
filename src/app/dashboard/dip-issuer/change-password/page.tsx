"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { HiArrowLeft, HiEye, HiEyeOff, HiKey } from "react-icons/hi";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }

    try {
      setSubmitting(true);

      await axios.patch("/users/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      toast.success("✅ Đổi mật khẩu thành công!");
      
      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect sau 1.5 giây
      setTimeout(() => {
        const role = (session?.user as any)?.role;
        if (role === 'ISSUER') {
          router.push("/dashboard/dip-issuer");
        } else if (role === 'DELEGATE') {
          router.push("/dashboard/dip-issuer"); // Hoặc delegate dashboard nếu có
        } else {
          router.push("/dashboard");
        }
      }, 1500);

    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi đổi mật khẩu!";
      
      if (errorMessage.includes("incorrect") || errorMessage.includes("Old password")) {
        toast.error("❌ Mật khẩu cũ không chính xác!");
      } else {
        toast.error("❌ " + errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    const role = (session?.user as any)?.role;
    if (role === 'ISSUER') {
      router.push("/dashboard/dip-issuer");
    } else if (role === 'DELEGATE') {
      router.push("/dashboard/dip-issuer"); // Hoặc delegate dashboard nếu có
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen text-white px-6 py-10 flex items-center justify-center">
      <Toaster position="top-right" richColors />
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            <HiArrowLeft className="text-2xl text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Đổi mật khẩu</h1>
            <p className="text-gray-400 mt-1">
              Thay đổi mật khẩu đăng nhập của bạn
            </p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <HiKey className="text-3xl text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cập nhật mật khẩu</h2>
              <p className="text-gray-300 text-sm">
                Vui lòng nhập mật khẩu cũ và mật khẩu mới
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="text-blue-400 font-semibold mb-1">
                  Lưu ý
                </h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Mật khẩu phải có ít nhất <strong>6 ký tự</strong></li>
                  <li>• Nên sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mật khẩu hiện tại *
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showOldPassword ? (
                    <HiEyeOff className="text-xl" />
                  ) : (
                    <HiEye className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mật khẩu mới *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showNewPassword ? (
                    <HiEyeOff className="text-xl" />
                  ) : (
                    <HiEye className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Xác nhận mật khẩu mới *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="text-xl" />
                  ) : (
                    <HiEye className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <HiKey className="text-xl" />
                    <span>Đổi mật khẩu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
