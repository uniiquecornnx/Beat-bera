import { createConfig, http } from 'wagmi';

// Berachain Bepolia Testnet Configuration
const beraBepolia = {
    id: 80069,
    name: 'Berachain Bepolia',
    network: 'berachain-bepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'BERA',
        symbol: 'BERA',
    },
    rpcUrls: {
        default: { http: ['https://bepolia.rpc.berachain.com/'] },
    },
    blockExplorers: {
        default: { name: 'BeraExplorer', url: 'https://bepolia.beratrail.io/' },
    },
} as const;

// Create wagmi config
export const config = createConfig({
    chains: [beraBepolia],
    transports: {
        [beraBepolia.id]: http(),
    },
});

// Wallet connection status type
export interface WalletStatus {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    balance: string | null;
}

// Error type
export interface WalletError {
    code: number;
    message: string;
}

export class WalletService {
    private static instance: WalletService;
    private provider: any;
    private signer: any;

    private constructor() {
        if (typeof window !== 'undefined') {
            // Initialize provider when in browser environment
            this.initProvider();
        }
    }

    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    private async initProvider() {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                // Request account access
                await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                this.provider = (window as any).ethereum;
            } catch (error) {
                console.error('User denied account access');
            }
        }
    }

    public async connectWallet(): Promise<WalletStatus> {
        try {
            if (!this.provider) {
                await this.initProvider();
            }

            const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
            const chainId = await this.provider.request({ method: 'eth_chainId' });
            const balance = await this.provider.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest'],
            });

            // Check if we're on the correct network
            if (parseInt(chainId, 16) !== beraBepolia.id) {
                await this.switchToBepoliaTestnet();
            }

            return {
                isConnected: true,
                address: accounts[0],
                chainId: parseInt(chainId, 16),
                balance: balance
            };
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    public async switchToBepoliaTestnet(): Promise<void> {
        try {
            await this.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: `0x${beraBepolia.id.toString(16)}`,
                    chainName: beraBepolia.name,
                    nativeCurrency: beraBepolia.nativeCurrency,
                    rpcUrls: beraBepolia.rpcUrls.default.http,
                    blockExplorerUrls: [beraBepolia.blockExplorers.default.url],
                }],
            });
        } catch (error) {
            console.error('Error switching to Berachain Bepolia testnet:', error);
            throw error;
        }
    }

    public async getWalletStatus(): Promise<WalletStatus> {
        if (!this.provider) {
            return {
                isConnected: false,
                address: null,
                chainId: null,
                balance: null
            };
        }

        try {
            const accounts = await this.provider.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                return {
                    isConnected: false,
                    address: null,
                    chainId: null,
                    balance: null
                };
            }

            const chainId = await this.provider.request({ method: 'eth_chainId' });
            const balance = await this.provider.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest'],
            });

            return {
                isConnected: true,
                address: accounts[0],
                chainId: parseInt(chainId, 16),
                balance: balance
            };
        } catch (error) {
            console.error('Error getting wallet status:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        // Note: Most wallets don't support programmatic disconnect
        // We'll just clear our local state
        this.provider = null;
        this.signer = null;
    }

    public async sendTransaction(toAddress: string, amount: string): Promise<string> {
        if (!this.provider) {
            throw new Error('Wallet not connected');
        }

        try {
            const accounts = await this.provider.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                throw new Error('No account connected');
            }

            const transaction = {
                from: accounts[0],
                to: toAddress,
                value: amount, // Amount in wei
                gas: '0x5208', // 21000 gas limit for standard ETH transfer
            };

            const txHash = await this.provider.request({
                method: 'eth_sendTransaction',
                params: [transaction],
            });

            return txHash;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }
}