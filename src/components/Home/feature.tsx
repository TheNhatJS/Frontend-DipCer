import { FaLock, FaSearch, FaShareAlt } from "react-icons/fa";

export default function Features() {
  return (
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Công nghệ blockchain mang lại những ưu điểm vượt trội cho hệ thống quản lý văn bằng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <FaLock className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bảo mật tuyệt đối</h3>
              <p className="text-gray-400">Công nghệ blockchain đảm bảo văn bằng không thể bị giả mạo hoặc thay đổi sau khi được cấp phát.</p>
            </div>

            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <FaSearch className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Xác thực dễ dàng</h3>
              <p className="text-gray-400">Bất kỳ ai cũng có thể kiểm tra tính xác thực của văn bằng chỉ với vài cú nhấp chuột.</p>
            </div>

            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all shadow-glow-hover">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <FaShareAlt className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chia sẻ tiện lợi</h3>
              <p className="text-gray-400">Chia sẻ văn bằng dưới dạng NFT đến nhà tuyển dụng mà không lo bị đánh cắp thông tin.</p>
            </div>
          </div>
        </div>
      </section>
  )
}