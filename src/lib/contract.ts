import { ethers } from 'ethers';
import { CONTRACT_INFO } from './contractInfo';

// Lấy ABI và địa chỉ contract từ contractInfo
const DIPCERT_ABI = CONTRACT_INFO.abi;
const CONTRACT_ADDRESS = CONTRACT_INFO.address;

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
        error: 'MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask để tiếp tục.',
      };
    }

    // Kết nối provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    
    const signer = await provider.getSigner();
    
    // Kiểm tra địa chỉ wallet khớp với issuer address
    const currentAddress = await signer.getAddress();
    if (currentAddress.toLowerCase() !== issuerAddress.toLowerCase()) {
      return {
        success: false,
        error: `Vui lòng kết nối với địa chỉ ví: ${issuerAddress}`,
      };
    }

    // Tạo contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DIPCERT_ABI, signer);

    // Gọi hàm approveIssuerWithSignature
    console.log('🔄 Đang gửi transaction approve issuer...');
    const tx = await contract.approveIssuerWithSignature(
      issuerAddress,
      institutionCode,
      timestamp,
      signature
    );

    console.log('⏳ Đang chờ transaction được confirm...', tx.hash);
    
    // Chờ transaction được confirm
    const receipt = await tx.wait();

    console.log('✅ Transaction thành công!', receipt.hash);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('❌ Lỗi khi approve issuer on-chain:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi approve issuer trên blockchain.';
    
    if (error.code === 'ACTION_REJECTED') {
      errorMessage = 'Bạn đã từ chối giao dịch.';
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
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Kết nối MetaMask
 */
export async function connectMetaMask(): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    if (!isMetaMaskInstalled()) {
      return {
        success: false,
        error: 'MetaMask chưa được cài đặt',
      };
    }

    if (!window.ethereum) {
      return {
        success: false,
        error: 'Ethereum provider not found',
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
      error: error.message || 'Không thể kết nối MetaMask',
    };
  }
}
