import contractData from '@/data/abi.contract.json';

/**
 * Thông tin contract DipCert NFT
 */
export const CONTRACT_INFO = {
  address: contractData.address,
  abi: contractData.abi,
  network: {
    chainId: 11155111, // Sepolia
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
} as const;

/**
 * Link đến contract trên Etherscan
 */
export const getContractExplorerUrl = () => {
  return `${CONTRACT_INFO.network.blockExplorer}/address/${CONTRACT_INFO.address}`;
};

/**
 * Link đến transaction trên Etherscan
 */
export const getTransactionExplorerUrl = (txHash: string) => {
  return `${CONTRACT_INFO.network.blockExplorer}/tx/${txHash}`;
};

/**
 * Link đến address trên Etherscan
 */
export const getAddressExplorerUrl = (address: string) => {
  return `${CONTRACT_INFO.network.blockExplorer}/address/${address}`;
};

/**
 * Network configuration cho MetaMask
 */
export const SEPOLIA_NETWORK_CONFIG = {
  chainId: `0x${CONTRACT_INFO.network.chainId.toString(16)}`, // 0xaa36a7
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: [CONTRACT_INFO.network.blockExplorer],
};
