import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletService } from '../services/wallet';

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

interface GroceryShopProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (item: GroceryItem) => void;
    walletBalance: number;
}

const SHOP_WALLET_ADDRESS = '0xCdC20B8B31f4AD4a996D1425aDF7f786BB94b0c3';

const groceryItems: GroceryItem[] = [
    {
        id: '1',
        name: 'Banana',
        price: 5,
        image: '/images/banana.png',
        nutrition: 10
    },
    {
        id: '2',
        name: 'Apple',
        price: 6,
        image: '/images/apple.png',
        nutrition: 8
    },
    {
        id: '3',
        name: 'Carrot',
        price: 4,
        image: '/images/carrot.png',
        nutrition: 7
    },
    {
        id: '4',
        name: 'Honey',
        price: 15,
        image: '/images/honey.png',
        nutrition: 20
    },
    {
        id: '5',
        name: 'Mango',
        price: 8,
        image: '/images/mango.png',
        nutrition: 12
    },
    {
        id: '6',
        name: 'Strawberry',
        price: 7,
        image: '/images/strawberry.png',
        nutrition: 9
    },
    {
        id: '7',
        name: 'Watermelon',
        price: 12,
        image: '/images/watermelon.png',
        nutrition: 11
    },
    {
        id: '8',
        name: 'Broccoli',
        price: 6,
        image: '/images/broccoli.png',
        nutrition: 15
    },
    {
        id: '9',
        name: 'Spinach',
        price: 5,
        image: '/images/spinach.png',
        nutrition: 13
    },
    {
        id: '10',
        name: 'Blueberries',
        price: 9,
        image: '/images/blueberries.png',
        nutrition: 14
    },
    {
        id: '11',
        name: 'Sweet Potato',
        price: 7,
        image: '/images/sweet-potato.png',
        nutrition: 16
    },
    {
        id: '12',
        name: 'Avocado',
        price: 10,
        image: '/images/avocado.png',
        nutrition: 18
    }
];

const GroceryShop: React.FC<GroceryShopProps> = ({ isOpen, onClose, onPurchase, walletBalance }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const addToCart = (item: GroceryItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem.id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prevCart.filter(cartItem => cartItem.id !== itemId);
        });
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);
            const totalPrice = getTotalPrice();
            const walletService = WalletService.getInstance();
            
            // Convert price to wei (1 BERA = 10^18 wei)
            const priceInWei = BigInt(totalPrice * 10**18).toString();
            
            // Send transaction to the shop wallet
            const txHash = await walletService.sendTransaction(SHOP_WALLET_ADDRESS, priceInWei);
            console.log('Transaction hash:', txHash);

            // Process each item in cart
            cart.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    onPurchase(item);
                }
            });

            // Clear cart after successful purchase
            setCart([]);
            alert('Purchase successful! Your bear will love these treats!');
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-[url('/images/grocery-bg.png')] bg-cover bg-center rounded-[40px] z-20 overflow-hidden"
        >
            {/* Shop Header */}
            <div className="flex justify-between items-center p-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-[#c3ecd5] flex items-center justify-center shadow-lg"
                >
                    <img
                        src="/images/back.png"
                        alt="Back"
                        className="w-6 h-6"
                    />
                </motion.button>
                <div className="bg-[#c3ecd5] px-6 py-3 rounded-full text-base font-medium shadow-lg">
                    Balance: {walletBalance} BERA
                </div>
            </div>

            {/* Shop Items Grid */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 max-h-[50%] overflow-y-auto">
                {groceryItems.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-[#f5f5f5] rounded-xl p-4 flex flex-col items-center cursor-pointer shadow-lg"
                        onClick={() => addToCart(item)}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-contain mb-3"
                        />
                        <p className="text-[#2c9c3e] font-bold text-xl">{item.price} BERA</p>
                    </motion.div>
                ))}
            </div>

            {/* Cart Section */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#f5f5f5] p-6 rounded-t-[32px] shadow-lg">
                <div className="max-h-[150px] overflow-y-auto">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                                <span className="text-gray-700 font-medium text-base">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(item.id);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-[#ffd4d4] rounded-full text-[#ff6b6b] text-lg font-bold"
                                >
                                    -
                                </motion.button>
                                <span className="text-gray-700 font-bold text-lg min-w-[24px] text-center">{item.quantity}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-[#c3ecd5] rounded-full text-[#2c9c3e] text-lg font-bold"
                                >
                                    +
                                </motion.button>
                                <span className="ml-4 text-[#2c9c3e] font-bold text-lg">{item.price * item.quantity} BERA</span>
                            </div>
                        </div>
                    ))}
                </div>
                {cart.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-[#2c9c3e] font-bold text-xl">Total: {getTotalPrice()} BERA</span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className={`px-8 py-3 bg-[#c3ecd5] text-[#2c9c3e] rounded-full shadow-lg font-bold text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? 'Processing...' : 'Checkout'}
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default GroceryShop; 