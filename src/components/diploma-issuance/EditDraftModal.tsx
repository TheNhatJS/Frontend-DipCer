"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DiplomaDraft } from "@/types/diploma-draft";

interface EditDraftModalProps {
  draft: DiplomaDraft;
  onClose: () => void;
  onSave: (data: Partial<DiplomaDraft>) => Promise<void>;
}

export default function EditDraftModal({
  draft,
  onClose,
  onSave,
}: EditDraftModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    studentId: draft.studentId,
    serialNumber: draft.serialNumber,
    studentName: draft.studentName,
    studentEmail: draft.studentEmail,
    studentPhone: draft.studentPhone,
    studentDayOfBirth: draft.studentDayOfBirth.split("T")[0],
    studentGender: draft.studentGender,
    studentAddress: draft.studentAddress,
    studentClass: draft.studentClass,
    faculty: draft.faculty,
    GPA: draft.GPA,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const calculateClassification = (gpa: number) => {
    if (gpa >= 3.6) return "EXCELLENT";
    if (gpa >= 3.2) return "GOOD";
    if (gpa >= 2.5) return "CREDIT";
    if (gpa >= 2.0) return "AVERAGE";
    return "FAIL";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        ...formData,
        studentDayOfBirth: new Date(formData.studentDayOfBirth).toISOString(),
      };

      // Recalculate classification if GPA changed
      if (formData.GPA !== draft.GPA) {
        updateData.classification = calculateClassification(formData.GPA);
      }

      await onSave(updateData);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "GPA" ? parseFloat(value) : value,
    }));
  };

  if (!mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-400">
            ✏️ Chỉnh sửa bản nháp
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                MSSV
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Số hiệu văn bằng                
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">
                Họ tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Ngày sinh <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="studentDayOfBirth"
                value={formData.studentDayOfBirth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Giới tính <span className="text-red-400">*</span>
              </label>
              <select
                name="studentGender"
                value={formData.studentGender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Lớp <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="studentClass"
                value={formData.studentClass}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">
                Địa chỉ ví <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="studentAddress"
                value={formData.studentAddress}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">
                Ngành <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                GPA (1.0 - 4.0) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="4.0"
                name="GPA"
                value={formData.GPA}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
              />
              {formData.GPA && (
                <p className="text-xs text-gray-400 mt-1">
                  💡 Xếp loại:{" "}
                  {formData.GPA >= 3.6
                    ? "🏆 Xuất sắc"
                    : formData.GPA >= 3.2
                    ? "🥇 Giỏi"
                    : formData.GPA >= 2.5
                    ? "🥈 Khá"
                    : formData.GPA >= 2.0
                    ? "🥉 Trung bình"
                    : "❌ Yếu"}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 rounded-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
