import { FaCheckCircle, FaSpinner, FaEthereum } from "react-icons/fa";
import { getTransactionExplorerUrl } from "@/lib/contractInfo";

interface StepCompleteProps {
  isApprovingBlockchain?: boolean;
  blockchainApproved?: boolean;
  blockchainError?: string;
  txHash?: string;
}

export default function StepComplete({
  isApprovingBlockchain = false,
  blockchainApproved = false,
  blockchainError = "",
  txHash = "",
}: StepCompleteProps) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl animate-bounce">
          <FaCheckCircle className="text-6xl text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
        Đăng ký thành công!
      </h3>
      <p className="text-gray-300 mb-4">
        🎉 Chúc mừng! Tài khoản của bạn đã được tạo thành công.
      </p>

      {/* Blockchain Approval Status */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaEthereum className="text-purple-400" />
          <h4 className="font-semibold text-white">Đăng ký trên Blockchain</h4>
        </div>

        {isApprovingBlockchain && (
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
            <FaSpinner className="animate-spin" />
            <span>Đang xác thực issuer trên blockchain...</span>
          </div>
        )}

        {blockchainApproved && txHash && (
          <div className="text-sm">
            <p className="text-green-400 mb-2">
              ✅ Đã xác thực thành công trên blockchain!
            </p>
            <a
              href={getTransactionExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-xs break-all"
            >
              Xem transaction: {txHash.substring(0, 20)}...
            </a>
          </div>
        )}

        {blockchainError && (
          <div className="text-sm text-red-400">⚠️ {blockchainError}</div>
        )}
      </div>

      {!isApprovingBlockchain && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
          <FaSpinner className="animate-spin" />
          <span>Đang chuyển hướng đến trang đăng nhập...</span>
        </div>
      )}
    </div>
  );
}
