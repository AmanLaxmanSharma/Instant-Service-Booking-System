import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const ToolShape = ({ position, color, geometry, scale = 1, speed = 1, rotationProp = [0, 0, 0] }) => {
    const meshRef = useRef();

    // Initial random rotation
    const [rotation] = useState([Math.random() * Math.PI, Math.random() * Math.PI, 0]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Gentle extra rotation
        if (meshRef.current) {
            meshRef.current.rotation.x = rotation[0] + Math.sin(time * speed * 0.3) * 0.2;
            meshRef.current.rotation.y = rotation[1] + time * speed * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh
                ref={meshRef}
                position={position}
                scale={scale}
                rotation={rotationProp}
            >
                {geometry}
                <meshStandardMaterial
                    color={color}
                    metalness={0.6}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
};

const ServiceHero3D = () => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                {/* Distributed Shapes for Background */}

                {/* Top Left - Cleaning Sphere */}
                <ToolShape
                    position={[-7, 5, -2]}
                    color="#38bdf8"
                    geometry={<sphereGeometry args={[1, 32, 32]} />}
                    speed={0.8}
                />

                {/* Bottom Right - Plumbing Torus */}
                <ToolShape
                    position={[7, -5, -1]}
                    color="#94a3b8"
                    geometry={<torusGeometry args={[0.8, 0.3, 16, 32]} />}
                    scale={1.5}
                    speed={0.6}
                />

                {/* Center Deep - Repair Box */}
                <ToolShape
                    position={[0, 0, -8]}
                    color="#f472b6"
                    geometry={<boxGeometry args={[1.5, 1.5, 1.5]} />}
                    scale={1.1}
                    speed={0.4}
                />

                {/* Top Right - Electrical Octahedron */}
                <ToolShape
                    position={[6, 4, -3]}
                    color="#fbbf24"
                    geometry={<octahedronGeometry args={[1]} />}
                    speed={0.9}
                />

                {/* Bottom Left - Painting Cylinder */}
                <ToolShape
                    position={[-6, -4, 0]}
                    color="#a78bfa"
                    geometry={<cylinderGeometry args={[0.4, 0.4, 2, 32]} />}
                    rotationProp={[Math.PI / 4, 0, Math.PI / 4]}
                    speed={0.7}
                />

                {/* Extra Subtle Shapes for Depth */}
                <ToolShape
                    position={[3, 7, -6]}
                    color="#1e293b"
                    geometry={<icosahedronGeometry args={[0.8, 0]} />}
                    speed={0.3}
                />
                <ToolShape
                    position={[-4, -6, -4]}
                    color="#334155"
                    geometry={<icosahedronGeometry args={[1, 0]} />}
                    speed={0.5}
                />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default ServiceHero3D;
