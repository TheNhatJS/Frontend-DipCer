"use client";

import detectEthereumProvider from "@metamask/detect-provider";
import { BrowserProvider, Eip1193Provider } from "ethers";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";

interface WalletContextType {
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

interface MetaMaskError {
  code: number;
  message: string;
  data?: unknown;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Thời gian timeout: 15 phút (có thể điều chỉnh)
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 phút tính bằng milliseconds

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /**
   * Cập nhật thời gian hoạt động cuối cùng
   */
  const updateLastActiveTime = () => {
    localStorage.setItem("lastActiveTime", Date.now().toString());
  };

  /**
   * Kiểm tra xem session có còn hợp lệ không
   */
  const isSessionValid = (): boolean => {
    const lastActiveTime = localStorage.getItem("lastActiveTime");
    if (!lastActiveTime) return false;

    const timeDiff = Date.now() - parseInt(lastActiveTime);
    return timeDiff < SESSION_TIMEOUT;
  };

  /**
   * Hàm ngắt kết nối ví
   * Xóa toàn bộ dữ liệu liên quan đến ví
   */
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("lastActiveTime");
    toast.info("Đã ngắt kết nối ví");
  };

  /**
   * Hàm kết nối ví MetaMask
   * Chỉ được gọi khi người dùng chủ động bấm nút "Kết nối ví"
   */
  const connectWallet = async () => {
    try {
      const provider = (await detectEthereumProvider()) as Eip1193Provider | null;

      if (!provider) {
        toast.warning("Vui lòng cài đặt MetaMask!");
        return;
      }

      // Yêu cầu người dùng kết nối ví
      const accounts = await provider.request?.({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        toast.error("Không tìm thấy tài khoản MetaMask");
        return;
      }

      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const walletAddress = await signer.getAddress();

      // Cập nhật state và localStorage
      setAddress(walletAddress);
      setIsConnected(true);
      localStorage.setItem("walletAddress", walletAddress);
      localStorage.setItem("walletConnected", "true");
      updateLastActiveTime();

      toast.success("Kết nối ví thành công!");
    } catch (error) {
      const err = error as MetaMaskError;

      if (err.code === 4001) {
        toast.error("Bạn đã từ chối yêu cầu kết nối");
      } else {
        toast.error("Có lỗi xảy ra khi kết nối ví");
        console.error("Lỗi kết nối MetaMask:", err);
      }
    }
  };

  /**
   * useEffect chính - Xử lý event listeners
   */
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      // Chỉ xử lý khi đã kết nối
      if (!isConnected) return;

      if (accounts.length === 0) {
        // User đã ngắt kết nối từ MetaMask
        disconnectWallet();
      } else {
        // User đổi account trong MetaMask
        const newAddress = accounts[0];
        setAddress(newAddress);
        localStorage.setItem("walletAddress", newAddress);
        updateLastActiveTime();
        toast.info("Đã chuyển sang tài khoản: " + newAddress.slice(0, 6) + "..." + newAddress.slice(-4));
      }
    };

    const handleChainChanged = () => {
      // Reload trang khi đổi mạng
      window.location.reload();
    };

    // Đăng ký event listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Lắng nghe hoạt động của user để cập nhật lastActiveTime
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (isConnected) {
        updateLastActiveTime();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isConnected]);

  /**
   * useEffect phụ - Khôi phục kết nối khi reload trang
   * CHỈ khôi phục nếu:
   * 1. User đã từng kết nối (có flag trong localStorage)
   * 2. Session còn hợp lệ (chưa timeout)
   * 3. MetaMask có sẵn và đã unlock
   */
  useEffect(() => {
    const restoreConnection = async () => {
      try {
        // Kiểm tra xem user có từng kết nối không
        const wasConnected = localStorage.getItem("walletConnected");
        if (!wasConnected) {
          return; // Lần đầu vào trang, không tự động kết nối
        }

        // Kiểm tra session có còn hợp lệ không
        if (!isSessionValid()) {
          // Session đã hết hạn, xóa dữ liệu cũ
          localStorage.removeItem("walletConnected");
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("lastActiveTime");
          console.log("Session hết hạn, vui lòng kết nối lại");
          return;
        }

        const provider = (await detectEthereumProvider()) as Eip1193Provider | null;
        if (!provider) {
          // Không có MetaMask
          return;
        }

        // Kiểm tra xem MetaMask có accounts đã kết nối không
        const accounts = await provider.request?.({ method: "eth_accounts" });

        if (!accounts || accounts.length === 0) {
          // MetaMask chưa unlock hoặc chưa kết nối
          // Không xóa localStorage, chờ user unlock
          return;
        }

        // Khôi phục kết nối
        const currentAddress = accounts[0];
        setAddress(currentAddress);
        setIsConnected(true);
        localStorage.setItem("walletAddress", currentAddress);
        updateLastActiveTime();
        
        console.log("Đã khôi phục kết nối ví:", currentAddress);
      } catch (error) {
        console.error("Lỗi khôi phục kết nối:", error);
        // Không xóa localStorage, có thể do MetaMask đang bị lock
      }
    };

    restoreConnection();
  }, []);

  /**
   * useEffect kiểm tra timeout định kỳ
   * Mỗi 1 phút kiểm tra xem session có còn hợp lệ không
   */
  useEffect(() => {
    const checkSessionTimeout = setInterval(() => {
      if (isConnected && !isSessionValid()) {
        disconnectWallet();
        toast.warning("Phiên kết nối đã hết hạn. Vui lòng kết nối lại.");
      }
    }, 60 * 1000); // Kiểm tra mỗi 1 phút

    return () => clearInterval(checkSessionTimeout);
  }, [isConnected]);

  return (
    <WalletContext.Provider
      value={{
        address,
        connectWallet,
        disconnectWallet,
        isConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet phải được sử dụng trong WalletProvider");
  }
  return context;
};
