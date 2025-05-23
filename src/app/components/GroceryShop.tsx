import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletService } from '../services/wallet';

export interface GroceryItem {
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
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    onNext: () => void;
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

const GroceryShop: React.FC<GroceryShopProps> = ({ isOpen, onClose, onPurchase, walletBalance, cart = [], setCart, onNext }) => {
    if (!isOpen) return null;

    const addToCart = (item: GroceryItem) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId: string) => {
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            setCart(cart.map(cartItem =>
                cartItem.id === itemId
                    ? { ...cartItem, quantity: cartItem.quantity - 1 }
                    : cartItem
            ));
        } else {
            setCart(cart.filter(cartItem => cartItem.id !== itemId));
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
                <div className="bg-[#c3ecd5] px-6 py-3 rounded-full text-base font-bold shadow-lg text-[#2c9c3e]">
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
                        className="bg-white border-2 border-[#f9c9d9] rounded-lg p-2 flex flex-col items-center cursor-pointer shadow-xl"
                        onClick={() => addToCart(item)}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-contain mb-2"
                        />
                        <p className="text-[#2c9c3e] font-bold text-xl">{item.price} BERA</p>
                    </motion.div>
                ))}
            </div>

            {/* Cart Section */}
            <div className="absolute bottom-0 right-0 p-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    disabled={cart.length === 0}
                    className={`px-7 py-3 bg-[#c3ecd5] text-[#2c9c3e] rounded-full shadow-lg font-bold text-lg ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Next
                </motion.button>
            </div>
        </motion.div>
    );
};

export default GroceryShop; 