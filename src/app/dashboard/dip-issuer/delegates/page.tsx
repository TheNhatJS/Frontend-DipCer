"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import axiosInstance from "@/lib/axios";
import { toast, Toaster } from "sonner";
import { revokeDelegateOnChain, getCurrentWalletAddress } from "@/lib/contract";
import { useSession } from "next-auth/react";
import { canManageInstitution } from "@/lib/roleCheck";

type Delegate = {
  id: string;
  name: string;
  email: string;
  gender: string;
  addressWallet: string;
  dayOfBirth: string;
  isActivated: boolean;
};

export default function DelegateListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [filteredDelegates, setFilteredDelegates] = useState<Delegate[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [filterActivated, setFilterActivated] = useState<string>(""); // ✅ Thêm bộ lọc isActivated
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delegateToDelete, setDelegateToDelete] = useState<Delegate | null>(
    null
  );

  const fetchDelegates = async () => {
    try {
      setLoading(true);

      // ⚠️ CHỈ ISSUER mới được quản lý delegates
      if (!session || !canManageInstitution(session.user.role)) {
        toast.error("Bạn không có quyền truy cập trang này!");
        router.push("/");
        return;
      }

      const { data: response } = await axiosInstance.get(
        "/dip-delegate?pageSize=100"
      );

      console.log("API Response:", response);

      setDelegates(response.data || []);
      setFilteredDelegates(response.data || []);
    } catch (error: any) {
      console.error("Lỗi gọi API:", error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDelegates();
    }
  }, [session]);

  useEffect(() => {
    let filtered = delegates;

    // ✅ Lọc theo isActivated
    if (filterActivated !== "") {
      const isActive = filterActivated === "true";
      filtered = filtered.filter((d) => d.isActivated === isActive);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDelegates(filtered);
  }, [filterActivated, searchTerm, delegates]);

  const handleDelete = async (delegateId: string) => {
    try {
      setDeleting(true);

      // Tìm delegate để lấy addressWallet
      const delegate = delegates.find((d) => d.id === delegateId);
      if (!delegate) {
        toast.error("Không tìm thấy thông tin chuyên viên");
        return;
      }

      // Bước 1: Kiểm tra session
      if (!session?.user) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const institutionCode = (session.user as any).code;
      if (!institutionCode) {
        toast.error("Không tìm thấy mã trường");
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
      if (walletAddress.toLowerCase() !== sessionAddress?.toLowerCase()) {
        toast.error(
          `Địa chỉ ví không khớp!\nVí hiện tại: ${walletAddress}\nVí đã đăng ký: ${sessionAddress}`
        );
        return;
      }

      // Bước 4: Thu hồi quyền delegate trên blockchain
      toast.info("Đang thu hồi quyền delegate trên blockchain...");
      const result = await revokeDelegateOnChain(
        institutionCode,
        delegate.addressWallet
      );

      if (!result.success) {
        toast.error(result.error || "Thu hồi quyền thất bại");
        return;
      }

      // Bước 5: Xóa delegate khỏi database
      toast.info("Đang xóa delegate khỏi hệ thống...");
      await axiosInstance.delete(`/dip-delegate/${delegateId}`);

      toast.success("Xóa chuyên viên và thu hồi quyền thành công!");
      fetchDelegates();
      setSelectedDelegate(null);
      setShowDetailModal(false);
      setShowDeleteModal(false);
      setDelegateToDelete(null);
    } catch (error: any) {
      console.error("Lỗi:", error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi xóa chuyên viên"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (delegate: Delegate) => {
    setDelegateToDelete(delegate);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (delegateToDelete) {
      handleDelete(delegateToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDelegateToDelete(null);
  };

  const handleViewDetail = (delegate: Delegate) => {
    setSelectedDelegate(delegate);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setFilterActivated("");
    setSearchTerm("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white px-6 py-10 flex items-center justify-center">
        <Toaster position="top-right" richColors />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách chuyên viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Quản lý Chuyên viên
              </h1>
              <p className="text-gray-400">
                {filteredDelegates.length !== delegates.length
                  ? `Hiển thị ${filteredDelegates.length} / ${delegates.length} chuyên viên`
                  : `Tổng số: ${delegates.length} chuyên viên`}
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/dip-issuer/delegates/add")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:scale-105"
            >
              <FaPlus />
              Thêm chuyên viên
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã chuyên viên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition shadow-lg ${
                showFilters
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <FaFilter />
              Lọc
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Bộ lọc trạng thái kích hoạt */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm mb-2">Trạng thái</label>
                  <select
                    value={filterActivated}
                    onChange={(e) => setFilterActivated(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
                  >
                    <option value="" className="text-black bg-white">
                      Tất cả
                    </option>
                    <option value="true" className="text-black bg-white">
                      Còn quyền
                    </option>
                    <option value="false" className="text-black bg-white">
                      Đã thu hồi
                    </option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="self-end px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delegates Table */}
        {filteredDelegates.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
            <FaChalkboardTeacher className="mx-auto text-6xl text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm
                ? "Không tìm thấy chuyên viên phù hợp với bộ lọc"
                : "Chưa có chuyên viên nào trong hệ thống"}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      STT
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Mã CV
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Họ và tên
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Giới tính
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDelegates.map((delegate, index) => (
                    <tr
                      key={delegate.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-purple-400">
                        {delegate.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {delegate.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {delegate.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            delegate.gender === "MALE"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-pink-500/20 text-pink-300"
                          }`}
                        >
                          {delegate.gender === "MALE" ? "Nam" : "Nữ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            delegate.isActivated
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {delegate.isActivated ? "Còn quyền" : "Đã thu hồi"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(delegate)}
                            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/dip-issuer/delegates/edit/${delegate.id}`
                              )
                            }
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(delegate)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDelegate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                Chi tiết chuyên viên
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <FaTimes className="text-white text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">
                    Mã chuyên viên
                  </label>
                  <p className="text-white font-semibold text-lg">
                    {selectedDelegate.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Họ và tên</label>
                  <p className="text-white font-semibold text-lg">
                    {selectedDelegate.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Ngày sinh</label>
                  <p className="text-white">
                    {formatDate(selectedDelegate.dayOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Giới tính</label>
                  <p className="text-white">
                    {selectedDelegate.gender === "MALE" ? "Nam" : "Nữ"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedDelegate.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Địa chỉ ví</label>
                  <p className="text-white font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
                    {selectedDelegate.addressWallet || "Chưa có"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    router.push(
                      `/dashboard/dip-issuer/delegates/edit/${selectedDelegate.id}`
                    );
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  <FaEdit />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteClick(selectedDelegate);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  <FaTrash />
                  Xóa chuyên viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && delegateToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="p-6">
              {/* Icon Warning */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
                <FaTrash className="h-8 w-8 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-white mb-2">
                Xác nhận xóa chuyên viên
              </h3>

              {/* Message */}
              <p className="text-center text-gray-300 mb-4">
                Bạn có chắc chắn muốn xóa chuyên viên{" "}
                <span className="font-semibold text-purple-400">
                  {delegateToDelete.name}
                </span>{" "}
                <br />
                (Mã: {delegateToDelete.id})?
              </p>

              {/* Delegate Info */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{delegateToDelete.email}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Địa chỉ ví:</span>
                  <span className="text-white font-mono text-xs break-all">
                    {delegateToDelete.addressWallet}
                  </span>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm text-center">
                  ⚠️ Hành động này sẽ thu hồi quyền trên blockchain và xóa khỏi
                  hệ thống!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
