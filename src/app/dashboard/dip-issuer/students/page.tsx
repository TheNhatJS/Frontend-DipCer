"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserGraduate,
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

type Student = {
  id: string;
  name: string;
  nameMajor: string;
  phone: string;
  schoolCode: string;
  dayOfBirth: string;
  addressWallet: string;
  email: string;
  class: string;
  gender: string;
};

export default function StudentListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterMajor, setFilterMajor] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const uniqueMajors = Array.from(
    new Set(students.map((s) => s.nameMajor))
  ).sort();
  const uniqueClasses = Array.from(
    new Set(students.map((s) => s.class))
  ).sort();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Dùng axios thay vì fetch
      const { data: response } = await axiosInstance.get("/students/by-institution");
      
      setStudents(response.data || []);
      setFilteredStudents(response.data || []);
    } catch (error: any) {
      console.error("Lỗi gọi API:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (filterMajor) {
      filtered = filtered.filter((s) => s.nameMajor === filterMajor);
    }

    if (filterClass) {
      filtered = filtered.filter((s) => s.class === filterClass);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [filterMajor, filterClass, searchTerm, students]);

  const handleDelete = async (studentId: string) => {
    try {
      // Dùng axios thay vì fetch
      await axiosInstance.delete(`/students/${studentId}`);

      toast.success("Xóa sinh viên thành công!");
      fetchStudents();
      setSelectedStudent(null);
      setShowDetailModal(false);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error: any) {
      console.error("Lỗi:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi xóa sinh viên");
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      handleDelete(studentToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setFilterMajor("");
    setFilterClass("");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách sinh viên...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                <FaUserGraduate className="inline mr-3" />
                Quản lý Sinh viên
              </h1>
              <p className="text-gray-400">
                {filteredStudents.length !== students.length
                  ? `Hiển thị ${filteredStudents.length} / ${students.length} sinh viên`
                  : `Tổng số: ${students.length} sinh viên`}
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/dip-issuer/students/add")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:scale-105"
            >
              <FaPlus />
              Thêm sinh viên
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã sinh viên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm mb-2">Ngành học</label>
                  <select
                    value={filterMajor}
                    onChange={(e) => setFilterMajor(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả ngành</option>
                    {uniqueMajors.map((major) => (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm mb-2">Lớp</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả lớp</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
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

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
            <FaUserGraduate className="mx-auto text-6xl text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm || filterMajor || filterClass
                ? "Không tìm thấy sinh viên phù hợp với bộ lọc"
                : "Chưa có sinh viên nào trong hệ thống"}
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
                      Mã SV
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Họ và tên
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Ngành học
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Lớp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Giới tính
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-400">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {student.nameMajor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.gender === "MALE"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-pink-500/20 text-pink-300"
                          }`}
                        >
                          {student.gender === "MALE" ? "Nam" : "Nữ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(student)}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/dip-issuer/students/edit/${student.id}`
                              )
                            }
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
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
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                Chi tiết sinh viên
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
                  <label className="text-sm text-gray-400">Mã sinh viên</label>
                  <p className="text-white font-semibold text-lg">
                    {selectedStudent.schoolCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Họ và tên</label>
                  <p className="text-white font-semibold text-lg">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Ngày sinh</label>
                  <p className="text-white">
                    {formatDate(selectedStudent.dayOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Giới tính</label>
                  <p className="text-white">{selectedStudent.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedStudent.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Số điện thoại</label>
                  <p className="text-white">{selectedStudent.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Ngành học</label>
                  <p className="text-white">{selectedStudent.nameMajor}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Lớp</label>
                  <p className="text-white">{selectedStudent.class}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Địa chỉ ví</label>
                  <p className="text-white font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
                    {selectedStudent.addressWallet || "Chưa có"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    router.push(
                      `/dashboard/dip-issuer/students/edit/${selectedStudent.id}`
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
                    handleDeleteClick(selectedStudent);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  <FaTrash />
                  Xóa sinh viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="p-6">
              {/* Icon Warning */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
                <FaTrash className="h-8 w-8 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-white mb-2">
                Xác nhận xóa sinh viên
              </h3>

              {/* Message */}
              <p className="text-center text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa sinh viên{" "}
                <span className="font-semibold text-blue-400">
                  {studentToDelete.name}
                </span>{" "}
                (Mã: {studentToDelete.schoolCode})?
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                <p className="text-yellow-400 text-sm text-center">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition shadow-lg"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
