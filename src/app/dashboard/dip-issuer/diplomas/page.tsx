"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaSpinner,
  FaFilter,
  FaArrowLeft,
} from "react-icons/fa";
import { toast, Toaster } from "sonner";
import axiosInstance from "@/lib/axios";
import axios from "axios";
import { revokeDiplomaOnBlockchain } from "@/lib/contract";
import { useRouter } from "next/navigation";

// Cấu trúc metadata từ IPFS
interface DiplomaMetadata {
  image: string;
  name?: string;
  description?: string;
  studentID?: string;
  studentName?: string;
  gpa?: string;
  faculty?: string;
  class?: string;
  issueDate?: string;
  institutionName?: string;
  institutionCode?: string;
}

// Cấu trúc Student từ database
interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  walletAddress: string;
  nameMajor: string;
  class: string;
  profileImage?: string;
}

// Cấu trúc diploma từ database
interface Diploma {
  id: number;
  serialNumber: string;
  studentId: string;
  issuerCode: string;
  issuerAddress: string;
  delegateAddress: string | null;
  studentAddress: string;
  faculty: string;
  issuedAt: string;
  revokedAt: string | null;
  tokenURI: string;
  issuedBy: string;
  GPA: number;
  classification: string;
  isRevoked: boolean;
  createdAt: string;
  student?: Student;
  metadata?: DiplomaMetadata;
}

export default function DiplomasPage() {
  const router = useRouter();
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [filteredDiplomas, setFilteredDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "revoked"
  >("all");
  const [filterFaculty, setFilterFaculty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDip, setSelectedDip] = useState<Diploma | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Lấy danh sách faculty unique
  const faculties = Array.from(new Set(diplomas.map((d) => d.faculty)));

  // Helper function để fetch metadata từ IPFS
  const fetchMetadataFromIPFS = async (
    tokenURI: string
  ): Promise<DiplomaMetadata | null> => {
    try {
      console.log("🔍 Fetching metadata from IPFS:", tokenURI);
      const response = await axios.get(tokenURI);
      console.log("✅ Metadata data:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy metadata từ IPFS:", error);
      return null;
    }
  };

  const fetchDiplomasFromDB = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/diplomas/by-institution");
      // Backend trả về { data: [], pagination: {}, filter: {} }
      const diplomasData: Diploma[] = response.data.data || [];
      // Fetch metadata từ IPFS cho mỗi diploma
      const diplomasWithMetadata = await Promise.all(
        diplomasData.map(async (diploma) => {
          try {
            if (diploma.tokenURI) {
              const metadata = await fetchMetadataFromIPFS(diploma.tokenURI);
              return { ...diploma, metadata: metadata || undefined };
            }
            return diploma;
          } catch (error) {
            console.error(
              `❌ Không thể lấy metadata cho diploma ${diploma.id}:`,
              error
            );
            return diploma;
          }
        })
      );

      setDiplomas(diplomasWithMetadata);
      setFilteredDiplomas(diplomasWithMetadata);
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy danh sách văn bằng:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Không thể tải danh sách văn bằng");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInfo = async (
    studentId: string
  ): Promise<Student | null> => {
    try {
      const response = await axiosInstance.get(`/students/${studentId}`);
      // Backend có thể trả về { data: student } hoặc trực tiếp student object
      return response.data.data || response.data;
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy thông tin sinh viên:", error);
      // Không hiển thị toast error để không làm phiền user
      return null;
    }
  };

  const openDetailModal = async (diploma: Diploma) => {
    setSelectedDip(diploma);
    setShowDetailModal(true);

    // Fetch student info và metadata song song
    const promises = [];

    if (!diploma.student) {
      promises.push(
        fetchStudentInfo(diploma.studentId).then((studentInfo) => {
          if (studentInfo) {
            setSelectedDip((prev) =>
              prev ? { ...prev, student: studentInfo } : prev
            );
          }
        })
      );
    }

    if (!diploma.metadata && diploma.tokenURI) {
      promises.push(
        fetchMetadataFromIPFS(diploma.tokenURI).then((metadata) => {
          if (metadata) {
            setSelectedDip((prev) =>
              prev ? { ...prev, metadata: metadata } : prev
            );
          }
        })
      );
    }

    // Chờ tất cả promises hoàn thành
    await Promise.all(promises);
  };

  useEffect(() => {
    fetchDiplomasFromDB();
  }, []);

  useEffect(() => {
    let filtered = diplomas;

    // Lọc theo tìm kiếm (studentId hoặc serialNumber)
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filterStatus === "active") {
      filtered = filtered.filter((d) => !d.isRevoked);
    } else if (filterStatus === "revoked") {
      filtered = filtered.filter((d) => d.isRevoked);
    }

    // Lọc theo chuyên ngành
    if (filterFaculty !== "all") {
      filtered = filtered.filter((d) => d.faculty === filterFaculty);
    }

    setFilteredDiplomas(filtered);
    setCurrentPage(1); // Reset về trang 1 khi filter
  }, [searchTerm, filterStatus, filterFaculty, diplomas]);

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiplomas = filteredDiplomas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDiplomas.length / itemsPerPage);

  const handleRevoke = async () => {
    if (!selectedDip) return;

    try {
      setRevoking(true);

      const result = await revokeDiplomaOnBlockchain(selectedDip.id);

      if (result.success) {
        await axiosInstance.patch(`/diplomas/${selectedDip.id}/revoke`);

        toast.success("✅ Đã thu hồi văn bằng thành công!");
        setShowDeleteModal(false);
        setSelectedDip(null);
        fetchDiplomasFromDB();
      }
    } catch (error: any) {
      console.error("Lỗi thu hồi:", error);
      toast.error(error.message || "Lỗi khi thu hồi văn bằng!");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/dashboard/dip-issuer")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
        >
          <FaArrowLeft /> Quay lại Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Danh sách văn bằng đã cấp
        </h1>

        {/* Search & Filter Button */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo MSSV hoặc số hiệu văn bằng..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${
              showFilters
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <FaFilter />
            Lọc
          </button>
        </div>

        {/* Filters - Collapsible */}
        {showFilters && (
          <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-2 text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "active" | "revoked"
                    )
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Còn hiệu lực</option>
                  <option value="revoked">Đã thu hồi</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-2 text-gray-300">
                  Chuyên ngành
                </label>
                <select
                  value={filterFaculty}
                  onChange={(e) => setFilterFaculty(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả chuyên ngành</option>
                  {faculties.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterFaculty("all");
                }}
                className="self-end px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Stats & Items per page */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Hiển thị {currentDiplomas.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
            {Math.min(indexOfLastItem, filteredDiplomas.length)} trong tổng số{" "}
            {filteredDiplomas.length} văn bằng
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Số lượng/trang:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Grid Layout */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <FaSpinner className="animate-spin text-blue-400 text-2xl" />
              <span className="text-gray-400 text-lg">Đang tải...</span>
            </div>
          </div>
        ) : currentDiplomas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {searchTerm || filterStatus !== "all"
              ? "Không tìm thấy văn bằng phù hợp"
              : "Chưa có văn bằng nào được cấp phát"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
              {currentDiplomas.map((diploma) => (
                <div
                  key={diploma.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {/* Ảnh văn bằng */}
                  <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 relative">
                    {diploma.metadata?.image ? (
                      <img
                        src={diploma.metadata.image}
                        alt={diploma.serialNumber}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaCheckCircle className="text-6xl text-white/20" />
                      </div>
                    )}
                    {diploma.isRevoked && (
                      <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          ĐÃ THU HỒI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-blue-400">
                      {diploma.serialNumber}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300 mb-4">
                      <p>
                        <span className="text-gray-400">MSSV:</span>{" "}
                        {diploma.studentId}
                      </p>
                      <p>
                        <span className="text-gray-400">Khoa:</span>{" "}
                        {diploma.faculty}
                      </p>
                      <p>
                        <span className="text-gray-400">GPA:</span>{" "}
                        {diploma.GPA}
                      </p>
                      <p>
                        <span className="text-gray-400">Xếp loại:</span>{" "}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            diploma.classification === "EXCELLENT"
                              ? "bg-purple-500/20 text-purple-400"
                              : diploma.classification === "GOOD"
                              ? "bg-green-500/20 text-green-400"
                              : diploma.classification === "CREDIT"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {diploma.classification}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Ngày cấp:</span>{" "}
                        {new Date(diploma.issuedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailModal(diploma)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Chi tiết
                      </button>
                      {!diploma.isRevoked && (
                        <button
                          onClick={() => {
                            setSelectedDip(diploma);
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Thu hồi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {showDetailModal && selectedDip && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaCheckCircle className="text-blue-400" />
                  Chi tiết văn bằng
                </h2>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Ảnh văn bằng từ IPFS */}
                {selectedDip.metadata?.image ? (
                  <div className="mb-6">
                    <img
                      src={selectedDip.metadata.image}
                      alt="Văn bằng"
                      className="w-full h-auto rounded-lg border border-white/10 shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="mb-6 aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center border border-white/10">
                    {selectedDip.tokenURI ? (
                      <div className="text-center">
                        <FaSpinner className="animate-spin text-blue-400 text-4xl mx-auto mb-2" />
                        <span className="text-gray-400 text-sm">
                          Đang tải ảnh từ IPFS...
                        </span>
                      </div>
                    ) : (
                      <FaCheckCircle className="text-6xl text-white/20" />
                    )}
                  </div>
                )}

                {/* Thông tin 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Cột 1: Thông tin sinh viên */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <FaCheckCircle />
                      Thông tin sinh viên
                    </h3>
                    {selectedDip.student ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">MSSV:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Họ tên:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ngày sinh:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.dateOfBirth
                              ? new Date(
                                  selectedDip.student.dateOfBirth
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Giới tính:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.gender}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">SĐT:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.phone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lớp:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.class}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Khoa:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.student.nameMajor}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">MSSV:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.studentId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Khoa:</span>
                          <span className="font-medium text-white text-right">
                            {selectedDip.faculty}
                          </span>
                        </div>
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Thông tin chi tiết không khả dụng
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cột 2: Thông tin văn bằng */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <FaCheckCircle />
                      Thông tin văn bằng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID:</span>
                        <span className="font-medium font-mono text-white">
                          {selectedDip.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Số văn bằng:</span>
                        <span className="font-medium text-white">
                          {selectedDip.serialNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">GPA:</span>
                        <span className="font-medium text-white">
                          {selectedDip.GPA}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Xếp loại:</span>
                        <span
                          className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                            selectedDip.classification === "EXCELLENT"
                              ? "bg-purple-500/20 text-purple-400"
                              : selectedDip.classification === "GOOD"
                              ? "bg-green-500/20 text-green-400"
                              : selectedDip.classification === "CREDIT"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {selectedDip.classification}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ngày cấp:</span>
                        <span className="font-medium text-white">
                          {new Date(selectedDip.issuedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trạng thái:</span>
                        <span
                          className={`font-medium ${
                            selectedDip.isRevoked
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {selectedDip.isRevoked
                            ? "❌ Đã thu hồi"
                            : "✅ Còn hiệu lực"}
                        </span>
                      </div>
                      {selectedDip.isRevoked && selectedDip.revokedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ngày thu hồi:</span>
                          <span className="font-medium text-red-400">
                            {new Date(selectedDip.revokedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Địa chỉ Blockchain */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <FaCheckCircle />
                    Địa chỉ Blockchain
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400 block mb-1">
                        Sinh viên:
                      </span>
                      <p className="font-mono text-xs bg-white/5 border border-white/10 p-2 rounded break-all text-gray-300">
                        {selectedDip.studentAddress}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Issuer:</span>
                      <p className="font-mono text-xs bg-white/5 border border-white/10 p-2 rounded break-all text-gray-300">
                        {selectedDip.issuerAddress}
                      </p>
                    </div>
                    {selectedDip.delegateAddress && (
                      <div>
                        <span className="text-gray-400 block mb-1">
                          Delegate:
                        </span>
                        <p className="font-mono text-xs bg-white/5 border border-white/10 p-2 rounded break-all text-gray-300">
                          {selectedDip.delegateAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Token URI */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <FaCheckCircle />
                    Token URI (IPFS)
                  </h3>
                  <a
                    href={selectedDip.tokenURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline text-sm break-all block"
                  >
                    {selectedDip.tokenURI}
                  </a>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="p-6 border-t border-white/10 bg-gray-900/95 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  Đóng
                </button>
                {!selectedDip.isRevoked && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Thu hồi văn bằng
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* {showDeleteModal && selectedDip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-red-400">
              ⚠️ Xác nhận thu hồi
            </h2>
            <p className="mb-6 text-gray-300">
              Bạn có chắc chắn muốn thu hồi văn bằng{" "}
              <strong className="text-white">{selectedDip.serialNumber}</strong>
              ?
              <br />
              <span className="text-red-400">
                Hành động này không thể hoàn tác!
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={revoking}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {revoking ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Đang thu hồi...
                  </>
                ) : (
                  "Xác nhận thu hồi"
                )}
              </button>
            </div>
          </div>
        </div>
      )} */}
      </div>
    </div>
  );
}
