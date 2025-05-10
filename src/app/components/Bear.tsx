"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const BearModel = () => {
    const gltf = useGLTF('/models/bear.glb');  // Make sure this path is correct
    return <primitive object={gltf.scene} scale={1} />;
};

const Bear = () => {
    return (
        <div 
            className="flex justify-center items-center h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bg-room.png')" }}
        >
            <Canvas>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <BearModel />
                </Suspense>
                <OrbitControls enableZoom={true} />
            </Canvas>
        </div>
    );
};

export default Bear;
