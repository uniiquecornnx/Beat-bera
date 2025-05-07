"use client";

import React, { useEffect } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

const Bear = () => {
    useEffect(() => {
        const dotLottie = new DotLottie({
            autoplay: true,
            loop: true,
            canvas: document.getElementById('dotlottie-canvas') as HTMLCanvasElement,
            src: '/animations/bear.json',  // Ensure this path is correct
        });
    }, []);

    return (
        <div 
            className="flex justify-center items-center h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bg-room.png')" }}
        >
            <canvas id="dotlottie-canvas" width="300" height="300"></canvas>
        </div>
    );
};

export default Bear;
