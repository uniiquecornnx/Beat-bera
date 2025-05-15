'use client';

import { WagmiProvider } from '../providers/WagmiProvider';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WagmiProvider>{children}</WagmiProvider>;
} 