import { FaCheckCircle } from "react-icons/fa";

interface StepIndicatorProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  completed: boolean;
}

export default function StepIndicator({
  label,
  icon,
  active,
  completed,
}: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          completed
            ? "bg-green-500 border-green-500 scale-110"
            : active
            ? "bg-blue-500 border-blue-500 scale-110 animate-pulse"
            : "bg-gray-700 border-gray-600"
        }`}
      >
        {completed ? (
          <FaCheckCircle className="text-white text-xl" />
        ) : (
          <div
            className={`text-xl ${
              active || completed ? "text-white" : "text-gray-400"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      <p
        className={`text-xs mt-2 font-medium transition-all duration-300 ${
          active || completed ? "text-white" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}