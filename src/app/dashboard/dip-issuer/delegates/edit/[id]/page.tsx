"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  FaChalkboardTeacher,
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import axiosInstance from "@/lib/axios";

type DelegateForm = {
  id: string;
  name: string;
  email: string;
  address: string;
  dayOfBirth: string;
  gender: string;
  phone: string;
  faculty: string;
};

export default function EditDelegatePage() {
  const router = useRouter();
  const params = useParams();
  const delegateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [delegate, setDelegate] = useState<DelegateForm>({
    id: "",
    name: "",
    email: "",
    address: "",
    dayOfBirth: "",
    gender: "Nam",
    phone: "",
    faculty: "",
  });

  const [originalDelegate, setOriginalDelegate] = useState<DelegateForm | null>(
    null
  );

  // Fetch delegate data
  useEffect(() => {
    const fetchDelegate = async () => {
      try {
        setLoading(true);

        // Dùng axios để lấy dữ liệu
        const { data: response } = await axiosInstance.get(
          `/dip-delegate/${delegateId}`
        );

        console.log("API Response:", response);
        const data = response.data || response;

        // Format date for input type="date"
        const formattedDate = data.dayOfBirth
          ? data.dayOfBirth.split("T")[0]
          : "";

        // Map gender from API format to display format
        const genderMap: { [key: string]: string } = {
          MALE: "Nam",
          FEMALE: "Nữ",
          Nam: "Nam",
          Nữ: "Nữ",
        };

        const delegateData = {
          id: data.id || "",
          name: data.name || "",
          email: data.email || "",
          address: data.addressWallet || "",
          dayOfBirth: formattedDate,
          gender: genderMap[data.gender] || "Nam",
          phone: data.phone || "",
          faculty: data.faculty || "",
        };

        console.log("Mapped delegate data:", delegateData);

        setDelegate(delegateData);
        setOriginalDelegate(delegateData);
      } catch (error: any) {
        console.error("Lỗi gọi API:", error);

        if (error.response?.status === 404) {
          toast.error("Không tìm thấy giảng viên");
        } else {
          toast.error(
            error.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu"
          );
        }

        setTimeout(() => router.push("/dashboard/dip-issuer/delegates"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (delegateId) {
      fetchDelegate();
    }
  }, [delegateId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if there are any changes in editable fields
      const hasChanges =
        delegate.name !== originalDelegate?.name ||
        delegate.email !== originalDelegate?.email ||
        delegate.phone !== originalDelegate?.phone ||
        delegate.faculty !== originalDelegate?.faculty ||
        delegate.dayOfBirth !== originalDelegate?.dayOfBirth ||
        delegate.gender !== originalDelegate?.gender ||
        delegate.address !== originalDelegate?.address;

      if (!hasChanges) {
        toast.info("Không có thay đổi nào để lưu");
        setSubmitting(false);
        return;
      }

      // Map gender back to API format
      const genderApiMap: { [key: string]: string } = {
        Nam: "MALE",
        Nữ: "FEMALE",
      };

      const updateData = {
        name: delegate.name,
        email: delegate.email,
        phone: delegate.phone,
        faculty: delegate.faculty,
        dayOfBirth: delegate.dayOfBirth, // Giữ nguyên format YYYY-MM-DD
        gender: genderApiMap[delegate.gender] || delegate.gender,
        addressWallet: delegate.address,
      };

      console.log("Update data:", updateData);
      console.log("Delegate ID:", delegateId);

      // Dùng axios để cập nhật
      const response = await axiosInstance.patch(
        `/dip-delegate/${delegateId}`,
        updateData
      );

      console.log("Update response:", response.data);

      toast.success("Cập nhật chuyên viên thành công!");
      setTimeout(() => router.push("/dashboard/dip-issuer/delegates"), 1500);
    } catch (err: any) {
      console.error("Lỗi:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);

      // Axios error response
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.message || "Đã xảy ra lỗi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if there are any changes in editable fields
    const hasChanges =
      delegate.name !== originalDelegate?.name ||
      delegate.email !== originalDelegate?.email ||
      delegate.phone !== originalDelegate?.phone ||
      delegate.faculty !== originalDelegate?.faculty ||
      delegate.dayOfBirth !== originalDelegate?.dayOfBirth ||
      delegate.gender !== originalDelegate?.gender ||
      delegate.address !== originalDelegate?.address;

    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      router.push("/dashboard/dip-issuer/delegates");
    }
  };

  const confirmCancel = () => {
    router.push("/dashboard/dip-issuer/delegates");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  // Check if there are changes for the warning indicator
  const hasUnsavedChanges =
    originalDelegate &&
    (delegate.name !== originalDelegate.name ||
      delegate.email !== originalDelegate.email ||
      delegate.phone !== originalDelegate.phone ||
      delegate.faculty !== originalDelegate.faculty ||
      delegate.dayOfBirth !== originalDelegate.dayOfBirth ||
      delegate.gender !== originalDelegate.gender ||
      delegate.address !== originalDelegate.address);

  if (loading) {
    return (
      <div className="min-h-screen text-white px-6 py-10 flex items-center justify-center">
        <Toaster position="top-right" richColors />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thông tin giảng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <Toaster position="top-right" richColors />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Quay lại danh sách
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            <FaChalkboardTeacher className="inline mr-3" />
            Cập nhật thông tin Giảng viên
          </h1>
          <p className="text-gray-400">
            Chỉnh sửa thông tin giảng viên {delegate.name}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID - Read only */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Mã chuyên viên
              </label>
              <input
                type="text"
                disabled
                value={delegate.id}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Không thể thay đổi mã giảng viên
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={delegate.name}
                onChange={(e) =>
                  setDelegate({ ...delegate, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Email *
              </label>
              <input
                type="email"
                required
                value={delegate.email}
                onChange={(e) =>
                  setDelegate({ ...delegate, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="delegate@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={delegate.phone}
                onChange={(e) =>
                  setDelegate({ ...delegate, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="0123456789"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Ngày sinh *
              </label>
              <input
                type="date"
                required
                value={delegate.dayOfBirth}
                onChange={(e) =>
                  setDelegate({ ...delegate, dayOfBirth: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Giới tính *
              </label>
              <select
                required
                value={delegate.gender}
                onChange={(e) =>
                  setDelegate({ ...delegate, gender: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition [&>option]:text-black [&>option]:bg-white"
              >
                <option value="Nam" className="text-black bg-white">
                  Nam
                </option>
                <option value="Nữ" className="text-black bg-white">
                  Nữ
                </option>
              </select>
            </div>

            {/* Faculty */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Khoa *
              </label>
              <input
                type="text"
                required
                value={delegate.faculty}
                onChange={(e) =>
                  setDelegate({ ...delegate, faculty: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Công nghệ thông tin"
              />
            </div>

            {/* Wallet Address */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Địa chỉ ví *
              </label>
              <input
                type="text"
                required
                value={delegate.address}
                onChange={(e) =>
                  setDelegate({ ...delegate, address: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="0x..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Địa chỉ ví blockchain của giảng viên
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FaSave />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>

          {/* Change indicator */}
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm text-center">
                ⚠️ Bạn có thay đổi chưa lưu
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="p-6">
              {/* Icon Warning */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20 mb-4">
                <FaExclamationTriangle className="h-8 w-8 text-yellow-500" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-white mb-2">
                Xác nhận hủy thay đổi
              </h3>

              {/* Message */}
              <p className="text-center text-gray-300 mb-6">
                Bạn có những thay đổi chưa được lưu. Nếu tiếp tục, tất cả thay
                đổi sẽ bị mất.
              </p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm text-center">
                  ⚠️ Thay đổi sẽ không được lưu!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition shadow-lg"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition"
                >
                  Hủy thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
