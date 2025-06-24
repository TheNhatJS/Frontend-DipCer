import { FaGraduationCap } from "react-icons/fa";

export default function SlideSelection({ onScrollToSearch }: { onScrollToSearch: () => void }) {
    return (
        <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Hệ thống quản lý</span><br />
                    văn bằng điện tử<br />
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">sử dụng Blockchain</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-lg">
                    Giải pháp công nghệ tiên tiến kết hợp blockchain và NFT để quản lý, xác thực và cấp phát văn bằng một cách minh bạch, bảo mật và không thể giả mạo.
                </p>

                <div>
                    <button
                        onClick={onScrollToSearch}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-medium transition transform hover:scale-105"
                    >
                        Tra cứu văn bằng
                    </button>

                </div>

            </div>
            <div className="md:w-1/2 relative">
                <div className="relative bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-md mx-auto hover:transform hover:-translate-y-1 hover:shadow-lg transition-all shadow-glow-hover">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-400">NFT Văn bằng</span>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">ERC-721</span>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl mb-4 flex items-center justify-center">
                        <FaGraduationCap className="text-6xl text-blue-400" />
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">Bằng tốt nghiệp Đại học</h3>
                        <p className="text-gray-400 text-sm">Ngành Công nghệ thông tin</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm">Chủ sở hữu</p>
                            <p className="text-blue-400 font-mono text-sm truncate">0x7f...3a4b</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Trường cấp</p>
                            <p className="text-blue-400">ĐH Kiến trúc Đà nẵng</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    )
}