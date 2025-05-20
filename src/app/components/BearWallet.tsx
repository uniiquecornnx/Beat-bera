// src/app/components/BearWallet.tsx
import React from "react";
import { motion } from "framer-motion";
import { WalletStatus } from "../services/wallet";

interface BearWalletProps {
  walletStatus: WalletStatus;
  onWalletClick: () => void;
}

const BearWallet: React.FC<BearWalletProps> = ({ walletStatus, onWalletClick }) => (
  <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
    {walletStatus.isConnected && (
      <div className="bg-[#c3ecd5] px-6 py-3 rounded-full shadow-lg">
        <span className="text-[#2c9c3e] font-bold text-base">
          {walletStatus.address?.slice(0, 6)}...{walletStatus.address?.slice(-4)}
        </span>
      </div>
    )}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onWalletClick}
      className="rounded-full bg-[#c3ecd5] p-3 shadow-lg"
    >
      <img src="/images/wallet.png" alt="Wallet" className="w-8 h-8" />
    </motion.button>
  </div>
);

export default BearWallet;