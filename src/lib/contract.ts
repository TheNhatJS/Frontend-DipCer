/**
 * CONTRACT UTILITIES
 *
 * File này chứa tất cả các hàm tương tác với smart contract DipCert
 *
 * @module contract
 *
 * Features:
 * - Approve issuer với signature từ backend
 * - Kết nối MetaMask
 * - Xác thực văn bằng với blockchain
 * - Thu hồi văn bằng
 * - Lấy thông tin văn bằng
 * - Utility functions (format address, timestamp)
 *
 * @author DipCert Team
 */

import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { CONTRACT_INFO } from "./contractInfo";

// Lấy ABI và địa chỉ contract từ contractInfo
const DIPCERT_ABI = CONTRACT_INFO.abi;
const CONTRACT_ADDRESS = CONTRACT_INFO.address;

// ==================== TYPES ====================

interface VerifyDiplomaParams {
  tokenId: number;
  serialNumber: string;
  studentAddress: string;
}

interface VerifyResult {
  success: boolean;
  message: string;
  onChainData?: any;
}

// ==================== PRIVATE HELPERS ====================

/**
 * Kết nối MetaMask và tạo contract instance
 * @returns Contract instance đã kết nối với signer
 * @throws Error nếu không tìm thấy MetaMask
 */
export async function getContractInstance(): Promise<{
  contract: ethers.Contract;
  signer: ethers.JsonRpcSigner;
  provider: ethers.BrowserProvider;
}> {
  // Kiểm tra MetaMask
  if (!window.ethereum) {
    throw new Error(
      "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask để tiếp tục."
    );
  }

  const provider: any = await detectEthereumProvider();
  if (!provider) {
    throw new Error("Không tìm thấy MetaMask");
  }

  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, DIPCERT_ABI, signer);

  return { contract, signer, provider: ethersProvider };
}

// ==================== ISSUER MANAGEMENT ====================

/**
 * Approve issuer on blockchain bằng signature từ backend
 */
export async function approveIssuerOnChain(
  issuerAddress: string,
  institutionCode: string,
  timestamp: number,
  signature: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Kiểm tra MetaMask
    if (!window.ethereum) {
      return {
        success: false,
        error:
          "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask để tiếp tục.",
      };
    }

    // Sử dụng helper để lấy contract instance
    const { contract, signer } = await getContractInstance();

    // Kiểm tra địa chỉ wallet khớp với issuer address
    const currentAddress = await signer.getAddress();
    if (currentAddress.toLowerCase() !== issuerAddress.toLowerCase()) {
      return {
        success: false,
        error: `Vui lòng kết nối với địa chỉ ví: ${issuerAddress}`,
      };
    }

    // Gọi hàm approveIssuerWithSignature
    console.log("🔄 Đang gửi transaction approve issuer...");
    const tx = await contract.approveIssuerWithSignature(
      issuerAddress,
      institutionCode,
      timestamp,
      signature
    );

    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);

    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log("✅ Transaction thành công!", receipt.hash);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi approve issuer on-chain:", error);

    let errorMessage = "Có lỗi xảy ra khi approve issuer trên blockchain.";

    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Bạn đã từ chối giao dịch.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Kiểm tra xem MetaMask đã cài đặt chưa
 */
export function isMetaMaskInstalled(): boolean {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
}

/**
 * Chuyển quyền issuer sang địa chỉ ví mới
 * @param newIssuerAddress - Địa chỉ ví mới sẽ trở thành issuer
 * @returns Kết quả chuyển đổi
 */
export async function transferIssuerRole(
  newIssuerAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Kiểm tra địa chỉ ví hợp lệ
    if (!newIssuerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        success: false,
        error: "Địa chỉ ví không hợp lệ!",
      };
    }

    // Sử dụng helper để lấy contract instance
    const { contract, signer } = await getContractInstance();
    const currentAddress = await signer.getAddress();

    // Kiểm tra xem địa chỉ hiện tại có phải issuer không
    const isIssuer = await contract.isApprovedIssuer(currentAddress);
    if (!isIssuer) {
      return {
        success: false,
        error: "Địa chỉ hiện tại không phải là issuer!",
      };
    }

    // Kiểm tra địa chỉ mới chưa được approve
    const newIsIssuer = await contract.isApprovedIssuer(newIssuerAddress);
    if (newIsIssuer) {
      return {
        success: false,
        error: "Địa chỉ mới đã là issuer của một trường khác!",
      };
    }

    console.log("🔄 Đang chuyển quyền issuer...");
    
    // Gọi hàm transferIssuerRole trên smart contract
    const tx = await contract.transferIssuerRole(newIssuerAddress);
    
    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);

    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log("✅ Chuyển quyền thành công!", receipt.hash);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi chuyển quyền issuer:", error);

    let errorMessage = "Có lỗi xảy ra khi chuyển quyền issuer.";

    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Bạn đã từ chối giao dịch.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Kết nối MetaMask
 */
export async function connectMetaMask(): Promise<{
  success: boolean;
  address?: string;
  error?: string;
}> {
  try {
    if (!isMetaMaskInstalled()) {
      return {
        success: false,
        error: "MetaMask chưa được cài đặt",
      };
    }

    if (!window.ethereum) {
      return {
        success: false,
        error: "Ethereum provider not found",
      };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return {
      success: true,
      address,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Không thể kết nối MetaMask",
    };
  }
}

// ==================== DIPLOMA VERIFICATION ====================

/**
 * Xác thực văn bằng với blockchain bằng hàm verifyDiploma của smart contract
 * @param params - Thông tin văn bằng từ database
 * @returns Kết quả xác thực (true nếu hợp lệ, false nếu bị thay đổi)
 */
export async function verifyDiplomaWithBlockchain(
  params: {
    tokenId: number;
    institutionCode: string;
    serialNumber: string;
    studentAddress: string;
    issuerAddress: string;
    issueDate: number; // Unix timestamp in seconds
    tokenURI: string;
  }
): Promise<{
  success: boolean;
  message: string;
  isValid?: boolean;
}> {
  try {
    const { tokenId, institutionCode, serialNumber, studentAddress, issuerAddress, issueDate, tokenURI } = params;

    // Validate parameters
    if (!tokenId || isNaN(tokenId)) {
      throw new Error("Invalid tokenId");
    }
    if (!institutionCode || !serialNumber || !studentAddress || !issuerAddress || !tokenURI) {
      throw new Error("Missing required parameters");
    }
    if (isNaN(issueDate) || issueDate < 0) {
      throw new Error(`Invalid issueDate: ${issueDate}`);
    }

    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    console.log("🔍 Đang xác thực văn bằng với blockchain...");
    console.log("Parameters:", {
      tokenId,
      institutionCode,
      serialNumber,
      studentAddress,
      issuerAddress,
      issueDate,
      issueDateType: typeof issueDate,
      tokenURI
    });

    // Gọi hàm verifyDiploma từ smart contract
    const isValid = await contract.verifyDiploma(
      tokenId,
      institutionCode,
      serialNumber,
      studentAddress,
      issuerAddress,
      issueDate,
      tokenURI
    );

    console.log("✅ Kết quả xác thực:", isValid);

    if (!isValid) {
      return {
        success: false,
        isValid: false,
        message: "⚠️ Văn bằng đã bị thay đổi hoặc không khớp với dữ liệu trên blockchain!",
      };
    }

    return {
      success: true,
      isValid: true,
      message: "✅ Văn bằng hợp lệ và khớp với dữ liệu blockchain.",
    };
  } catch (error: any) {
    console.error("Error verifying diploma:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Lỗi không xác định khi xác thực văn bằng.",
    };
  }
}

/**
 * Thu hồi văn bằng trên blockchain
 * @param tokenId - Token ID của văn bằng cần thu hồi
 * @returns Transaction receipt
 */
export async function revokeDiplomaOnBlockchain(tokenId: number) {
  try {
    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    // Gọi hàm thu hồi
    console.log("🔄 Đang thu hồi văn bằng token ID:", tokenId);
    const tx = await contract.revokeAndBurnDiploma(tokenId);

    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);
    const receipt = await tx.wait();

    console.log("✅ Thu hồi thành công!", receipt.hash);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi thu hồi văn bằng:", error);
    throw new Error(error.message || "Không thể thu hồi văn bằng");
  }
}

/**
 * Lấy thông tin chi tiết văn bằng từ blockchain
 * @param tokenId - Token ID của văn bằng
 * @returns Thông tin văn bằng
 */
export async function getDiplomaFromBlockchain(tokenId: number) {
  try {
    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    const diploma = await contract.getDiploma(tokenId);
    return diploma;
  } catch (error: any) {
    console.error("Error getting diploma:", error);
    throw new Error(error.message || "Không thể lấy thông tin văn bằng");
  }
}

/**
 * Lấy địa chỉ ví hiện tại từ MetaMask
 * @returns Địa chỉ ví
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  try {
    // Sử dụng helper để lấy signer
    const { signer } = await getContractInstance();
    return await signer.getAddress();
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format địa chỉ Ethereum
 * @param address - Địa chỉ Ethereum đầy đủ
 * @param startLength - Số ký tự đầu
 * @param endLength - Số ký tự cuối
 * @returns Địa chỉ đã format (vd: 0x1234...5678)
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format timestamp thành ngày tháng
 * @param timestamp - Unix timestamp
 * @param locale - Locale (mặc định: vi-VN)
 * @returns Chuỗi ngày tháng
 */
export function formatTimestamp(
  timestamp: number,
  locale: string = "vi-VN"
): string {
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) {
    return "Không rõ";
  }
  return date.toLocaleDateString(locale);
}

/**
 * Kiểm tra địa chỉ ví hiện tại có được approve cho institution code không
 * @param institutionCode - Mã trường (VD: HUST, TEST)
 * @returns Object chứa kết quả kiểm tra
 */
export async function checkIssuerAuthorization(
  institutionCode: string
): Promise<{
  isAuthorized: boolean;
  approvedAddress: string | null;
  currentAddress: string;
  message: string;
}> {
  try {
    const { contract, signer } = await getContractInstance();
    const currentAddress = await signer.getAddress();

    // Lấy địa chỉ đã được approve cho institution code
    let approvedAddress: string;
    try {
      approvedAddress = await contract.getIssuerByInstitutionCode(
        institutionCode.toUpperCase()
      );
    } catch (err: any) {
      // Nếu chưa có issuer nào được approve
      if (err.message?.includes("No issuer found")) {
        return {
          isAuthorized: false,
          approvedAddress: null,
          currentAddress,
          message: `Chưa có issuer nào được approve cho mã trường ${institutionCode}`,
        };
      }
      throw err;
    }

    // So sánh địa chỉ (case-insensitive)
    const isAuthorized =
      approvedAddress.toLowerCase() === currentAddress.toLowerCase();

    return {
      isAuthorized,
      approvedAddress,
      currentAddress,
      message: isAuthorized
        ? `✅ Địa chỉ hiện tại được phép cấp phát cho ${institutionCode}`
        : `❌ Địa chỉ hiện tại không được phép cấp phát cho ${institutionCode}. Vui lòng chuyển sang địa chỉ: ${approvedAddress}`,
    };
  } catch (error: any) {
    console.error("Error checking issuer authorization:", error);
    throw new Error(`Lỗi kiểm tra quyền: ${error.message}`);
  }
}

/**
 * Batch mint nhiều văn bằng cùng lúc
 * @param batchData - Danh sách thông tin văn bằng cần mint
 * @param institutionCode - Mã trường (ví dụ: "HUST")
 * @returns Object chứa kết quả batch mint và danh sách tokenIds
 */
export async function batchMintDiplomas(
  batchData: Array<{
    studentAddress: string;
    serialNumber: string;
    tokenURI: string;
    issueDate: number;
  }>,
  institutionCode: string
): Promise<{
  success: boolean;
  tokenIds?: number[];
  txHash?: string;
  error?: string;
}> {
  try {
    if (batchData.length === 0) {
      return {
        success: false,
        error: "Không có văn bằng nào để mint",
      };
    }

    // Get contract instance
    const { contract, signer } = await getContractInstance();

    // Get current address
    const currentAddress = await signer.getAddress();
    
    // Prepare batch data
    const studentAddresses = batchData.map(d => d.studentAddress);
    const serialNumbers = batchData.map(d => d.serialNumber);
    const tokenURIs = batchData.map(d => d.tokenURI);
    const issueDates = batchData.map(d => d.issueDate);

    console.log("📦 Batch minting", batchData.length, "diplomas...");
    console.log("🏢 Institution Code:", institutionCode);

    // Call batch mint function on contract
    // Note: Function name is batchIssueDiploma (singular)
    const tx = await contract.batchIssueDiploma(
      studentAddresses,
      institutionCode,
      serialNumbers,
      tokenURIs,
      issueDates
    );

    console.log("📝 Batch transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Batch transaction confirmed:", receipt.hash);

    // Extract tokenIds from events
    const tokenIds: number[] = [];
    
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "DiplomaIssued") {
          tokenIds.push(Number(parsed.args.tokenId));
        }
      } catch {
        // Skip logs that can't be parsed
        continue;
      }
    }

    if (tokenIds.length !== batchData.length) {
      console.warn(
        `⚠️ Expected ${batchData.length} tokenIds but got ${tokenIds.length}`
      );
    }

    console.log("🎓 Batch minted successfully! TokenIDs:", tokenIds);

    return {
      success: true,
      tokenIds,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Error batch minting diplomas:", error);
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi batch mint",
    };
  }
}

/**
 * Cấp phát văn bằng trên blockchain
 * @param params - Thông tin cấp phát văn bằng
 * @returns Object chứa kết quả mint và tokenId
 */
export async function issueDiplomaOnBlockchain(params: {
  studentAddress: string;
  institutionCode: string;
  serialNumber: string;
  tokenURI: string;
  issueDate: number;
}): Promise<{
  success: boolean;
  tokenId?: number;
  txHash?: string;
  error?: string;
  authorizationError?: {
    approvedAddress: string | null;
    currentAddress: string;
  };
}> {
  try {
    const { studentAddress, institutionCode, serialNumber, tokenURI, issueDate } = params;

    // 1. Kiểm tra quyền cấp phát
    const authCheck = await checkIssuerAuthorization(institutionCode);
    if (!authCheck.isAuthorized) {
      return {
        success: false,
        error: authCheck.message,
        authorizationError: {
          approvedAddress: authCheck.approvedAddress,
          currentAddress: authCheck.currentAddress,
        },
      };
    }

    // 2. Mint NFT
    const { contract } = await getContractInstance();
    
    const tx = await contract.issueDiploma(
      studentAddress,
      institutionCode.toUpperCase(),
      serialNumber,
      tokenURI,
      issueDate
    );

    console.log("📝 Transaction sent:", tx.hash);

    // 3. Chờ transaction confirm
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    // 4. Lấy tokenId từ event DiplomaIssued
    const diplomaIssuedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "DiplomaIssued";
      } catch {
        return false;
      }
    });

    if (!diplomaIssuedEvent) {
      throw new Error("Không tìm thấy DiplomaIssued event trong transaction");
    }

    const parsedEvent = contract.interface.parseLog(diplomaIssuedEvent);
    const tokenId = Number(parsedEvent?.args?.tokenId);

    console.log("🎓 Diploma issued successfully! TokenID:", tokenId);

    return {
      success: true,
      tokenId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Error issuing diploma on blockchain:", error);
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi mint NFT",
    };
  }
}

// ==================== DELEGATE MANAGEMENT ====================

/**
 * Approve delegate on blockchain - cấp quyền cho một delegate
 * @param institutionCode - Mã trường (VD: HUST, TEST)
 * @param delegateAddress - Địa chỉ ví của delegate
 * @returns Object chứa kết quả approve
 */
export async function approveDelegateOnChain(
  institutionCode: string,
  delegateAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log("🔄 Approving delegate on blockchain...");
    console.log("Institution Code:", institutionCode);
    console.log("Delegate Address:", delegateAddress);

    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    // Gọi hàm approveDelegate
    console.log("🔄 Đang gửi transaction approve delegate...");
    const tx = await contract.approveDelegate(
      institutionCode,
      delegateAddress
    );

    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);

    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log("✅ Delegate approved successfully!", receipt.hash);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi approve delegate on-chain:", error);

    let errorMessage = "Có lỗi xảy ra khi approve delegate trên blockchain.";

    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Bạn đã từ chối giao dịch.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Batch approve delegates on blockchain - cấp quyền cho nhiều delegate cùng lúc
 * @param institutionCode - Mã trường (VD: HUST, TEST)
 * @param delegateAddresses - Mảng địa chỉ ví của các delegate
 * @returns Object chứa kết quả approve
 */
export async function batchApproveDelegatesOnChain(
  institutionCode: string,
  delegateAddresses: string[]
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log("🔄 Batch approving delegates on blockchain...");
    console.log("Institution Code:", institutionCode);
    console.log("Delegate Addresses:", delegateAddresses);

    if (!delegateAddresses || delegateAddresses.length === 0) {
      return {
        success: false,
        error: "Danh sách delegate rỗng",
      };
    }

    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    // Gọi hàm batchApproveDelegate
    console.log("🔄 Đang gửi transaction batch approve delegates...");
    const tx = await contract.batchApproveDelegate(
      institutionCode,
      delegateAddresses
    );

    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);

    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log(
      `✅ ${delegateAddresses.length} delegates approved successfully!`,
      receipt.hash
    );

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi batch approve delegates on-chain:", error);

    let errorMessage =
      "Có lỗi xảy ra khi batch approve delegates trên blockchain.";

    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Bạn đã từ chối giao dịch.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Revoke delegate on blockchain - thu hồi quyền cấp phát của delegate
 * @param institutionCode - Mã trường (VD: HUST, TEST)
 * @param delegateAddress - Địa chỉ ví của delegate cần thu hồi quyền
 * @returns Object chứa kết quả revoke
 */
export async function revokeDelegateOnChain(
  institutionCode: string,
  delegateAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log("🔄 Revoking delegate on blockchain...");
    console.log("Institution Code:", institutionCode);
    console.log("Delegate Address:", delegateAddress);

    // Sử dụng helper để lấy contract instance
    const { contract } = await getContractInstance();

    // Gọi hàm revokeDelegate
    console.log("🔄 Đang gửi transaction revoke delegate...");
    const tx = await contract.revokeDelegate(
      institutionCode,
      delegateAddress
    );

    console.log("⏳ Đang chờ transaction được confirm...", tx.hash);

    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log("✅ Delegate revoked successfully!", receipt.hash);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi revoke delegate on-chain:", error);

    let errorMessage = "Có lỗi xảy ra khi thu hồi quyền delegate trên blockchain.";

    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Bạn đã từ chối giao dịch.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
