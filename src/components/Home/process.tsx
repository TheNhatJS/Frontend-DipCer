import { FaCheckCircle, FaGraduationCap, FaUniversity, FaUserCheck, FaFileSignature, FaCloudUploadAlt } from "react-icons/fa";

export default function Process() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Quy trình cấp phát văn bằng</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Từ đăng ký trường học đến cấp phát văn bằng NFT trên blockchain cho sinh viên</p>
                </div>

                <div className="relative">
                    {/* Vertical line in center */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-1 bg-blue-800/30 z-0 rounded-full" />

                    {/* Step 1: Đăng ký Issuer */}
                    <div className="flex flex-col md:flex-row mb-16 items-center">
                        <div className="md:w-1/2 md:pr-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Đăng ký Issuer</h3>
                            <p className="text-gray-400 text-center md:text-left">
                                Trường học đăng ký làm Issuer bằng cách xác thực email và DNS. 
                                Sau đó ký giao dịch trên blockchain với chữ ký Backend để được phê duyệt.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                                        <FaUniversity className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Trường đăng ký</p>
                                        <p className="font-medium">Issuer Registration</p>
                                    </div>
                                </div>
                                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>✓ Xác thực Email</span>
                                        <span className="text-green-400">Hoàn tất</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>✓ Xác thực DNS</span>
                                        <span className="text-green-400">Hoàn tất</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>✓ Approve Blockchain</span>
                                        <span className="text-green-400">Hoàn tất</span>
                                    </div>
                                </div>
                                <div className="text-center py-2 border-t border-gray-700 text-sm">
                                    <span className="text-blue-400">Trường đã được phê duyệt</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Tạo Draft */}
                    <div className="flex flex-col md:flex-row mb-16 items-center">
                        <div className="md:w-1/2 md:order-2 md:pl-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Tạo Draft văn bằng</h3>
                            <p className="text-gray-400 text-center md:text-left">
                                Issuer hoặc Delegate nhập thông tin sinh viên và văn bằng, 
                                sau đó <strong className="text-purple-300">upload ảnh văn bằng lên IPFS</strong> để lưu trữ phi tập trung và bất biến.
                            </p>
                        </div>
                        <div className="md:w-1/2 md:order-1">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                                            <FaFileSignature className="text-blue-400" />
                                        </div>
                                        <span className="font-medium">Draft Information</span>
                                    </div>
                                    <div className="text-xs bg-yellow-900 text-yellow-400 px-2 py-1 rounded-full">
                                        Draft
                                    </div>
                                </div>
                                <div className="mb-4 p-4 bg-gray-800 rounded-lg text-sm">
                                    <div className="mb-2">
                                        <span className="text-gray-400">Sinh viên: </span>
                                        <span className="text-white">Nguyễn Văn A</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-400">Khoa: </span>
                                        <span className="text-white">Công nghệ thông tin</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-400">Xếp loại: </span>
                                        <span className="text-white">Giỏi</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center py-3 bg-blue-900/30 rounded-lg">
                                    <FaCloudUploadAlt className="text-blue-400 mr-2" />
                                    <span className="text-sm text-blue-400">Upload ảnh lên IPFS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Mint NFT trên Blockchain */}
                    <div className="flex flex-col md:flex-row mb-16 items-center">
                        <div className="md:w-1/2 md:pr-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Mint NFT trên Blockchain</h3>
                            <p className="text-gray-400 text-center md:text-left">
                                Sau khi hoàn tất draft, hệ thống <strong className="text-purple-300">upload metadata lên IPFS</strong>, 
                                sau đó gọi smart contract để mint NFT văn bằng trên Ethereum với tokenURI trỏ đến IPFS. 
                                Thông tin được lưu vĩnh viễn và không thể thay đổi.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center mr-2">
                                            <FaGraduationCap className="text-xs text-white" />
                                        </div>
                                        <span className="font-mono text-sm">Ethereum Network</span>
                                    </div>
                                    <div className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full">
                                        Confirmed
                                    </div>
                                </div>
                                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Function</span>
                                        <span className="text-blue-400">issueDiploma()</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Gas Used</span>
                                        <span>0.0021 ETH</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Token ID</span>
                                        <span className="text-green-400">#12345</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Tx Hash</span>
                                        <span className="font-mono truncate text-blue-400">0x5a3...f2e1</span>
                                    </div>
                                </div>
                                <div className="text-center py-2 border-t border-gray-700 text-sm text-green-400">
                                    ✓ NFT đã được mint thành công
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Chuyển NFT cho sinh viên */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 md:order-2 md:pl-16 mb-8 md:mb-0">
                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                <span className="font-bold">4</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center md:text-left">Sinh viên nhận văn bằng</h3>
                            <p className="text-gray-400 text-center md:text-left">
                                NFT văn bằng được tự động chuyển đến địa chỉ ví của sinh viên. 
                                Sinh viên có quyền sở hữu hoàn toàn và có thể xác thực bất cứ lúc nào.
                            </p>
                        </div>
                        <div className="md:w-1/2 md:order-1">
                            <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-glow-hover">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center mr-3">
                                        <FaUserCheck className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Chủ sở hữu</p>
                                        <p className="font-medium">Nguyễn Văn A</p>
                                    </div>
                                </div>
                                <div className="aspect-video bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg mb-4 flex items-center justify-center">
                                    <FaCheckCircle className="text-4xl text-green-400" />
                                </div>
                                <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Địa chỉ ví</span>
                                        <span className="font-mono text-blue-400">0x7f...3a4b</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Token ID</span>
                                        <span className="text-green-400">#12345</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Trạng thái</span>
                                        <span className="text-green-400">Valid</span>
                                    </div>
                                </div>
                                <button className="w-full text-sm bg-blue-900 hover:bg-blue-800 text-blue-300 px-3 py-2 rounded-lg transition-colors">
                                    Xem trên Blockchain Explorer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}