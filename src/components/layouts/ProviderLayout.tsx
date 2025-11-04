"use client"

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import SessionSync from "@/components/SessionSync";

// Component con để sử dụng useTokenRefresh bên trong SessionProvider
const TokenRefreshHandler = () => {
    console.log("🟣 [TokenRefreshHandler] Component rendering");
    useTokenRefresh();
    return null;
};

const ProviderLayout = ({ children }: { children: ReactNode }) => {
    console.log("🟣 [ProviderLayout] Component rendering");

    return (
        <>
            <SessionProvider>
                <SessionSync />
                <TokenRefreshHandler />
                {children}
            </SessionProvider>
        </>
    )
}

export default ProviderLayout;