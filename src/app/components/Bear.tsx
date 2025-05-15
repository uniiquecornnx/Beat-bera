"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from 'three';
import GroceryShop from './GroceryShop';
import { WalletService, WalletStatus } from '../services/wallet';

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

interface BubbleButtonProps {
    icon: string;
    position: string;
    onClick: () => void;
}

interface GroceryItem {
    id: string;
    name: string;
    price: number;
    image: string;
    nutrition: number;
}

const BearModel = () => {
    const { scene } = useGLTF("/models/bear.glb");
    const bearRef = useRef<THREE.Group>(null);

    return <primitive ref={bearRef} object={scene} scale={0.3} position={[0, 0.1, 0]} />;
};

const BubbleButton = ({ icon, position, onClick }: BubbleButtonProps) => (
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
    const [isConnecting, setIsConnecting] = useState(false);
    const [isGroceryShopOpen, setIsGroceryShopOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(100); // Start with 100 coins
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const [walletStatus, setWalletStatus] = useState<WalletStatus>({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null
    });

    const handleDataChannelMessage = (event: MessageEvent) => {
        try {
            const serverEvent = JSON.parse(event.data);
            console.log('Received server event:', serverEvent);

            switch (serverEvent.type) {
                case 'session.created':
                    console.log('Session created successfully');
                    break;
                case 'input_audio_buffer.speech_started':
                    console.log('Speech started');
                    break;
                case 'input_audio_buffer.speech_stopped':
                    console.log('Speech stopped');
                    break;
                case 'response.function_call_arguments.delta':
                    // Handle function calls from the model
                    if (serverEvent.delta.name === 'bear_action') {
                        const args = JSON.parse(serverEvent.delta.arguments);
                        handleBearAction(args.action);
                    }
                    break;
                case 'error':
                    console.error('Server error:', serverEvent);
                    break;
            }
        } catch (error) {
            console.error('Error handling data channel message:', error);
        }
    };

    const handleBearAction = (action: string) => {
        switch (action) {
            case 'feed':
                // Implement feed animation/action
                console.log('Bear is eating');
                break;
            case 'play':
                // Implement play animation/action
                console.log('Bear is playing');
                break;
            case 'bathroom':
                // Implement bathroom animation/action
                console.log('Bear is going to the bathroom');
                break;
        }
    };

    const initializeWebRTC = async () => {
        try {
            setIsConnecting(true);

            // Create a new RTCPeerConnection with ICE servers
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' },
                ]
            });
            peerConnectionRef.current = pc;

            // Log ICE connection state changes
            pc.oniceconnectionstatechange = () => {
                console.log('ICE Connection State:', pc.iceConnectionState);
            };

            // Log signaling state changes
            pc.onsignalingstatechange = () => {
                console.log('Signaling State:', pc.signalingState);
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                console.log('ICE Candidate:', event.candidate);
            };

            // Create data channel
            const dataChannel = pc.createDataChannel('events', {
                ordered: true
            });
            
            dataChannel.onopen = () => {
                console.log('Data channel opened');
            };
            
            dataChannel.onclose = () => {
                console.log('Data channel closed');
            };
            
            dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
            };
            
            dataChannel.onmessage = handleDataChannelMessage;
            dataChannelRef.current = dataChannel;

            // Create audio element for playback
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            audioElementRef.current = audioEl;
            document.body.appendChild(audioEl);

            // Handle incoming audio stream from the model
            pc.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (audioElementRef.current) {
                    audioElementRef.current.srcObject = event.streams[0];
                }
            };

            // Get local audio stream (microphone)
            console.log('Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            console.log('Microphone access granted');
            mediaStreamRef.current = stream;

            // Add local audio track to peer connection
            stream.getTracks().forEach(track => {
                console.log('Adding local track:', track.kind);
                if (mediaStreamRef.current) {
                    pc.addTrack(track, mediaStreamRef.current);
                }
            });

            // Create and set local description
            console.log('Creating offer...');
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
            console.log('Setting local description...');
            await pc.setLocalDescription(offer);

            // Wait for ICE gathering to complete
            await new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve(undefined);
                } else {
                    pc.onicegatheringstatechange = () => {
                        if (pc.iceGatheringState === 'complete') {
                            resolve(undefined);
                        }
                    };
                }
            });

            // Send offer to OpenAI's Realtime API
            console.log('Sending offer to server...');
            const response = await fetch('/api/realtime-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer: pc.localDescription }),
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to initialize session');
            }

            const { answer, sessionId } = responseData;
            if (!answer) {
                throw new Error('No SDP answer received from server');
            }

            sessionIdRef.current = sessionId;
            console.log('Setting remote description...');
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Send initial session configuration
            const sessionConfig = {
                type: 'session.update',
                session: {
                    instructions: `You are a cute and friendly virtual bear. 
                                 You speak in a warm, playful manner and love interacting with your friend.
                                 Keep responses brief and engaging.`,
                }
            };
            dataChannel.send(JSON.stringify(sessionConfig));

            setListening(true);
            console.log('WebRTC setup completed successfully');
        } catch (error) {
            console.error('Error initializing WebRTC:', error);
            alert(error instanceof Error ? error.message : 'Failed to initialize voice chat. Please try again.');
            stopWebRTC();
        } finally {
            setIsConnecting(false);
        }
    };

    const stopWebRTC = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        if (audioElementRef.current) {
            audioElementRef.current.srcObject = null;
        }

        setListening(false);
    };

    const toggleVoiceChat = async () => {
        if (listening) {
            stopWebRTC();
        } else {
            await initializeWebRTC();
        }
    };

    const handlePurchase = (item: GroceryItem) => {
        if (walletBalance >= item.price) {
            setWalletBalance(prev => prev - item.price);
            handleBearAction('feed');
            // You can add animation or sound effect here
            alert(`Yummy! Your bear loves the ${item.name}!`);
        } else {
            alert("Not enough coins!");
        }
    };

    const connectWallet = async () => {
        try {
            const walletService = WalletService.getInstance();
            const status = await walletService.connectWallet();
            
            // Switch to Berachain testnet if not already on it
            if (status.chainId !== 80069) {
                await walletService.switchToBepoliaTestnet();
                // Get updated status after network switch
                const updatedStatus = await walletService.getWalletStatus();
                setWalletStatus(updatedStatus);
            } else {
                setWalletStatus(status);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please make sure you have a wallet installed and try again.');
        }
    };

    const handleWalletClick = async () => {
        if (!walletStatus.isConnected) {
            await connectWallet();
        } else {
            // Show wallet info or disconnect
            alert(`Balance: ${walletStatus.balance ? parseInt(walletStatus.balance, 16) / 1e18 : 0} BERA`);
        }
    };

    useEffect(() => {
        return () => {
            stopWebRTC();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#f5f5f5]">
            {/* Tablet Frame */}
            <div className="relative w-[800px] h-[500px] rounded-[40px] border-[16px] border-[#ffd4d4] shadow-2xl overflow-hidden bg-white">
                {/* Room Background */}
                <div className="absolute inset-0">
                    <img 
                        src="/images/bg-room.png" 
                        alt="Forest Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 3D Scene Container */}
                <div className="absolute inset-0">
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 50 }}
                        style={{ background: 'transparent' }}
                    >
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <BearModel />
                        <OrbitControls 
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 2}
                            maxPolarAngle={Math.PI / 2}
                        />
                    </Canvas>
                </div>

                {/* Wallet Button (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                    {walletStatus.isConnected && (
                        <div className="bg-[#c3ecd5] px-6 py-3 rounded-full shadow-lg">
                            <span className="text-[#2c9c3e] font-bold text-base">
                                {walletStatus.address?.slice(0, 6)}...{walletStatus.address?.slice(-4)}
                            </span>
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleWalletClick}
                        className="rounded-full bg-[#c3ecd5] p-3 shadow-lg"
                    >
                        <img src="/images/wallet.png" alt="Wallet" className="w-8 h-8" />
                    </motion.button>
                </div>

                {/* Bottom Action Buttons */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-16 z-10">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
                        onClick={() => setIsGroceryShopOpen(true)}
                    >
                        <img src="/images/food.png" alt="Food" className="w-10 h-10" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
                        onClick={toggleVoiceChat}
                    >
                        <img src="/images/games.png" alt="Games" className="w-10 h-10" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-full bg-gradient-to-r from-[#a8e6cf] to-[#dcedc1] p-3 shadow-lg"
                        onClick={() => handleBearAction('bathroom')}
                    >
                        <img src="/images/toilet.png" alt="Bathroom" className="w-10 h-10" />
                    </motion.button>
                </div>

                {/* Voice Chat Status */}
                {isConnecting && (
                    <div className="absolute top-4 left-4 bg-[#a8e6cf] text-white px-3 py-1 rounded-full text-sm animate-pulse z-10">
                        Connecting...
                    </div>
                )}
                {listening && !isConnecting && (
                    <div className="absolute top-4 left-4 bg-[#a8e6cf] text-white px-3 py-1 rounded-full text-sm z-10">
                        🎙️ Voice Chat Active
                    </div>
                )}

                {/* Grocery Shop Overlay */}
                <GroceryShop
                    isOpen={isGroceryShopOpen}
                    onClose={() => setIsGroceryShopOpen(false)}
                    onPurchase={handlePurchase}
                    walletBalance={walletStatus.balance ? parseInt(walletStatus.balance, 16) / 1e18 : 0}
                />
            </div>
        </div>
    );
};

export default Bear;