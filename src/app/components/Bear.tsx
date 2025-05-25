"use client";

import React, { useState, useRef } from "react";
import { WalletStatus, WalletService } from '../services/wallet';
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import BearModel from "./BearModel";
import BearWallet from "./BearWallet";
import BearWebRTC, { BearWebRTCHandle } from './BearWebRTC';
import GroceryShop from "./GroceryShop";
import GroceryShopPage from "./GroceryShopPage";
import { motion } from "framer-motion";
import HappyMeter from "./HappyMeter";
import DiningTable from './DiningTable';

interface GroceryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  nutrition: number;
}

interface CartItem extends GroceryItem {
  quantity: number;
}

interface GroceryShopPageProps {
  onClose: () => void;
  onPurchase: (item: GroceryItem) => void;
  walletBalance: number;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [happy, setHappy] = useState(50); // Start at 50, or whatever you like
  const [purchasedItems, setPurchasedItems] = useState<GroceryItem[]>([]);
  // ... other state ...

  // For BearWebRTC imperative handle
  const bearWebRTCRef = useRef<BearWebRTCHandle>(null);

  // This replaces the old toggleVoiceChat logic
  const toggleVoiceChat = async () => {
    if (bearWebRTCRef.current) {
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
        balance: (parseInt(prev.balance || '0', 16) - item.price * 1e18).toString(16)
      }));
      handleBearAction('feed');
      setHappy(prev => Math.min(100, prev + item.nutrition));
      setPurchasedItems(prev => [...prev, item]);
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
        {isGroceryShopOpen && (
          <GroceryShopPage
            onClose={() => {
              setIsGroceryShopOpen(false);
              setCart([]);
            }}
            onPurchase={handlePurchase}
            walletBalance={walletStatus.balance ? parseInt(walletStatus.balance, 16) / 1e18 : 0}
            cart={cart}
            setCart={setCart}
          />
        )}

        {/* Happy Meter */}
        <div className="absolute left-9 top-1/10 transform -translate-y-1/2">
          <HappyMeter happy={happy} imageSrc="/images/happy-bear.png" />
        </div>

        {/* Dining Table */}
        <DiningTable purchasedItems={purchasedItems} />
      </div>
    </div>
  );
};

export default Bear;