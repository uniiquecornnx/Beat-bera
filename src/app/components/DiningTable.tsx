import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FoodItem {
  id: string;
  name: string;
  image: string;
  nutrition: number;
}

interface DiningTableProps {
  purchasedItems: FoodItem[];
}

const DiningTable: React.FC<DiningTableProps> = ({ purchasedItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? purchasedItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === purchasedItems.length - 1 ? 0 : prev + 1));
  };

  if (purchasedItems.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
      {/* Table */}
      <div className="relative w-64 h-40">
        <img
          src="/images/table.png"
          alt="Dining Table"
          className="w-full h-full object-contain"
        />
        
        {/* Food Item */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src={purchasedItems[currentIndex].image}
            alt={purchasedItems[currentIndex].name}
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            className="w-8 h-8 rounded-full bg-[#c3ecd5] flex items-center justify-center shadow-lg"
          >
            <img src="/images/back.png" alt="Previous" className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-[#c3ecd5] flex items-center justify-center shadow-lg"
          >
            <img src="/images/next.png" alt="Next" className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Food Name */}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-[#2c9c3e]">
            {purchasedItems[currentIndex].name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiningTable; 