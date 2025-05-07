import React, { useEffect } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

const Bear = () => {
    useEffect(() => {
        const dotLottie = new DotLottie({
            autoplay: true,
            loop: true,
            canvas: document.getElementById('dotlottie-canvas') as HTMLCanvasElement,
            src: '/animations/bear.json',  // Make sure this path is correct
        });
    }, []);

    return (
        <div className="flex justify-center items-center h-screen bg-green-200">
            <canvas id="dotlottie-canvas" width="300" height="300"></canvas>
        </div>
    );
};

export default Bear;
