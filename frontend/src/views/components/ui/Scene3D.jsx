import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- Morning City Scene ---

const Road = () => {
    return (
        <group receiveShadow>
            {/* Asphalt */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[22, 200]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            {/* Double Yellow Line (Center) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.2, 0, 0]}>
                <planeGeometry args={[0.15, 200]} />
                <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0, 0]}>
                <planeGeometry args={[0.15, 200]} />
                <meshBasicMaterial color="#fbbf24" />
            </mesh>

            {/* White Lane Markings */}
            {Array.from({ length: 20 }).map((_, i) => (
                <group key={i} position={[0, 0, i * 12 - 100]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0, 0]}>
                        <planeGeometry args={[0.15, 3]} />
                        <meshBasicMaterial color="white" opacity={0.6} transparent />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.5, 0, 0]}>
                        <planeGeometry args={[0.15, 3]} />
                        <meshBasicMaterial color="white" opacity={0.6} transparent />
                    </mesh>
                </group>
            ))}

            {/* Sidewalks */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.05, 0]}>
                <planeGeometry args={[4, 200]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.05, 0]}>
                <planeGeometry args={[4, 200]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
        </group>
    );
};

const Car = ({ startZ, speed, color = "#ef4444", lane = 1 }) => {
    const carRef = useRef();
    const wheelOffset = 0.8;

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        if (carRef.current) {
            const trackLength = 120;
            const currentZ = ((time * speed) + startZ) % (trackLength * 2);
            carRef.current.position.z = currentZ - trackLength;
            carRef.current.position.x = lane * 3.5;
        }
    });

    return (
        <group ref={carRef} position={[0, 0.6, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[1.8, 0.6, 4]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0, 0.9, -0.2]}>
                <boxGeometry args={[1.6, 0.5, 2.2]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.2} /> {/* Windshield/Roof */}
            </mesh>

            {/* Simple Wheels */}
            <mesh position={[0.9, 0, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.9, 0, 1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.9, 0, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.9, 0, -1.2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
        </group>
    );
};

const Building = ({ position, height, color }) => {
    return (
        <group position={position}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[7, height, 7]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Modern Glass Strips */}
            <mesh position={[0, height / 2, 3.55]}>
                <planeGeometry args={[4, height - 2]} />
                <meshStandardMaterial color="#bfdbfe" metalness={0.8} roughness={0.1} />
            </mesh>
        </group>
    );
};

const CitySide = ({ side = 1 }) => {
    const buildings = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            z: i * 18 - 100,
            height: 12 + Math.random() * 25,
            color: Math.random() > 0.5 ? '#f8fafc' : '#e2e8f0' // White/Light Gray buildings
        }));
    }, []);

    return (
        <group position={[side * 20, 0, 0]}>
            {buildings.map((b, i) => (
                <Building key={i} position={[0, 0, b.z]} height={b.height} color={b.color} />
            ))}
        </group>
    );
};

const Scene3D = () => {
    const morningSkyColor = '#e0f2fe'; // Light morning blue
    const sunColor = '#FFD580'; // Warm morning sun

    return (
        <Canvas camera={{ position: [15, 8, 15], fov: 40 }} shadows>
            {/* Background Color */}
            <color attach="background" args={[morningSkyColor]} />

            {/* Fog for depth blending */}
            <fog attach="fog" args={[morningSkyColor, 20, 90]} />

            {/* Lighting */}
            <ambientLight intensity={0.7} color="#ffffff" />
            <directionalLight
                position={[50, 30, 20]}
                intensity={1.5}
                color={sunColor}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.001}
            />
            {/* Fill light from sky */}
            <hemisphereLight skyColor={morningSkyColor} groundColor="#334155" intensity={0.5} />

            <Road />

            {/* Moving Cars */}
            <Car startZ={0} speed={12} color="#ef4444" lane={1} />
            <Car startZ={40} speed={15} color="#3b82f6" lane={-1} />
            <Car startZ={-30} speed={10} color="#f59e0b" lane={1} />
            <Car startZ={-70} speed={18} color="#10b981" lane={-1} />

            {/* City */}
            <CitySide side={1} />
            <CitySide side={-1} />

            <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2.1}
                minPolarAngle={Math.PI / 3}
            />
        </Canvas>
    );
};

export default Scene3D;
