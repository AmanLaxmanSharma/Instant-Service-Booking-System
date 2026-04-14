import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Utility: Lat/Lon to Vector3
const latLongToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

// Camera Controller (Zooms to user)
const CameraController = ({ userLocation, radius }) => {
    const { camera, controls } = useThree();
    const targetPos = useRef(null);

    useEffect(() => {
        if (userLocation) {
            const target = latLongToVector3(userLocation.lat, userLocation.lng, radius + 3);
            targetPos.current = target;
        }
    }, [userLocation, radius]);

    useFrame((state, delta) => {
        if (targetPos.current) {
            state.camera.position.lerp(targetPos.current, 2 * delta);
            if (controls) controls.update();
        }
    });

    return null;
};

// Fallback Component
const WireframeEarth = () => {
    return (
        <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial color="#334155" wireframe />
        </mesh>
    );
};

// Earth Model Component
const EarthModel = ({ userLocation }) => {
    const { scene } = useGLTF('/earth_model/scene.gltf');
    const texture = useTexture('/earth_model/textures/Material.002_diffuse.jpeg');
    const groupRef = useRef();

    useEffect(() => {
        // Fix for potential GLTF material issues (e.g. SpecularGlossiness not supported)
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.7,
                    metalness: 0.1,
                });
            }
        });
    }, [scene, texture]);

    useFrame((state, delta) => {
        // Rotate slowly if no user location is active
        if (groupRef.current && !userLocation) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    // The scale of the loaded model needs to be adjusted to match radius ~2
    // The original model (Sketchfab) seems to have a scale of 100 on the Sphere node.
    // We scale the whole scene down to match our scene units.

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={[0.02, 0.02, 0.02]} />
        </group>
    );
};

// Marker Component
const Marker = ({ position, color, label, pulse }) => {
    const meshRef = useRef();
    useFrame(({ clock }) => {
        if (pulse && meshRef.current) {
            const scale = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.3;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={position}>
            <mesh position={[0, 0.1, 0]} ref={meshRef}>
                <coneGeometry args={[0.05, 0.2, 16]} rotation={[Math.PI, 0, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
            </mesh>
            <Html distanceFactor={12} position={[0, 0.3, 0]}>
                <div style={{ color: 'white', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {label}
                </div>
            </Html>
        </group>
    );
};

const ConnectionArc = ({ start, end, radius }) => {
    const points = useMemo(() => {
        const p1 = start.clone();
        const p2 = end.clone();
        const midHeight = radius + (start.distanceTo(p2) * 0.8);
        const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(midHeight);
        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        return curve.getPoints(50);
    }, [start, end, radius]);

    const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.6} linewidth={1} />
        </line>
    );
};

// Main Component
const Earth3D = ({ userLocation, providerLocation }) => {
    return (
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />

            {/* Lighting strictly as requested */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Suspense fallback={<WireframeEarth />}>
                <EarthModel userLocation={userLocation} />
            </Suspense>

            {/* Markers & Interaction */}
            {userLocation && (
                <Marker
                    position={latLongToVector3(userLocation.lat, userLocation.lng, 2.02)}
                    color="#38bdf8"
                    label="You"
                />
            )}
            {providerLocation && (
                <Marker
                    position={latLongToVector3(providerLocation.lat, providerLocation.lng, 2.02)}
                    color="#ec4899"
                    label="Provider"
                    pulse={true}
                />
            )}
            {userLocation && providerLocation && (
                <ConnectionArc
                    start={latLongToVector3(userLocation.lat, userLocation.lng, 2)}
                    end={latLongToVector3(providerLocation.lat, providerLocation.lng, 2)}
                    radius={2}
                />
            )}

            <CameraController userLocation={userLocation} radius={2} />

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2.5}
                maxDistance={10}
                autoRotate={!userLocation}
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
};

export default Earth3D;
