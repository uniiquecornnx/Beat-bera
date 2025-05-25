import React from 'react';

interface HappyMeterProps {
  happy: number; // 0 to 100
  imageSrc: string; // image to show at the end of the bar
}

const HappyMeter: React.FC<HappyMeterProps> = ({ happy, imageSrc }) => {
  // Clamp happy value between 0 and 100
  const clampedHappy = Math.max(0, Math.min(100, happy));

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative w-80 h-6 bg-pink-100 rounded-full overflow-hidden shadow-inner border border-[#2c9c3e]">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#c3ecd5] to-[#f9c9d9] rounded-full transition-all duration-500"
          style={{ width: `${clampedHappy}%` }}
        />
      </div>
      <img
        src={imageSrc}
        alt="Happy Bear"
        className="w-22 h-22 ml-2 object-contain drop-shadow"
        style={{ marginLeft: '-55px' }}
      />
    </div>
  );
};

export default HappyMeter; 