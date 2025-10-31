import { FaServer, FaSpinner } from "react-icons/fa";
import { MdDns } from "react-icons/md";

interface StepDnsSetupProps {
  dnsRecordName: string;
  dnsToken: string;
  dnsInstructions: string;
  isDnsChecking: boolean;
  onVerifyDns: () => void;
}

export default function StepDnsSetup({
  dnsRecordName,
  dnsToken,
  dnsInstructions,
  isDnsChecking,
  onVerifyDns,
}: StepDnsSetupProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Icon Header */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
          <MdDns className="text-4xl text-white" />
        </div>
      </div>
      <p className="text-center text-gray-300 mb-4">Bước 3: Cấu hình DNS</p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FaServer className="text-blue-400" />
          🔧 Hướng dẫn cấu hình DNS
        </h3>
        <p className="text-sm text-gray-300 mb-3">
          Để xác minh quyền sở hữu tên miền, vui lòng thêm bản ghi TXT vào DNS
          của trường:
        </p>

        <div className="bg-black/30 p-3 rounded-lg mb-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Tên bản ghi:</p>
            <button
              onClick={() => navigator.clipboard.writeText(dnsRecordName)}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              📋 Copy
            </button>
          </div>
          <p className="font-mono text-sm text-yellow-300 break-all bg-black/20 p-2 rounded">
            {dnsRecordName}
          </p>

          <div className="flex items-center justify-between mb-2 mt-3">
            <p className="text-xs text-gray-400">Giá trị:</p>
            <button
              onClick={() => navigator.clipboard.writeText(dnsToken)}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              📋 Copy
            </button>
          </div>
          <p className="font-mono text-sm text-yellow-300 break-all bg-black/20 p-2 rounded">
            {dnsToken}
          </p>
        </div>

        <pre className="text-xs bg-black/30 p-3 rounded-lg overflow-auto whitespace-pre-wrap border border-gray-700">
          {dnsInstructions}
        </pre>
      </div>

      <button
        onClick={onVerifyDns}
        disabled={isDnsChecking}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isDnsChecking ? (
          <>
            <FaSpinner className="animate-spin" />
            Đang kiểm tra DNS...
          </>
        ) : (
          "Kiểm tra DNS"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        ⏱️ DNS có thể mất vài phút để cập nhật. Nếu chưa thấy, hãy thử lại sau.
      </p>
    </div>
  );
}