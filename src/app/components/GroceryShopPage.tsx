import React, { useState } from 'react';
import GroceryShop from './GroceryShop';
import CheckoutCounter from './CheckoutCounter';
import HappyMeter from "./HappyMeter";

import type { CartItem } from './CheckoutCounter';
import type { GroceryItem } from './GroceryShop';

interface GroceryShopPageProps {
  onClose: () => void;
  onPurchase: (item: GroceryItem) => void;
  walletBalance: number;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const GroceryShopPage: React.FC<GroceryShopPageProps> = ({
  onClose,
  onPurchase,
  walletBalance,
  cart,
  setCart
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Process each item in the cart
    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        await onPurchase(item);
      }
    }
    setIsProcessing(false);
    setCart([]);
    setShowCheckout(false);
    onClose();
  };

  return (
    <>
      {!showCheckout && (
        <GroceryShop
          isOpen={true}
          onClose={onClose}
          onPurchase={onPurchase}
          walletBalance={walletBalance}
          cart={cart}
          setCart={setCart}
          onNext={() => setShowCheckout(true)}
        />
      )}
      {showCheckout && (
        <CheckoutCounter
          cart={cart}
          onCartChange={setCart}
          onCheckout={handleCheckout}
          onBack={() => setShowCheckout(false)}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};

export default GroceryShopPage; 