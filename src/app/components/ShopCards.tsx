import React from 'react';
import { motion } from 'framer-motion';

interface ShopCardsProps {
  onClose: () => void;
  onGroceryClick: () => void;
  onBathClick: () => void;
}

const ShopCards: React.FC<ShopCardsProps> = ({ onClose, onGroceryClick, onBathClick }) => {
  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f9c9d9] flex items-center justify-center shadow-lg"
      >
        <img src="/images/close.png" alt="Close" className="w-4 h-4" />
      </motion.button>

      {/* Cards Container */}
      <div className="flex gap-8">
        {/* Grocery Card */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGroceryClick}
          className="w-[200px] h-[200px] bg-gradient-to-br from-[#c3ecd5] to-[#a8e6cf] rounded-[30px] p-4 shadow-lg cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <img
            src="/images/grocery-shop.png"
            alt="Grocery Shopping"
            className="w-24 h-24 object-contain"
          />
          <span className="text-[#2c9c3e] font-bold text-lg">Grocery Shop</span>
        </motion.div>

        {/* Bath & Body Card */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBathClick}
          className="w-[200px] h-[200px] bg-gradient-to-br from-[#f9c9d9] to-[#ffd4d4] rounded-[30px] p-4 shadow-lg cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <img
            src="/images/bath-shop.png"
            alt="Bath & Body Shop"
            className="w-24 h-24 object-contain"
          />
          <span className="text-[#e57373] font-bold text-lg">Bath & Body</span>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopCards; 