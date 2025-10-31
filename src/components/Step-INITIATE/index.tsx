import { FaUniversity } from "react-icons/fa";

interface StepInitiateProps {
  code: string;
  setCode: (value: string) => void;
  schoolName: string;
  setSchoolName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  addressWallet: string;
  setAddressWallet: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StepInitiate({
  code,
  setCode,
  schoolName,
  setSchoolName,
  email,
  setEmail,
  addressWallet,
  setAddressWallet,
  loading,
  onSubmit,
}: StepInitiateProps) {
  return (
    <div>
      {/* Icon Header */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <FaUniversity className="text-4xl text-white" />
        </div>
      </div>
      <p className="text-center text-gray-300 mb-6">
        Bước 1: Điền thông tin trường đại học của bạn
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="code" className="block mb-1 text-sm">
            Mã trường (VD: HANU, PTIT, ...)
          </label>
          <input
            id="code"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            placeholder="HANU"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div>
          <label htmlFor="schoolName" className="block mb-1 text-sm">
            Tên trường
          </label>
          <input
            id="schoolName"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Đại học Hà Nội"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 text-sm">
            Email chính thức của trường
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="daotao@hanu.edu.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="addressWallet" className="block mb-1 text-sm">
            Địa chỉ ví Ethereum
          </label>
          <input
            id="addressWallet"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#292C33]/70 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0x..."
            value={addressWallet}
            onChange={(e) => setAddressWallet(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl transition duration-200 shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý..." : "Tiếp tục"}
        </button>
      </form>
    </div>
  );
}