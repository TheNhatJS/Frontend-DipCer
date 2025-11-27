import { SiIpfs } from "react-icons/si";
import { FaCheckCircle, FaShieldAlt, FaGlobe, FaFingerprint } from "react-icons/fa";

export default function IPFSSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <SiIpfs className="text-3xl text-purple-400" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              InterPlanetary File System
            </h2>
          </div>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Hệ thống lưu trữ phi tập trung mạnh mẽ, đảm bảo dữ liệu văn bằng của bạn 
            <strong className="text-purple-300"> luôn bất biến và có thể truy cập mọi lúc, mọi nơi</strong>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left: What is IPFS */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaGlobe className="text-purple-400" />
              IPFS là gì?
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-purple-300">IPFS (InterPlanetary File System)</strong> là 
                một giao thức mạng phân tán peer-to-peer để lưu trữ và chia sẻ dữ liệu.
              </p>
              <p>
                Thay vì lưu trữ file trên một server trung tâm, IPFS phân tán dữ liệu 
                trên hàng ngàn node khắp thế giới, đảm bảo:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Bất biến:</strong> Dữ liệu không thể bị thay đổi sau khi upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Phân tán:</strong> Không phụ thuộc vào một server duy nhất</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Bền vững:</strong> File tồn tại mãi mãi trên mạng IPFS</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: How we use IPFS */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-blue-400" />
              Ứng dụng trong hệ thống
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Mọi văn bằng trong hệ thống được lưu trữ trên IPFS với 2 thành phần:
              </p>
              <div className="space-y-3">
                <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <strong className="text-purple-300">Hình ảnh văn bằng</strong>
                  </div>
                  <p className="text-sm text-gray-400">
                    File ảnh PDF/PNG được upload lên IPFS và nhận về một CID duy nhất
                  </p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-pink-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <strong className="text-pink-300">Metadata</strong>
                  </div>
                  <p className="text-sm text-gray-400">
                    Thông tin chi tiết (tên, GPA, khoa, lớp...) được lưu dưới dạng JSON trên IPFS
                  </p>
                </div>
              </div>
              <p className="text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                ✅ <strong>Kết quả:</strong> Dữ liệu không thể bị sửa đổi, đảm bảo tính toàn vẹn tuyệt đối!
              </p>
            </div>
          </div>
        </div>

        {/* CID Explanation */}
        <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <FaFingerprint className="text-3xl text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CID - Content Identifier
              </h3>
              <p className="text-gray-300 mb-4">
                Mỗi file trên IPFS được định danh bằng một <strong className="text-purple-300">CID (Content Identifier)</strong> - 
                một mã hash duy nhất được tính toán từ nội dung file.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="text-sm font-semibold text-purple-300 mb-2">🔐 Bất biến</div>
                  <p className="text-xs text-gray-400">
                    Nếu nội dung thay đổi dù chỉ 1 byte, CID sẽ hoàn toàn khác
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-pink-500/20">
                  <div className="text-sm font-semibold text-pink-300 mb-2">🔍 Xác thực</div>
                  <p className="text-xs text-gray-400">
                    Bất kỳ ai cũng có thể verify tính toàn vẹn của file qua CID
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                  <div className="text-sm font-semibold text-purple-300 mb-2">🌍 Toàn cầu</div>
                  <p className="text-xs text-gray-400">
                    Truy cập từ bất kỳ IPFS gateway nào trên thế giới
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-black/40 border border-purple-500/30 rounded-xl p-6 max-w-4xl">
            <p className="text-sm text-gray-400 mb-2">Ví dụ CID metadata văn bằng:</p>
            <code className="text-purple-300 font-mono text-sm break-all">
              QmX7KwjKHQF9YzKqDvNqJXvFdBgJmZ3kVwP8nR5tYuM9aW
            </code>
            <p className="text-xs text-gray-500 mt-3">
              → Truy cập: <span className="text-pink-300">ipfs://QmX7KwjKHQF9YzKqDvNqJXvFdBgJmZ3kVwP8nR5tYuM9aW</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
