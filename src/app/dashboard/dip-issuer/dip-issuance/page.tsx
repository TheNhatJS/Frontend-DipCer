"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import axios from "axios";
import { batchMintDiplomas, getCurrentWalletAddress } from "@/lib/contract";
import { DiplomaDraft, StepType } from "@/types/diploma-draft";

// Components
import UploadExcelStep from "@/components/diploma-issuance/UploadExcelStep";
import DraftsTableStep from "@/components/diploma-issuance/DraftsTableStep";
import UploadImagesStep from "@/components/diploma-issuance/UploadImagesStep";
import ReviewApproveStep from "@/components/diploma-issuance/ReviewApproveStep";
import BatchMintStep from "@/components/diploma-issuance/BatchMintStep";

export default function IssueCertificatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [currentStep, setCurrentStep] = useState<StepType>("drafts");
  const [drafts, setDrafts] = useState<DiplomaDraft[]>([]);
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showWalletMismatchModal, setShowWalletMismatchModal] = useState(false);
  const [walletMismatchInfo, setWalletMismatchInfo] = useState<{
    registered: string;
    current: string;
  } | null>(null);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      const role = session?.user?.role;

      if (role !== "ISSUER" && role !== "DELEGATE") {
        toast.error("Bạn không có quyền truy cập trang này!");
        router.push("/");
      }
    }
  }, [status, session, router]);

  // Load drafts on mount and when step changes
  useEffect(() => {
    if (session) {
      loadDrafts();
    }
  }, [session, currentStep]);

  // Load all drafts
  const loadDrafts = async () => {
    try {
      const res = await axiosInstance.get("/diploma-drafts");
      setDrafts(res.data);
    } catch (error: any) {
      console.error("Error loading drafts:", error);
      toast.error("Không thể tải danh sách bản nháp");
    }
  };

  // Step 1: Upload Excel
  const handleUploadExcel = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/diploma-drafts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`✅ Đã import ${res.data.imported} bản nháp thành công!`);

      const skipped =
        (res.data.duplicateInExcel || 0) + (res.data.duplicateInDatabase || 0);

      if (skipped > 0) {
        toast.warning(`⚠️ Đã bỏ qua ${skipped} bản nháp trùng lặp`);
      }

      if (res.data.failed > 0) {
        toast.error(`❌ ${res.data.failed} bản nháp lỗi`);
      }

      // Reload drafts and close modal
      await loadDrafts();
      setShowUploadModal(false);
    } catch (error: any) {
      console.error("Error uploading Excel:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload Excel");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Edit Draft
  const handleEditDraft = async (id: number, data: Partial<DiplomaDraft>) => {
    await axiosInstance.patch(`/diploma-drafts/${id}`, data);
  };

  // Step 2: Delete Draft
  const handleDeleteDraft = async (id: number) => {
    await axiosInstance.delete(`/diploma-drafts/${id}`);
  };

  // Step 3: Upload Images
  const handleUploadImages = async (files: File[], draftIds: number[]) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add all image files
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Add draft IDs
      formData.append("draftIds", JSON.stringify(draftIds));

      const res = await axiosInstance.post(
        "/diploma-drafts/upload-images",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      toast.success(`✅ Đã upload ${res.data.success} ảnh thành công!`);

      if (res.data.failed > 0) {
        toast.warning(`⚠️ ${res.data.failed} ảnh thất bại`);

        // Show detailed errors
        const failedResults = res.data.results?.filter((r: any) => !r.success);
        if (failedResults && failedResults.length > 0) {
          failedResults.forEach((result: any) => {
            toast.error(
              `❌ ${result.studentId || result.serialNumber}: ${result.error}`,
              { duration: 8000 }
            );
          });
        }
      }

      // Reload drafts
      await loadDrafts();

      // Only proceed if at least some uploads succeeded
      if (res.data.success > 0) {
        setCurrentStep("review");
      }

      setUploadProgress(0);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload ảnh");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Approve Drafts
  const handleApproveDrafts = async () => {
    if (selectedDrafts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bản nháp!");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/diploma-drafts/approve", {
        ids: selectedDrafts,
      });

      toast.success(`✅ Đã phê duyệt ${res.data.count} bản nháp!`);

      // Reload drafts
      await loadDrafts();
      setCurrentStep("mint");
      setSelectedDrafts([]);
    } catch (error: any) {
      console.error("Error approving drafts:", error);
      toast.error(error.response?.data?.message || "Lỗi khi phê duyệt");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Batch Mint
  const handleBatchMint = async () => {
    const approvedDrafts = drafts.filter(
      (d) => d.isApproved && !d.isMinted && d.imageCID
    );

    if (approvedDrafts.length === 0) {
      toast.error("Không có bản nháp nào đã được phê duyệt!");
      return;
    }

    // ✅ Sắp xếp theo draft ID để đảm bảo thứ tự nhất quán và predictable
    approvedDrafts.sort((a, b) => a.id - b.id);

    setLoading(true);
    try {
      // Kiểm tra có institution code và wallet address trong session
      if (!session?.user?.code || !session?.user?.address) {
        toast.error(
          "Không tìm thấy thông tin trường hoặc địa chỉ ví trong session"
        );
        setLoading(false);
        return;
      }

      // Bước 1: Kiểm tra địa chỉ ví hiện tại khớp với session
      toast.info("🔍 Đang kiểm tra địa chỉ ví...");
      const currentWallet = await getCurrentWalletAddress();

      if (!currentWallet) {
        toast.error("Không thể lấy địa chỉ ví. Vui lòng kết nối MetaMask");
        setLoading(false);
        return;
      }

      // So sánh địa chỉ ví (case-insensitive)
      if (currentWallet.toLowerCase() !== session.user.address.toLowerCase()) {
        toast.error(
          `Địa chỉ ví không khớp!\nVí hiện tại: ${currentWallet}\nVí trong hệ thống: ${session.user.address}\nVui lòng chuyển sang đúng ví trong MetaMask`,
          { duration: 8000 }
        );
        setLoading(false);
        return;
      }

      toast.success(`✅ Xác thực ví thành công!`);

      // Prepare batch data for blockchain
      const batchData = approvedDrafts.map((draft) => ({
        studentAddress: draft.studentAddress,
        serialNumber: draft.serialNumber,
        tokenURI: "", // Will be generated from metadata
        issueDate: Math.floor(Date.now() / 1000),
      }));

      toast.info("📤 Đang upload metadata lên IPFS...");

      // ✅ Lấy thông tin trường - hoạt động cho cả ISSUER và DELEGATE
      const schoolResponse = await axiosInstance.get(`/dip-issuer/me/info`);
      const schoolData = schoolResponse.data;

      console.log("📚 School data from API:", schoolData);
      console.log("📚 Institution name:", schoolData.schoolName);

      // Upload metadata for each draft
      const metadataPromises = approvedDrafts.map(async (draft) => {
        const metadata = {
          name: `Diploma - ${draft.faculty}`,
          description: schoolData.schoolName || "Bằng cấp đại học",
          studentID: draft.studentId,
          studentName: draft.studentName,
          gpa: draft.GPA,
          faculty: draft.faculty,
          class: draft.studentClass,
          issueDate: new Date().toISOString().split("T")[0],
          institutionName: schoolData.schoolName || "Unknown", // ✅ Luôn lấy từ schoolData
          institutionCode: schoolData.code || session?.user?.code || "UNKNOWN",
          image: draft.imageCID,
        };

        console.log("📝 Metadata to upload:", metadata);

        const res = await axios.post("/api/upload/metadata", metadata, {
          headers: { "Content-Type": "application/json" },
        });

        return res.data.pinataURL;
      });

      const tokenURIs = await Promise.all(metadataPromises);

      // Update batch data with tokenURIs
      batchData.forEach((item, index) => {
        item.tokenURI = tokenURIs[index];
      });

      toast.info("⛓️ Đang mint văn bằng lên blockchain...");

      // Get institution code from session
      const institutionCode = session?.user?.code || "UNKNOWN";

      // Mint on blockchain
      const blockchainResult = await batchMintDiplomas(
        batchData,
        institutionCode
      );

      if (!blockchainResult.success || !blockchainResult.tokenIds) {
        toast.error(`❌ ${blockchainResult.error || "Lỗi không xác định"}`);
        return;
      }

      const { tokenIds, txHash } = blockchainResult;
      toast.success(`✅ Đã mint ${tokenIds.length} văn bằng thành công!`);

      // ✅ Tạo mapping chính xác giữa draft và tokenId
      const draftToTokenMap = approvedDrafts.map((draft, index) => ({
        draftId: draft.id,
        tokenId: tokenIds[index],
        serialNumber: draft.serialNumber,
      }));

      console.log("📊 Draft-Token Mapping:", draftToTokenMap);

      toast.info("💾 Đang lưu vào database...");

      // Lấy issueDate từ blockchain cho mỗi diploma
      const { getDiplomaFromBlockchain } = await import("@/lib/contract");

      console.log("🔍 Đang lấy issueDate từ blockchain...");
      const diplomasWithIssueDate = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const blockchainDiploma = await getDiplomaFromBlockchain(tokenId);
            return {
              tokenId,
              issueDate: blockchainDiploma.issueDate
                ? new Date(
                    Number(blockchainDiploma.issueDate) * 1000
                  ).toISOString()
                : new Date().toISOString(),
            };
          } catch (error) {
            console.error(`Error getting diploma ${tokenId}:`, error);
            return {
              tokenId,
              issueDate: new Date().toISOString(), // fallback
            };
          }
        })
      );

      console.log("✅ Đã lấy issueDate từ blockchain:", diplomasWithIssueDate);

      // Prepare diploma data for batch creation
      const diplomaData = approvedDrafts.map((draft, index) => ({
        id: tokenIds[index],
        serialNumber: draft.serialNumber,
        studentId: draft.studentId,
        studentName: draft.studentName,
        studentEmail: draft.studentEmail,
        studentDayOfBirth: draft.studentDayOfBirth,
        studentGender: draft.studentGender,
        studentPhone: draft.studentPhone,
        studentAddress: draft.studentAddress,
        studentClass: draft.studentClass,
        faculty: draft.faculty,
        tokenURI: tokenURIs[index],
        GPA: draft.GPA,
        issuedAt: diplomasWithIssueDate[index].issueDate, // ✅ Thêm issueDate từ blockchain
      }));

      // Save all diplomas to database using batch endpoint
      await axiosInstance.post("/diplomas/batch", {
        diplomas: diplomaData,
      });

      // Mark all drafts as minted with correct mapping
      await axiosInstance.post("/diploma-drafts/mark-many-as-minted", {
        draftIds: draftToTokenMap.map((m) => m.draftId),
        diplomaIds: draftToTokenMap.map((m) => m.tokenId),
      });

      toast.success(
        `🎉 Hoàn tất! Đã cấp phát ${tokenIds.length} văn bằng thành công!`
      );

      // Reload drafts
      await loadDrafts();
      setCurrentStep("drafts");
    } catch (error: any) {
      console.error("Error batch minting:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi mint hàng loạt"
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle draft selection
  const toggleDraftSelection = (id: number) => {
    setSelectedDrafts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all drafts (only unapproved drafts with images)
  const selectAllDrafts = () => {
    const availableDrafts = drafts.filter(
      (d) => !d.isMinted && !d.isApproved && d.imageCID
    );
    if (selectedDrafts.length === availableDrafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(availableDrafts.map((d) => d.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4 py-8">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Cấp phát văn bằng hàng loạt
          </h1>
          <p className="text-gray-400">
            Quy trình tối ưu hóa cấp phát văn bằng với batch processing
          </p>

          {/* Upload Excel Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all shadow-lg inline-flex items-center gap-2"
            >
              <span>Tải lên Excel mới</span>
            </button>
          </div>
        </div>

        {/* Progress Steps - Updated */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center gap-4">
            {[
              { id: "drafts", label: "1. Quản lý" },
              { id: "images", label: "2. Upload Ảnh" },
              { id: "review", label: "3. Phê duyệt" },
              { id: "mint", label: "4. Mint NFT" },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white scale-105"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gray-600 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md p-8">
          {/* Step 1: Manage Drafts Table */}
          {currentStep === "drafts" && (
            <DraftsTableStep
              drafts={drafts}
              loading={loading}
              onEdit={handleEditDraft}
              onDelete={handleDeleteDraft}
              onNext={() => setCurrentStep("images")}
              onBack={() => setCurrentStep("drafts")}
              onRefresh={loadDrafts}
            />
          )}

          {/* Step 2: Upload Images */}
          {currentStep === "images" && (
            <UploadImagesStep
              drafts={drafts}
              loading={loading}
              uploadProgress={uploadProgress}
              onUpload={handleUploadImages}
              onNext={() => setCurrentStep("review")}
              onBack={() => setCurrentStep("drafts")}
            />
          )}

          {/* Step 3: Review & Approve */}
          {currentStep === "review" && (
            <ReviewApproveStep
              drafts={drafts}
              selectedDrafts={selectedDrafts}
              loading={loading}
              onToggleSelection={toggleDraftSelection}
              onSelectAll={selectAllDrafts}
              onApprove={handleApproveDrafts}
              onNext={() => setCurrentStep("mint")}
              onBack={() => setCurrentStep("images")}
            />
          )}

          {/* Step 4: Batch Mint */}
          {currentStep === "mint" && (
            <BatchMintStep
              drafts={drafts}
              loading={loading}
              onMint={handleBatchMint}
              onBack={() => setCurrentStep("review")}
            />
          )}
        </div>
      </div>

      {/* Upload Excel Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Upload Excel
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <UploadExcelStep
              onUploadSuccess={loadDrafts}
              onUpload={handleUploadExcel}
              loading={loading}
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
