import { FaCheckCircle, FaGraduationCap, FaShareAlt, FaUniversity } from "react-icons/fa";

export default function Process() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Quy trình hoạt động</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Cách hệ thống blockchain quản lý và cấp phát văn bằng điện tử</p>
                </div>

                <div className="relative">
                    {/* Vertical line in center */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-1 bg-blue-800/30 z-0 rounded-full" />

                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row mb-16 items-center">
                        <div className="md:w-1/2 md:pr-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Trường học cấp phát</h3>
                            <p className="text-gray-400 text-center md:text-left">Trường học xác nhận và tạo NFT văn bằng trên blockchain, gắn với địa chỉ ví của sinh viên.</p>
                        </div>
                        <div className="md:w-1/2">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                                        <FaUniversity className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Trường cấp</p>
                                        <p className="font-medium">Đại học Kiến trúc Đà nẵng</p>
                                    </div>
                                </div>
                                <div className="aspect-video bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg mb-4 flex items-center justify-center">
                                    <FaGraduationCap className="text-4xl text-blue-400" />
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Sinh viên</p>
                                        <p className="font-mono text-sm text-blue-400">0x7f...3a4b</p>
                                    </div>
                                    <button className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
                                        Đang chờ xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row mb-16 items-center">
                        <div className="md:w-1/2 md:order-2 md:pl-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Xác nhận trên blockchain</h3>
                            <p className="text-gray-400 text-center md:text-left">Giao dịch được xác nhận trên mạng lưới blockchain, tạo ra NFT văn bằng không thể thay đổi.</p>
                        </div>
                        <div className="md:w-1/2 md:order-1">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center mr-2">
                                            <FaGraduationCap className="text-xs text-white" />
                                        </div>
                                        <span className="font-mono text-sm">Ethereum</span>
                                    </div>
                                    <div className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full">
                                        Đã xác nhận
                                    </div>
                                </div>
                                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Block #</span>
                                        <span>15,842,107</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Gas fee</span>
                                        <span>0.0021 ETH</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Tx Hash</span>
                                        <span className="font-mono truncate">0x5a3...f2e1</span>
                                    </div>
                                </div>
                                <div className="text-center py-2 border-t border-gray-700 text-sm text-gray-400">
                                    NFT đã được mint thành công
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 md:pr-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Sinh viên sở hữu</h3>
                            <p className="text-gray-400 text-center md:text-left">
                                NFT văn bằng được chuyển đến ví của sinh viên,
                                có thể trưng bày hoặc chia sẻ khi cần.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                                        <FaShareAlt className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Chia sẻ đến</p>
                                        <p className="font-medium">Nhà tuyển dụng</p>
                                    </div>
                                </div>
                                <div className="aspect-video bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg mb-4 flex items-center justify-center">
                                    <FaCheckCircle className="text-4xl text-blue-400" />
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">Địa chỉ ví</p>
                                        <p className="font-mono text-sm text-blue-400">0x7f...3a4b</p>
                                    </div>
                                    <button className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
                                        Chia sẻ ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}