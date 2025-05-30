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
  onClose: () => void;
}

const DiningTable: React.FC<DiningTableProps> = ({ purchasedItems, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? purchasedItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === purchasedItems.length - 1 ? 0 : prev + 1));
  };

  if (purchasedItems.length === 0) {
    return (
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative w-[400px] h-[300px] bg-white/90 rounded-[40px] p-8 shadow-2xl flex flex-col items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f9c9d9] flex items-center justify-center shadow-lg"
          >
            <img src="/images/close.png" alt="Close" className="w-4 h-4" />
          </motion.button>
          <img src="/images/table.png" alt="Empty Table" className="w-48 h-48 object-contain mb-4" />
          <span className="text-[#2c9c3e] font-bold text-xl">No food items yet!</span>
          <span className="text-gray-500 mt-2">Visit the grocery shop to buy some food</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-[400px] h-[300px] bg-white/90 rounded-[40px] p-8 shadow-2xl">
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 4 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f9c9d9] flex items-center justify-center shadow-lg"
        >
          <img src="/images/close.png" alt="Close" className="w-4 h-4" />
        </motion.button>

        {/* Table with Food */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img src="/images/table.png" alt="Dining Table" className="w-48 h-48 object-contain" />
          
          {/* Food Item */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img
              src={purchasedItems[currentIndex].image}
              alt={purchasedItems[currentIndex].name}
              className="w-24 h-24 object-contain"
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
    </div>
  );
};

export default DiningTable; 