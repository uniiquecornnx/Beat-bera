"use client";

import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BearModel = ({ isSpeaking }: { isSpeaking: boolean }) => {
    const { scene } = useGLTF("/models/bear.glb");
    const bearRef = useRef<THREE.Group | null>(null);

    // Only nod the head when speaking
    useFrame(() => {
        if (bearRef.current && isSpeaking) {
            bearRef.current.rotation.x = Math.sin(Date.now() * 0.005) * 0.1; // Slight nodding effect
        }
    });

    return <primitive ref={bearRef} object={scene} scale={1} />;
};

const Bear = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null as any);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const spokenText = event.results[0][0].transcript;
                console.log("You said: ", spokenText);
                setIsSpeaking(true);
                playAudio(spokenText);
            };

            recognition.onend = () => {
                setIsSpeaking(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.error("Speech recognition not supported in this browser.");
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const playAudio = (text: string) => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1.3;  // Faster, more playful
        speech.pitch = 2.8  // Higher pitch for a childish effect
        window.speechSynthesis.speak(speech);
        speech.onend = () => setIsSpeaking(false); // Stop nodding when done speaking
    };

    return (
        <div 
            className="flex flex-col justify-center items-center h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bg-room.png')" }}
        >
            <Canvas>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <BearModel isSpeaking={isSpeaking} />
                </Suspense>
                <OrbitControls enableZoom={true} />
            </Canvas>
            
            <button
                onClick={toggleListening}
                className={`mt-5 p-3 rounded-full text-white ${
                    isListening ? "bg-red-500" : "bg-green-500"
                }`}
            >
                {isListening ? "Stop Listening" : "Start Talking"}
            </button>
        </div>
    );
};

export default Bear;
