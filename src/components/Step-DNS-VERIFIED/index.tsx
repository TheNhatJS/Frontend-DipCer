import { FaCheckCircle } from "react-icons/fa";
import { MdLock } from "react-icons/md";

interface StepDnsVerifiedProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StepDnsVerified({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit,
}: StepDnsVerifiedProps) {
  return (
    <div>
      {/* Icon Header */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
          <MdLock className="text-4xl text-white" />
        </div>
      </div>
      <p className="text-center text-gray-300 mb-6">Bước 4: Tạo mật khẩu</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
          <p className="text-green-300 flex items-center gap-2">
            <FaCheckCircle />
            DNS đã được xác thực thành công! Bước cuối cùng: tạo mật khẩu.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 text-sm">
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50"
        >
          {loading ? "Đang hoàn tất..." : "Hoàn tất đăng ký"}
        </button>
      </form>
    </div>
  );
}