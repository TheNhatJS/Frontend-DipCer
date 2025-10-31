# Hướng dẫn tích hợp Blockchain Approval cho Issuer Registration

## 📋 Tổng quan

Sau khi issuer đăng ký thành công trên backend, hệ thống sẽ tự động gọi smart contract để approve issuer trên blockchain Ethereum.

## 🔄 Luồng hoạt động

```
1. User điền form đăng ký (code, schoolName, email, wallet)
   ↓
2. Backend validate và gửi email xác thực
   ↓
3. User xác thực email → Backend tạo DNS token
   ↓
4. User cấu hình DNS → Backend verify DNS
   ↓
5. User nhập password → Backend:
   - Tạo User account
   - Tạo Issuer record
   - Tạo signature (ECDSA) với private key của backend
   - Trả về: { signature, timestamp, newIssuer, newUser }
   ↓
6. Frontend nhận response → Gọi smart contract:
   - Connect MetaMask
   - Gọi approveIssuerWithSignature(issuerAddress, code, timestamp, signature)
   - Đợi transaction confirm
   ↓
7. Transaction thành công → Redirect to login
```

## 🛠️ Cấu hình

### 1. Cài đặt dependencies

```bash
cd frontend
npm install ethers
```

### 2. Contract Address & ABI

Contract đã được deploy tại: `0x715AD6eFB04d099518F563023148f47441884493`

ABI và địa chỉ contract được lưu trong file:
```
src/data/abi.contract.json
```

**Lưu ý:** Nếu cần deploy contract mới, cập nhật file `abi.contract.json` với:
- `address`: Địa chỉ contract mới
- `abi`: ABI mới từ artifacts

### 3. Cấu hình môi trường (Optional)

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
```

### 4. Verify contract trên Etherscan

Truy cập: https://sepolia.etherscan.io/address/0x715AD6eFB04d099518F563023148f47441884493

## 📁 Cấu trúc files

```
frontend/
├── src/
│   ├── lib/
│   │   └── contract.ts              # Helper functions cho blockchain
│   ├── types/
│   │   └── ethereum.d.ts            # TypeScript types cho window.ethereum
│   ├── data/
│   │   └── abi.contract.json        # ✨ ABI & Contract Address
│   ├── components/
│   │   └── Step-COMPLETE/
│   │       └── index.tsx            # Component hiển thị blockchain status
│   └── app/
│       └── auth/
│           └── register/
│               └── page.tsx         # Main registration page
└── .env.local.example               # Example environment variables
```

## 🔑 Smart Contract Function

```solidity
function approveIssuerWithSignature(
    address _issuerAddress,    // Địa chỉ ví issuer
    string memory _institutionCode,  // Mã trường (VD: "HANU")
    uint256 _timestamp,        // Timestamp từ backend
    bytes calldata _signature  // ECDSA signature từ backend
) external
```

### Validation:
- ✅ Signature phải được ký bởi backend signer
- ✅ Timestamp không quá 1 giờ
- ✅ Chống replay attack
- ✅ Institution code chưa được đăng ký

## 🎯 Các state trong component

```typescript
const [isApprovingBlockchain, setIsApprovingBlockchain] = useState(false);
const [blockchainApproved, setBlockchainApproved] = useState(false);
const [blockchainError, setBlockchainError] = useState("");
const [txHash, setTxHash] = useState("");
```

## 🚀 Cách sử dụng

### 1. User đăng ký

User điền form → Verify email → Verify DNS → Nhập password

### 2. Backend response

```json
{
  "newUser": { "id": 1, "email": "...", "role": "ISSUER" },
  "newIssuer": {
    "code": "HANU",
    "addressWallet": "0x123...",
    "schoolName": "Đại học Hà Nội"
  },
  "signature": "0xabc...",
  "timestamp": 1234567890
}
```

### 3. Frontend tự động gọi contract

```typescript
// File: src/lib/contract.ts
import contractData from '@/data/abi.contract.json';

const DIPCERT_ABI = contractData.abi;
const CONTRACT_ADDRESS = contractData.address; // 0x715AD6eF...

const result = await approveIssuerOnChain(
  data.newIssuer.addressWallet,
  data.newIssuer.code,
  data.timestamp,
  data.signature
);

if (result.success) {
  console.log("TX Hash:", result.txHash);
} else {
  console.error("Error:", result.error);
}
```

## ⚠️ Xử lý lỗi

### Lỗi thường gặp:

1. **MetaMask chưa cài đặt**
   - Hiển thị link download MetaMask

2. **Sai địa chỉ ví**
   - User phải connect với đúng địa chỉ đã đăng ký

3. **User từ chối transaction**
   - Cho phép retry hoặc skip (approve sau)

4. **Signature expired**
   - Token backend chỉ valid trong 1 giờ
   - User cần đăng ký lại

5. **Institution code đã tồn tại**
   - Mã trường đã được đăng ký bởi issuer khác

## 📊 UI States

### Loading state
```
🔄 Đang xác thực issuer trên blockchain...
```

### Success state
```
✅ Đã xác thực thành công trên blockchain!
Xem transaction: 0x123...
```

### Error state
```
⚠️ Không thể xác thực trên blockchain. 
Bạn có thể xác thực sau trong trang quản lý.
```

## 🔐 Bảo mật

1. **ECDSA Signature**: Backend ký message với private key
2. **Timestamp validation**: Signature chỉ valid trong 1 giờ
3. **Replay attack prevention**: Mỗi approval chỉ sử dụng 1 lần
4. **On-chain validation**: Smart contract verify signature

## 📝 Testing

### 1. Kiểm tra contract trên Sepolia

```bash
# Truy cập Sepolia Etherscan
https://sepolia.etherscan.io/address/0x715AD6eFB04d099518F563023148f47441884493

# Hoặc sử dụng Hardhat console
cd contracts
npx hardhat console --network sepolia

> const contract = await ethers.getContractAt(
    "DipCertNFT", 
    "0x715AD6eFB04d099518F563023148f47441884493"
  )
> await contract.backendSignerAddress()
> await contract.owner()
```

### 2. Test flow đăng ký

1. Đăng ký issuer với email thật
2. Verify email
3. Verify DNS (hoặc skip nếu testing)
4. Nhập password
5. Connect MetaMask khi được yêu cầu
6. Confirm transaction
7. Đợi transaction confirm (~15-30s)
8. Kiểm tra trên Etherscan

### 3. Verify issuer đã được approve

```bash
npx hardhat console --network sepolia

> const contract = await ethers.getContractAt(
    "DipCertNFT",
    "0x715AD6eFB04d099518F563023148f47441884493"
  )
> await contract.isApprovedIssuer("0x... địa chỉ issuer")
> await contract.getInstitutionCode("0x... địa chỉ issuer")
```

## 🌐 Links

- Sepolia Etherscan: https://sepolia.etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/
- MetaMask: https://metamask.io/

## 💡 Tips

1. **Gas fees**: User cần có ETH trong ví để pay gas
2. **Network**: Đảm bảo MetaMask connect đúng network (Sepolia)
3. **Timeout**: Transaction có thể mất 15-30s để confirm
4. **Error handling**: Luôn có fallback nếu blockchain approval fail

## 🎉 Hoàn tất!

Sau khi setup xong, user có thể đăng ký issuer và tự động được approve trên blockchain! 🚀
