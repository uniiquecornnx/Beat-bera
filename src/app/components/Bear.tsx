"use client";

import React, { useState, useRef, useEffect } from "react";
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
import ShopCards from './ShopCards';
import Lottie from "react-lottie-player";

interface GroceryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  nutrition: number;
  quantity?: number;
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
  const [showShopCards, setShowShopCards] = useState(false);
  const [showDiningTable, setShowDiningTable] = useState(false);
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);
  const [sampleFoodItems] = useState<GroceryItem[]>([
    { id: '1', name: 'Apple', image: '/images/apple.png', price: 10, nutrition: 10, quantity: 3 },
    { id: '2', name: 'Banana', image: '/images/banana.png', price: 15, nutrition: 15, quantity: 2 },
    { id: '3', name: 'Carrot', image: '/images/carrot.png', price: 8, nutrition: 8, quantity: 4 },
    { id: '4', name: 'Orange', image: '/images/orange.png', price: 12, nutrition: 12, quantity: 1 },
  ]);
  const [ballAnimation, setBallAnimation] = useState<any>(null);
  const [chairAnimation, setChairAnimation] = useState<any>(null);

  // For BearWebRTC imperative handle
  const bearWebRTCRef = useRef<BearWebRTCHandle>(null);

  useEffect(() => {
    fetch('/animations/ball.json')
      .then(res => res.json())
      .then(data => setBallAnimation(data));
    fetch('/animations/your-animation.json')
      .then(res => res.json())
      .then(data => setChairAnimation(data));
  }, []);

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
      {/* Faded Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg-room.png" 
          alt="Faded Forest Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative w-[800px] h-[500px] rounded-[40px] border-[16px] border-[#ffd4d4] shadow-2xl overflow-hidden bg-white z-10">
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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-16 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
            onClick={() => setShowDiningTable(!showDiningTable)}
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

        {/* Table UI Element */}
        {showDiningTable && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
              <img
                src="/images/table.png"
                alt="Dining Table"
                className="w-65 h-65 object-contain"
              />
              
              {/* Single Food Item with Navigation */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <img
                    src={sampleFoodItems[currentFoodIndex]?.image}
                    alt={sampleFoodItems[currentFoodIndex]?.name}
                    className="w-16 h-16 object-contain"
                  />
                  {/* Quantity Box */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-md px-1 py-0 shadow-sm border border-[#2c9c3e]">
                    <span className="text-[10px] font-bold text-[#2c9c3e]">
                      x{sampleFoodItems[currentFoodIndex]?.quantity || 0}
                    </span>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute top-1/2 left-0 right-0 flex justify-between px-40 transform -translate-y-1/2 z-50">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentFoodIndex((prev) => (prev === 0 ? sampleFoodItems.length - 1 : prev - 1))}
                    className="w-10 h-10 rounded-full bg-[#c3ecd5] flex items-center justify-center shadow-lg border-2 border-[#2c9c3e]"
                  >
                    <img src="/images/back.png" alt="Previous" className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentFoodIndex((prev) => (prev === sampleFoodItems.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 rounded-full bg-[#c3ecd5] flex items-center justify-center shadow-lg border-2 border-[#2c9c3e]"
                  >
                    <img src="/images/next.png" alt="Next" className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WebRTC/Voice Chat Status */}
        <BearWebRTC
          ref={bearWebRTCRef}
          onBearAction={handleBearAction}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          listening={listening}
          setListening={setListening}
        />

        {/* Shop Cards Overlay */}
        {showShopCards && (
          <ShopCards
            onClose={() => setShowShopCards(false)}
            onGroceryClick={() => {
              setShowShopCards(false);
              setIsGroceryShopOpen(true);
            }}
            onBathClick={() => {
              setShowShopCards(false);
              // TODO: Implement bath shop functionality
              alert('Bath & Body shop coming soon!');
            }}
          />
        )}

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

        {/* Happy Meter and Shop Button Container */}
        <div className="absolute left-4 top-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowShopCards(true)}
            className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-2.5 shadow-lg"
          >
            <img src="/images/shop.png" alt="Shop" className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Happy Meter */}
        <div className="absolute left-1/2 top--4 transform -translate-x-1/2">
          <HappyMeter happy={happy} imageSrc="/images/happy-bear.png" />
        </div>

        {/* Beach Chair (left of bear) */}
        <img
          src="/images/beach-chair.png"
          alt="Beach Chair"
          className="absolute left-14 bottom-19.5 w-50 h-auto z-10"
        />
        {/* Lottie Animation next to beach chair */}
        <motion.div
          className="absolute left-40 bottom-20 w-16 h-16 z-20 flex items-center justify-center"
          whileHover={{ scale: 1.2, y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {chairAnimation && (
            <Lottie
              loop
              play={true}
              animationData={chairAnimation}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </motion.div>
        {/* Animated Ball next to beach chair */}
        <motion.div
          className="absolute left-80 bottom-32 w-16 h-16 z-20 flex items-center justify-center"
          whileHover={{ scale: 1.2, y: -10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {ballAnimation && (
            <Lottie
              loop
              play={true}
              animationData={ballAnimation}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Bear;