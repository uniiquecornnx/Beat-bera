"use client";

import React, { useState, useRef } from "react";
import { WalletStatus, WalletService } from '../services/wallet';
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import BearModel from "./BearModel";
import BearWallet from "./BearWallet";
import BearWebRTC from "./BearWebRTC";
import GroceryShop from "./GroceryShop";
import { motion } from "framer-motion";

const Bear = () => {
  // ... all your state and handlers as before ...
  const [listening, setListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });
  const [isGroceryShopOpen, setIsGroceryShopOpen] = useState(false);
  // ... other state ...

  // For BearWebRTC imperative handle
  const bearWebRTCRef = useRef<any>(null);

  // This replaces the old toggleVoiceChat logic
  const toggleVoiceChat = async () => {
    if (bearWebRTCRef.current && bearWebRTCRef.current.toggleVoiceChat) {
      await bearWebRTCRef.current.toggleVoiceChat();
    }
  };

  const handleWalletClick = async () => {
    if (!walletStatus.isConnected) {
      try {
        const walletService = WalletService.getInstance();
        const newStatus = await walletService.connectWallet();
        setWalletStatus(newStatus);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      alert(`Balance: ${walletStatus.balance ? parseInt(walletStatus.balance, 16) / 1e18 : 0} BERA`);
    }
  };

  const handleBearAction = (action: string) => {
    switch (action) {
      case 'feed':
        console.log('Bear is eating');
        break;
      case 'play':
        console.log('Bear is playing');
        break;
      case 'bathroom':
        console.log('Bear is going to the bathroom');
        break;
    }
  };

  const handlePurchase = (item: GroceryItem) => {
    if (walletStatus.balance && parseInt(walletStatus.balance, 16) / 1e18 >= item.price) {
      setWalletStatus(prev => ({
        ...prev,
        balance: (parseInt(prev.balance, 16) - item.price * 1e18).toString(16)
      }));
      handleBearAction('feed');
      alert(`Yummy! Your bear loves the ${item.name}!`);
    } else {
      alert("Not enough coins!");
    }
  };

  // ... rest of your handlers (handleBearAction, handleWalletClick, etc.) ...

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f5f5f5]">
      <div className="relative w-[800px] h-[500px] rounded-[40px] border-[16px] border-[#ffd4d4] shadow-2xl overflow-hidden bg-white">
        {/* Room Background */}
        <div className="absolute inset-0">
          <img 
            src="/images/bg-room.png" 
            alt="Forest Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 3D Bear Model */}
        <div className="absolute inset-0">
          <BearModel />
        </div>

        {/* Wallet Button */}
        <BearWallet walletStatus={walletStatus} onWalletClick={handleWalletClick} />

        {/* Bottom Action Buttons */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-16 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
            onClick={() => setIsGroceryShopOpen(true)}
          >
            <img src="/images/food.png" alt="Food" className="w-10 h-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
            onClick={toggleVoiceChat}
          >
            <img src="/images/games.png" alt="Games" className="w-10 h-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
            onClick={() => handleBearAction('bathroom')}
          >
            <img src="/images/toilet.png" alt="Bathroom" className="w-10 h-10" />
          </motion.button>
        </div>

        {/* WebRTC/Voice Chat Status */}
        <BearWebRTC
          ref={bearWebRTCRef}
          onBearAction={handleBearAction}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          listening={listening}
          setListening={setListening}
        />

        {/* Grocery Shop Overlay */}
        <GroceryShop
          isOpen={isGroceryShopOpen}
          onClose={() => setIsGroceryShopOpen(false)}
          onPurchase={handlePurchase}
          walletBalance={walletStatus.balance ? parseInt(walletStatus.balance, 16) / 1e18 : 0}
        />
      </div>
    </div>
  );
};

export default Bear;