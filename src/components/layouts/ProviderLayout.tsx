"use client"

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

const ProviderLayout = ({ children }: { children: ReactNode }) => {

    return (
        <>
            <SessionProvider>
                {children}
            </SessionProvider>
        </>
    )
}

export default ProviderLayout;