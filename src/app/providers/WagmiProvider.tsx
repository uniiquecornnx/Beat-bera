'use client';

import { WagmiProvider as WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../services/wallet';

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiConfig config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiConfig>
    );
} 