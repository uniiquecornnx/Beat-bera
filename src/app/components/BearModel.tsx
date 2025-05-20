"use client";


import React, { useRef } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const BearModel = () => {
  const { scene } = useGLTF("/models/bear.glb");
  const bearRef = useRef<THREE.Group>(null);

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive ref={bearRef} object={scene} scale={0.3} position={[0, 0.1, 0]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};

export default BearModel;