"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";

interface SpeechRecognition {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
    };
}

const BearModel = () => {
    const { scene } = useGLTF("/models/bear.glb");
    const bearRef = useRef();

    return <primitive ref={bearRef} object={scene} scale={0.5} />;
};

const BubbleButton = ({ icon, position, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute rounded-full bg-gradient-to-r from-green-300 to-blue-200 p-3 shadow-lg cursor-pointer ${position}`}
        onClick={onClick}
    >
        <img src={icon} alt="button" className="w-10 h-10" />
    </motion.button>
);

const Bear = () => {
    const [listening, setListening] = useState(false);
    const [response, setResponse] = useState("");
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    const toggleSpeechRecognition = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in your browser");
            return;
        }

        if (!recognition) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = "en-US";
            newRecognition.interimResults = false;
            newRecognition.maxAlternatives = 1;
            newRecognition.continuous = true;

            newRecognition.onresult = (event: SpeechRecognitionEvent) => {
                const spokenText = event.results[0][0].transcript;
                console.log("Heard:", spokenText);
            };

            setRecognition(newRecognition);
            newRecognition.start();
        } else {
            if (!listening) {
                recognition.start();
            } else {
                recognition.stop();
            }
        }
        setListening(!listening);
    };

    useEffect(() => {
        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, [recognition]);

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
                    onClick={toggleSpeechRecognition}
                />

                {/* Washroom Button (Lower Middle - Right Button) */}
                <BubbleButton 
                    icon="/images/toilet.png" 
                    position="bottom-8 left-1/2 transform translate-x-32" 
                    onClick={() => alert("Take the Bear to the Washroom")}
                />

                {/* Speech Recognition Status Indicator */}
                {listening && (
                    <div className="absolute top-4 left-4 bg-salt-100 text-white px-3 py-1 rounded-full text-sm">
                        🎙️
                    </div>
                )}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[#f8b88b] drop-shadow-lg"></h1>
        </div>
    );
};

export default Bear;