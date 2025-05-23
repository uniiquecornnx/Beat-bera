import React, { useState } from 'react';
import GroceryShop from './GroceryShop';
import CheckoutCounter from './CheckoutCounter';

import type { CartItem } from './CheckoutCounter';
import type { GroceryItem } from './GroceryShop';

const GroceryShopPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Example wallet balance and purchase handler
  const walletBalance = 0;
  const handlePurchase = (item: GroceryItem) => { /* ... */ };

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Add your checkout logic here (e.g., blockchain transaction, etc.)
    setTimeout(() => {
      setIsProcessing(false);
      setCart([]);
      setShowCheckout(false);
      alert('Purchase successful!');
    }, 1500);
  };

  return (
    <>
      {!showCheckout && (
        <GroceryShop
          isOpen={true}
          onClose={() => {/* ... */}}
          onPurchase={handlePurchase}
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