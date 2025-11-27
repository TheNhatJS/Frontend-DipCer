import {
  FaLock,
  FaClipboardCheck,
  FaUserShield,
  FaNetworkWired,
  FaDatabase,
} from "react-icons/fa";
import { SiIpfs } from "react-icons/si";

export default function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tính năng nổi bật với Blockchain & IPFS
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hệ thống cấp phát văn bằng điện tử kết hợp Blockchain và IPFS 
            mang lại sự minh bạch, bảo mật và tin cậy tuyệt đối
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
            <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
              <FaLock className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Chống giả mạo</h3>
            <p className="text-gray-400">
              Mỗi văn bằng được lưu trữ dưới dạng NFT trên blockchain Ethereum,
              không thể bị sửa đổi hoặc làm giả sau khi đã cấp phát.
            </p>
          </div>

          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
            <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
              <FaNetworkWired className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Phi tập trung</h3>
            <p className="text-gray-400">
              Dữ liệu được lưu trữ trên mạng lưới blockchain phi tập trung, đảm
              bảo tính sẵn sàng và bền vững của thông tin văn bằng.
            </p>
          </div>

          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover hover:border-purple-500/40">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg flex items-center justify-center mb-6">
              <SiIpfs className="text-2xl text-purple-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              IPFS Storage
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">Mới</span>
            </h3>
            <p className="text-gray-400">
              Metadata và hình ảnh văn bằng được lưu trên IPFS - hệ thống file phi tập trung, 
              đảm bảo dữ liệu không thể thay đổi với CID (Content Identifier) duy nhất.
            </p>
          </div>

          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
            <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
              <FaClipboardCheck className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Xác thực công khai</h3>
            <p className="text-gray-400">
              Nhà tuyển dụng có thể tự xác thực văn bằng trực tiếp trên
              blockchain mà không cần liên hệ trường cấp, tiết kiệm thời gian và
              chi phí.
            </p>
          </div>

          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
            <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
              <FaUserShield className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quyền sở hữu</h3>
            <p className="text-gray-400">
              Sinh viên là chủ sở hữu duy nhất của NFT văn bằng trong ví cá
              nhân.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
