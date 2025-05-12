"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";

const BearModel = () => {
    const { scene } = useGLTF("/models/bear.glb");
    const bearRef = useRef();

    return <primitive ref={bearRef} object={scene} scale={0.5} />;
};

const BubbleButton = ({ icon, position, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute rounded-full bg-gradient-to-r from-green-400 to-blue-500 p-3 shadow-lg cursor-pointer ${position}`}
        onClick={onClick}
    >
        <img src={icon} alt="button" className="w-10 h-10" />
    </motion.button>
);

const Bear = () => {
    const [listening, setListening] = useState(true);
    const [response, setResponse] = useState("");

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const SpeechRecognition = window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        recognition.onresult = async (event) => {
            const spokenText = event.results[0][0].transcript;
            console.log("Heard:", spokenText);
        };

        recognition.start();

        return () => recognition.stop();
    }, [listening]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#fffce8] relative">
            <div className="relative bg-[url('/images/bg-room.png')] bg-cover bg-center rounded-[40px] p-6 w-[800px] h-[500px] border-[16px] border-[#f7d6c3] shadow-2xl border-double">
                <div className="absolute inset-0 bg-[url('/images/leafy-border.png')] bg-cover bg-no-repeat z-10 pointer-events-none" />
                <Canvas>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <BearModel />
                    <OrbitControls enableZoom={false} />
                </Canvas>

                {/* Wallet Button (Top Right) */}
                <BubbleButton icon="/images/wallet.png" position="top-4 right-4" onClick={() => alert("Connect Wallet")}/>

                {/* Food Button (Lower Middle - Left Button) */}
                <BubbleButton 
                    icon="/images/food.png" 
                    position="bottom-8 left-1/2 transform -translate-x-32" 
                    onClick={() => alert("Feed the Bear")}
                />

                {/* Games Button (Lower Middle - Center Button) */}
                <BubbleButton 
                    icon="/images/games.png" 
                    position="bottom-8 left-1/2 transform -translate-x-0" 
                    onClick={() => alert("Play Games with the Bear")}
                />

                {/* Washroom Button (Lower Middle - Right Button) */}
                <BubbleButton 
                    icon="/images/toilet.png" 
                    position="bottom-8 left-1/2 transform translate-x-32" 
                    onClick={() => alert("Take the Bear to the Washroom")}
                />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[#f8b88b] drop-shadow-lg"></h1>
        </div>
    );
};

export default Bear;