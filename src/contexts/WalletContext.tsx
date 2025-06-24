'use client'

import detectEthereumProvider from '@metamask/detect-provider'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react'
import { toast } from 'sonner'

interface WalletContextType {
    address: string | null
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
}

interface MetaMaskError {
    code: number
    message: string
    data?: unknown
}


const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)

    // ✅ Kiểm tra nếu ví đã kết nối trước đó (reload)
    useEffect(() => {
        const checkConnectedWallet = async () => {
            const provider = (await detectEthereumProvider()) as Eip1193Provider | null
            if (provider) {
                try {
                    const accounts = await provider.request?.({
                        method: 'eth_accounts',
                    })

                    if (accounts && accounts.length > 0) {
                        setAddress(accounts[0])
                        localStorage.setItem('walletAddress', accounts[0])
                    } else {
                        setAddress(null)
                        localStorage.removeItem('walletAddress')
                    }
                } catch (error) {
                    console.error('Lỗi kiểm tra ví:', error)
                }
            }
        }

        checkConnectedWallet()
    }, [])


    const connectWallet = async () => {
        const provider = (await detectEthereumProvider()) as Eip1193Provider | null

        if (!provider) {
            toast.warning('Vui lòng cài đặt MetaMask!')
            return
        }

        try {
            const ethersProvider = new BrowserProvider(provider)
            const accounts = await provider.request?.({ method: 'eth_requestAccounts' })

            if (accounts && accounts.length > 0) {
                const signer = await ethersProvider.getSigner()
                const address = await signer.getAddress()
                setAddress(address)
                localStorage.setItem('walletAddress', address)
            }
        } catch (error) {
            const err = error as MetaMaskError

            if (err.code === 4001) {
                toast.error('Kết nối ví thất bại: Bạn đã từ chối yêu cầu.')
            } else {
                toast.error('Có lỗi xảy ra khi kết nối ví.')
                console.error('Lỗi MetaMask:', err)
            }
        }
    }


    const disconnectWallet = () => {
        setAddress(null)
        localStorage.removeItem('walletAddress')
    }

    return (
        <WalletContext.Provider
            value={{
                address,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (!context) throw new Error('useWallet must be used within WalletProvider')
    return context
}
