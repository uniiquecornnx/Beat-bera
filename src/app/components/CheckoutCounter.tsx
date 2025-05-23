import React from 'react';
import { motion } from 'framer-motion';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    nutrition: number;
    quantity: number;
}

interface CheckoutCounterProps {
    cart: CartItem[];
    onCartChange: (cart: CartItem[]) => void;
    onCheckout: () => void;
    onBack: () => void;
    isProcessing?: boolean;
}

const CheckoutCounter: React.FC<CheckoutCounterProps> = ({ cart, onCartChange, onCheckout, onBack, isProcessing }) => {
    const handleRemove = (itemId: string) => {
        const updatedCart = cart.filter(item => item.id !== itemId);
        onCartChange(updatedCart);
    };

    const handleQuantityChange = (itemId: string, delta: number) => {
        const updatedCart = cart.map(item =>
            item.id === itemId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        );
        onCartChange(updatedCart);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-white/90 rounded-[40px] z-30 overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="w-12 h-12 rounded-full bg-[#f9c9d9] flex items-center justify-center shadow-lg"
                >
                    <img src="/images/back.png" alt="Back" className="w-6 h-6" />
                </motion.button>
                <div className="text-[#2c9c3e] font-bold text-xl">Checkout</div>
                <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12">Your cart is empty.</div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-pink-100">
                            <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                <span className="text-gray-700 font-medium text-base">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-[#ffd4d4] rounded-full text-[#ff6b6b] text-lg font-bold"
                                    disabled={item.quantity === 1}
                                >
                                    -
                                </motion.button>
                                <span className="text-gray-700 font-bold text-lg min-w-[24px] text-center">{item.quantity}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-[#c3ecd5] rounded-full text-[#2c9c3e] text-lg font-bold"
                                >
                                    +
                                </motion.button>
                                <span className="ml-4 text-[#2c9c3e] font-bold text-lg">{item.price * item.quantity} BERA</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRemove(item.id)}
                                    className="ml-2 w-8 h-8 flex items-center justify-center bg-[#f9c9d9] rounded-full text-[#e57373] text-lg font-bold"
                                >
                                    ×
                                </motion.button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-pink-100 rounded-b-[40px] shadow-lg flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-[#2c9c3e] font-bold text-xl">Total: {getTotalPrice()} BERA</span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className={`px-8 py-3 bg-[#c3ecd5] text-[#2c9c3e] rounded-full shadow-lg font-bold text-lg ${cart.length === 0 || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? 'Processing...' : 'Checkout'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default CheckoutCounter; 