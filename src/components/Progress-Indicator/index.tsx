import StepIndicator from "@/components/Step-Indicator";
import { FaEnvelope, FaServer, FaUserCheck } from "react-icons/fa";
import { HiClipboardList } from "react-icons/hi";

type RegistrationStep =
  | "INITIATE"
  | "EMAIL_SENT"
  | "EMAIL_VERIFIED"
  | "DNS_SETUP"
  | "DNS_VERIFIED"
  | "COMPLETE";

interface ProgressIndicatorProps {
  step: RegistrationStep;
}

export default function ProgressIndicator({ step }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <StepIndicator
          label="Khởi tạo"
          icon={<HiClipboardList />}
          active={step === "INITIATE"}
          completed={[
            "EMAIL_SENT",
            "EMAIL_VERIFIED",
            "DNS_SETUP",
            "DNS_VERIFIED",
            "COMPLETE",
          ].includes(step)}
        />
        <div className="flex-1 h-1 mx-2 bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${
              [
                "EMAIL_SENT",
                "EMAIL_VERIFIED",
                "DNS_SETUP",
                "DNS_VERIFIED",
                "COMPLETE",
              ].includes(step)
                ? "bg-green-500 w-full"
                : "bg-gray-700 w-0"
            }`}
          />
        </div>
        <StepIndicator
          label="Email"
          icon={<FaEnvelope />}
          active={step === "EMAIL_SENT" || step === "EMAIL_VERIFIED"}
          completed={["DNS_SETUP", "DNS_VERIFIED", "COMPLETE"].includes(step)}
        />
        <div className="flex-1 h-1 mx-2 bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${
              ["DNS_SETUP", "DNS_VERIFIED", "COMPLETE"].includes(step)
                ? "bg-green-500 w-full"
                : "bg-gray-700 w-0"
            }`}
          />
        </div>
        <StepIndicator
          label="DNS"
          icon={<FaServer />}
          active={step === "DNS_SETUP" || step === "DNS_VERIFIED"}
          completed={step === "COMPLETE"}
        />
        <div className="flex-1 h-1 mx-2 bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${
              step === "COMPLETE" ? "bg-green-500 w-full" : "bg-gray-700 w-0"
            }`}
          />
        </div>
        <StepIndicator
          label="Hoàn tất"
          icon={<FaUserCheck />}
          active={step === "COMPLETE"}
          completed={step === "COMPLETE"}
        />
      </div>
    </div>
  );
}
