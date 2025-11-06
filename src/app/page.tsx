"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SlideSelection from "@/components/Home/slide";
import Features from "@/components/Home/feature";
import Process from "@/components/Home/process";
import { toast, Toaster } from "sonner";
import { getSession } from "next-auth/react";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import getIpfsUrlFromPinata from "./api/upload/image/utils";
import { CONTRACT_INFO } from "@/lib/contractInfo";
const { verifyDiplomaWithBlockchain } = await import("@/lib/contract");

export default function Home() {
  const [serialNumber, setSerialNumber] = useState("");
  const [diplomaData, setDiplomaData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "valid" | "tampered" | null
  >(null);

  const searchSectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    try {
      // 1. Validate input
      if (!serialNumber || serialNumber.trim() === "") {
        toast.error("Vui lòng nhập số hiệu văn bằng!");
        return;
      }

      setVerificationStatus(null);
      toast.loading("Đang tra cứu văn bằng...", { id: "search" });

      // 2. Lấy thông tin văn bằng từ database
      const response = await axiosInstance.get(
        `/diplomas/seri/${serialNumber.trim()}`
      );

      if (!response.data) {
        toast.error("Không tìm thấy văn bằng với số hiệu này!", {
          id: "search",
        });
        return;
      }

      const diplomaFromDB = response.data;
      console.log("📄 Thông tin văn bằng từ database:", diplomaFromDB);

      // 3. Load metadata từ IPFS (dùng axios thông thường vì gọi external URL)
      const metadataResponse = await axios.get(diplomaFromDB.tokenURI);
      const metadata = metadataResponse.data;
      console.log("📦 Metadata từ IPFS:", metadata);

      const rawImageUrl = metadata.image;
      if (!rawImageUrl) {
        toast.error("Không tìm thấy đường dẫn ảnh trong metadata", {
          id: "search",
        });
        return;
      }

      const IPFSUrl = getIpfsUrlFromPinata(rawImageUrl);

      // 4. Xác thực văn bằng với blockchain
      toast.loading("Đang xác thực với blockchain...", { id: "search" });

      // ✅ Sử dụng issueDate từ blockchain (nguồn tin cậy)
      const verificationResult = await verifyDiplomaWithBlockchain({
        tokenId: diplomaFromDB.id,
        institutionCode: diplomaFromDB.issuerCode,
        serialNumber: diplomaFromDB.serialNumber,
        studentAddress: diplomaFromDB.studentAddress,
        issuerAddress: diplomaFromDB.issuerAddress,
        issueDate: Math.floor(
          new Date(diplomaFromDB.issuedAt).getTime() / 1000
        ),
        tokenURI: diplomaFromDB.tokenURI,
      });

      console.log("🔐 Kết quả xác thực:", verificationResult);

      // 5. Set verification status
      if (!verificationResult.success || !verificationResult.isValid) {
        setVerificationStatus("tampered");
        toast.error(verificationResult.message, { id: "search" });
        // Still show the modal but with warning
      } else {
        setVerificationStatus("valid");
        toast.success("✅ Văn bằng hợp lệ!", { id: "search" });
      }

      // 6. Set dữ liệu để hiển thị modal
      setDiplomaData({
        id: diplomaFromDB.id,
        serialNumber: diplomaFromDB.serialNumber,
        name: metadata.fullName || metadata.studentName,
        degree: metadata.classification,
        issuedBy: diplomaFromDB.issuerAddress,
        issuerCode: diplomaFromDB.issuerCode,
        image: IPFSUrl,
        dayOfBirth: diplomaFromDB.studentDayOfBirth,
        issuedAt: new Date(diplomaFromDB.issuedAt), // Database field là 'issuedAt'
        address: diplomaFromDB.studentAddress,
        school: metadata.school || metadata.institutionName,
        faculty: metadata.faculty,
        status: diplomaFromDB.status,
      });

      // Mở modal
      setShowModal(true);
    } catch (error: any) {
      console.error("❌ Lỗi tra cứu:", error);

      if (
        error.response?.status === 404 ||
        error.response?.data?.message === "Diploma not found"
      ) {
        toast.error("Không tìm thấy văn bằng với số hiệu này!", {
          id: "search",
        });
      } else if (error.message?.includes("MetaMask")) {
        toast.error("Vui lòng cài đặt MetaMask để xác thực văn bằng!", {
          id: "search",
        });
      } else {
        toast.error(
          error.response?.data?.message || "Lỗi khi tra cứu văn bằng!",
          { id: "search" }
        );
      }

      setDiplomaData(null);
      setShowModal(false);
      setVerificationStatus(null);
    }
  };

  const scrollToSearch = () => {
    setTimeout(() => {
      searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#202328] text-white relative">
      <Header />
      <Toaster position="top-right" richColors />

      {/* Slide */}
      <SlideSelection onScrollToSearch={scrollToSearch} />

      {/* Features */}
      <Features />

      {/* Search Section */}
      <div ref={searchSectionRef}>
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-800 to-slate-900 text-center py-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
            Xác thực văn bằng{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              dễ dàng
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Nhà tuyển dụng có thể kiểm tra nhanh chóng tính xác thực của văn
            bằng chỉ bằng cách nhập số hiệu văn bằng. Thông tin được xác minh
            trực tiếp trên blockchain, đảm bảo độ tin cậy tuyệt đối.
          </p>

          <div className="flex flex-col gap-6 backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8 w-full max-w-md text-center hover:shadow-[0_10px_25px_rgba(56,182,255,0.2)] transition-shadow duration-300">
            <h3 className="text-2xl font-semibold text-white">
              Tra cứu văn bằng
            </h3>
            <input
              type="text"
              placeholder="Nhập số hiệu văn bằng..."
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 rounded-xl transition duration-200 shadow hover:scale-105"
            >
              Tra cứu
            </button>
          </div>
        </section>
      </div>

      {/* Process Section */}
      <Process />

      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              {" "}
              chuyển đổi số
            </span>
            <br /> hệ thống văn bằng của bạn?
          </h2>
        </div>
      </section>

      {/* Modal */}
      {showModal && diplomaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="bg-[#1E1E24] text-white rounded-2xl overflow-hidden w-full max-w-7xl shadow-xl flex flex-col sm:flex-row">
            {/* Left: Diploma image */}
            <div className="sm:w-1/2 relative h-64 sm:h-auto">
              <img
                src={diplomaData.image}
                alt="Diploma"
                className="w-full h-full object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
              />

              {/* Verification Badge Overlay */}
              {verificationStatus && (
                <div className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold shadow-lg backdrop-blur-sm">
                  {verificationStatus === "valid" ? (
                    <div className="bg-green-500/90 text-white flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      <span>Đã xác thực</span>
                    </div>
                  ) : (
                    <div className="bg-red-500/90 text-white flex items-center gap-2">
                      <span className="text-xl">⚠</span>
                      <span>Đã bị thay đổi</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-blue-400">
                    🎓 Thông tin văn bằng
                  </h3>
                  {verificationStatus === "valid" && (
                    <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/50">
                      ✓ Hợp lệ
                    </span>
                  )}
                  {verificationStatus === "tampered" && (
                    <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/50">
                      ⚠ Cảnh báo
                    </span>
                  )}
                </div>

                {verificationStatus === "tampered" && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      ⚠️ <strong>Cảnh báo:</strong> Văn bằng này đã bị thay đổi
                      hoặc không khớp với dữ liệu trên blockchain!
                    </p>
                  </div>
                )}

                <p>
                  <span className="font-semibold text-white/80">
                    � Số hiệu:
                  </span>{" "}
                  {diplomaData.serialNumber}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    �👤 Họ tên:
                  </span>{" "}
                  {diplomaData.name}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    🎂 Ngày sinh:
                  </span>{" "}
                  {diplomaData.dayOfBirth
                    ? new Date(diplomaData.dayOfBirth).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Không có"}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    🏫 Trường:
                  </span>{" "}
                  {diplomaData.school}
                </p>
                <p>
                  <span className="font-semibold text-white/80">🏛️ Khoa:</span>{" "}
                  {diplomaData.faculty}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    📅 Ngày cấp:
                  </span>{" "}
                  {diplomaData.issuedAt instanceof Date
                    ? diplomaData.issuedAt.toLocaleDateString("vi-VN")
                    : "Không rõ"}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    🏢 Đơn vị cấp:
                  </span>
                  <span className="break-all block text-gray-300">
                    {diplomaData.issuedBy}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    📍 Mã trường:
                  </span>{" "}
                  {diplomaData.issuerCode}
                </p>
                <p>
                  <span className="font-semibold text-white/80">
                    💼 Địa chỉ sở hữu:
                  </span>
                  <span className="break-all block text-gray-300">
                    {diplomaData.address}
                  </span>
                </p>

                <a
                  href={`https://sepolia.etherscan.io/token/${CONTRACT_INFO.address}?a=${diplomaData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-400 hover:underline"
                >
                  🔍 Xem trên Etherscan
                </a>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setVerificationStatus(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
