"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProgressIndicator from "@/components/Progress-Indicator";
import StepInitiate from "@/components/Step-INITIATE";
import StepEmailSent from "@/components/Step-EMAIL-SENT";
import StepDnsSetup from "@/components/Step-DNS-SETUP";
import StepDnsVerified from "@/components/Step-DNS-VERIFIED";
import StepComplete from "@/components/Step-COMPLETE";
import ResumePrompt from "@/components/ResumePrompt";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { approveIssuerOnChain } from "@/lib/contract";
import axiosInstance from "@/lib/axios";

type RegistrationStep =
  | "INITIATE"
  | "EMAIL_SENT"
  | "EMAIL_VERIFIED"
  | "DNS_SETUP"
  | "DNS_VERIFIED"
  | "COMPLETE";

export default function RegisterIssuerPage() {
  const router = useRouter();

  // Resume registration states
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isResumingRegistration, setIsResumingRegistration] = useState(false);

  // Step 1: Initiate Registration
  const [step, setStep] = useState<RegistrationStep>("INITIATE");
  const [code, setCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [addressWallet, setAddressWallet] = useState("");

  // Step 2: Email Verification
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [emailToken, setEmailToken] = useState("");

  // Step 3: DNS Verification
  const [dnsRecordName, setDnsRecordName] = useState("");
  const [dnsToken, setDnsToken] = useState("");
  const [dnsInstructions, setDnsInstructions] = useState("");
  const [isDnsChecking, setIsDnsChecking] = useState(false);

  // Step 4: Complete
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Blockchain approval states
  const [isApprovingBlockchain, setIsApprovingBlockchain] = useState(false);
  const [blockchainApproved, setBlockchainApproved] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");
  const [txHash, setTxHash] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ========== CHECK EXISTING REGISTRATION ON MOUNT ==========
  useEffect(() => {
    const savedEmail = localStorage.getItem("registration_email");
    if (savedEmail) {
      checkExistingRegistration(savedEmail);
    }
  }, []);

  const checkExistingRegistration = async (email: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/dip-issuer/register/status?email=${encodeURIComponent(
          email
        )}`
      );
      const data = await res.json();

      if (data.exists && data.canResume) {
        setResumeData(data.data);
        setShowResumePrompt(true);
      } else {
        // Không có registration hoặc đã hết hạn, xóa localStorage
        localStorage.removeItem("registration_email");
      }
    } catch (err) {
      console.error("Error checking registration status:", err);
      // Nếu có lỗi, vẫn cho phép đăng ký mới
      localStorage.removeItem("registration_email");
    }
  };

  const handleResumeRegistration = async () => {
    if (!resumeData) return;

    setIsResumingRegistration(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/api/dip-issuer/register/resume",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resumeData.email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể tiếp tục đăng ký");
        localStorage.removeItem("registration_email");
        setShowResumePrompt(false);
        return;
      }

      // Restore state từ resumeData
      setEmail(resumeData.email);
      setCode(resumeData.code);
      setSchoolName(resumeData.schoolName);
      setAddressWallet(resumeData.addressWallet || "");
      setVerificationId(resumeData.verificationId);

      // Navigate to correct step based on response
      if (data.step === "EMAIL") {
        setStep("EMAIL_SENT");
        setSuccessMessage(
          "Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư."
        );
      } else if (data.step === "DNS") {
        setDnsRecordName(data.dnsRecordName);
        setDnsToken(data.dnsToken);
        setDnsInstructions(data.instructions);
        setStep("DNS_SETUP");
        setSuccessMessage("Vui lòng hoàn tất cấu hình DNS để tiếp tục!");
      } else if (data.step === "COMPLETED") {
        setStep("DNS_VERIFIED");
        setSuccessMessage("Vui lòng tạo mật khẩu để hoàn tất đăng ký!");
      }

      setShowResumePrompt(false);
    } catch (err) {
      console.error("Error resuming registration:", err);
      setError("Không thể tiếp tục đăng ký. Vui lòng thử lại sau.");
    } finally {
      setIsResumingRegistration(false);
    }
  };

  const handleStartNewRegistration = () => {
    localStorage.removeItem("registration_email");
    setResumeData(null);
    setShowResumePrompt(false);
    setError("");
    setSuccessMessage("");
  };

  // ========== STEP 1: INITIATE REGISTRATION ==========
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // const res = await fetch(
      //   "http://localhost:8080/api/dip-issuer/register/initiate",
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       code: code.toUpperCase(),
      //       schoolName,
      //       email,
      //       addressWallet,
      //     }),
      //   }
      // );

      const res = await axiosInstance.post("/dip-issuer/register/initiate", {
        code: code.toUpperCase(),
        schoolName,
        email,
        addressWallet,
      });

      // Kiểm tra mã trạng thái HTTP
      if (res.status !== 200) {
        setError(res.data.message || "Đăng ký thất bại");
        return;
      }

      // ✅ Save email to localStorage for resume
      localStorage.setItem("registration_email", email);
      const data = res.data;
      setVerificationId(data.verificationId);
      setSuccessMessage(data.message);
      setStep("EMAIL_SENT");
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 2: VERIFY EMAIL TOKEN ==========
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/dip-issuer/register/verify-email?token=${emailToken}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Xác thực email thất bại");
        return;
      }

      setVerificationId(data.verificationId);
      setDnsRecordName(data.dnsRecordName);
      setDnsToken(data.dnsToken);
      setDnsInstructions(data.instructions);
      setSuccessMessage(data.message);
      setStep("DNS_SETUP");
    } catch (err) {
      console.error("Lỗi khi xác thực email:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 3: VERIFY DNS RECORD ==========
  // Auto-check DNS status when entering DNS_SETUP step
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (step === "DNS_SETUP" && verificationId) {
      // Kiểm tra DNS ngay lập tức khi vào step này
      checkDnsStatus();

      // Sau đó kiểm tra mỗi 30 giây
      intervalId = setInterval(() => {
        checkDnsStatus();
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, verificationId]);

  const checkDnsStatus = async () => {
    if (!verificationId || isDnsChecking) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/dip-issuer/register/dns-status?verificationId=${verificationId}`
      );

      const data = await res.json();

      if (res.ok && data.status === "VERIFIED") {
        // DNS đã được xác thực (có thể bởi CRON job)
        setSuccessMessage(data.message || "DNS đã được xác thực thành công!");
        setStep("DNS_VERIFIED");
      }
      // Nếu vẫn PENDING, không làm gì cả, tiếp tục đợi
    } catch (err) {
      // Im lặng, không hiển thị lỗi cho auto-check
      console.log("Auto DNS check failed:", err);
    }
  };

  const handleVerifyDns = async () => {
    if (!verificationId) return;

    setError("");
    setIsDnsChecking(true);

    try {
      const res = await fetch(
        "http://localhost:8080/api/dip-issuer/register/verify-dns",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verificationId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Xác thực DNS thất bại");
        return;
      }

      if (data.status === "VERIFIED") {
        setSuccessMessage(data.message);
        setStep("DNS_VERIFIED");
      } else if (data.status === "PENDING") {
        setError(
          "DNS record chưa được tìm thấy. Vui lòng kiểm tra lại sau vài phút."
        );
      } else {
        setError(data.message || "Xác thực DNS thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi xác thực DNS:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsDnsChecking(false);
    }
  };

  // ========== STEP 4: COMPLETE REGISTRATION ==========
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!verificationId) {
      setError("Không tìm thấy thông tin xác thực");
      return;
    }

    setLoading(true);

    try {
      // ========== BƯỚC 1: LẤY THÔNG TIN TỪ BACKEND ==========
      const res = await fetch(
        "http://localhost:8080/api/dip-issuer/register/prepare-complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể lấy thông tin đăng ký");
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep("COMPLETE");
      setSuccessMessage("Đang xác thực trên blockchain...");

      // ========== BƯỚC 2: APPROVE ISSUER ON BLOCKCHAIN ==========
      setIsApprovingBlockchain(true);
      setBlockchainError("");

      const blockchainResult = await approveIssuerOnChain(
        data.addressWallet,
        data.code,
        data.timestamp,
        data.signature
      );

      if (!blockchainResult.success) {
        // Blockchain approval thất bại
        setBlockchainError(
          blockchainResult.error ||
            "Không thể xác thực trên blockchain. Vui lòng thử lại."
        );
        setIsApprovingBlockchain(false);
        setStep("DNS_VERIFIED"); // Quay lại bước trước
        setError(
          blockchainResult.error ||
            "Xác thực blockchain thất bại. Vui lòng kiểm tra và thử lại."
        );
        return;
      }

      // ========== BƯỚC 3: HOÀN TẤT ĐĂNG KÝ SAU KHI BLOCKCHAIN THÀNH CÔNG ==========
      setBlockchainApproved(true);
      setTxHash(blockchainResult.txHash || "");
      setSuccessMessage("✅ Xác thực blockchain thành công! Đang hoàn tất đăng ký...");

      const completeRes = await fetch(
        "http://localhost:8080/api/dip-issuer/register/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationId,
            password,
            txHash: blockchainResult.txHash,
          }),
        }
      );

      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        setError(completeData.message || "Hoàn tất đăng ký thất bại");
        setIsApprovingBlockchain(false);
        return;
      }

      setSuccessMessage(
        "✅ Đăng ký thành công và đã xác thực trên blockchain!"
      );

      // ✅ Clear saved email after successful registration
      localStorage.removeItem("registration_email");

      setIsApprovingBlockchain(false);

      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      console.error("Lỗi khi hoàn tất đăng ký:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setLoading(false);
      setIsApprovingBlockchain(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 -z-10" />
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 mt-12 w-full max-w-2xl text-white">
          {/* Progress Indicator */}
          <ProgressIndicator step={step} />

          <h2 className="text-2xl font-bold text-center mb-6">
            Đăng ký tài khoản Trường Đại học
          </h2>

          {/* Resume Registration Prompt */}
          {showResumePrompt && resumeData && (
            <ResumePrompt
              resumeData={resumeData}
              onResume={handleResumeRegistration}
              onStartNew={handleStartNewRegistration}
              isLoading={isResumingRegistration}
            />
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm flex items-center gap-2">
              <FaTimesCircle />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm flex items-center gap-2">
              <FaCheckCircle />
              {successMessage}
            </div>
          )}

          {/* STEP 1: INITIATE */}
          {step === "INITIATE" && (
            <StepInitiate
              code={code}
              setCode={setCode}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              email={email}
              setEmail={setEmail}
              addressWallet={addressWallet}
              setAddressWallet={setAddressWallet}
              loading={loading}
              onSubmit={handleInitiateRegistration}
            />
          )}

          {/* STEP 2: EMAIL SENT */}
          {step === "EMAIL_SENT" && (
            <StepEmailSent
              email={email}
              emailToken={emailToken}
              setEmailToken={setEmailToken}
              loading={loading}
              onSubmit={handleVerifyEmail}
            />
          )}

          {/* STEP 3: DNS SETUP */}
          {step === "DNS_SETUP" && (
            <StepDnsSetup
              dnsRecordName={dnsRecordName}
              dnsToken={dnsToken}
              dnsInstructions={dnsInstructions}
              isDnsChecking={isDnsChecking}
              onVerifyDns={handleVerifyDns}
            />
          )}

          {/* STEP 4: DNS VERIFIED - Complete Registration */}
          {step === "DNS_VERIFIED" && (
            <StepDnsVerified
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              loading={loading}
              onSubmit={handleCompleteRegistration}
            />
          )}

          {/* STEP 5: COMPLETE */}
          {step === "COMPLETE" && (
            <StepComplete
              isApprovingBlockchain={isApprovingBlockchain}
              blockchainApproved={blockchainApproved}
              blockchainError={blockchainError}
              txHash={txHash}
            />
          )}

          <p className="text-sm text-gray-400 mt-6 text-center">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
