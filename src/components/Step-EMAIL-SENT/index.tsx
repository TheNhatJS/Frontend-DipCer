import { MdEmail } from "react-icons/md";

interface StepEmailSentProps {
  email: string;
  emailToken: string;
  setEmailToken: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StepEmailSent({
  email,
  emailToken,
  setEmailToken,
  loading,
  onSubmit,
}: StepEmailSentProps) {
  return (
    <div>
      {/* Icon Header */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <MdEmail className="text-4xl text-white" />
        </div>
      </div>
      <p className="text-center text-gray-300 mb-6">Bước 2: Xác thực Email</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-300 mb-4">
          📧 Chúng tôi đã gửi email xác thực đến <strong>{email}</strong>. Vui
          lòng kiểm tra hộp thư và nhập mã xác thực bên dưới.
        </p>

        <div>
          <label htmlFor="emailToken" className="block mb-1 text-sm">
            Mã xác thực từ email
          </label>
          <input
            id="emailToken"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập token từ email"
            value={emailToken}
            onChange={(e) => setEmailToken(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50"
        >
          {loading ? "Đang xác thực..." : "Xác thực Email"}
        </button>
      </form>
    </div>
  );
}