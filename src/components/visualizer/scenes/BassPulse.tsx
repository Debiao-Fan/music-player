import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const BassPulse = ({ audioData }: { audioData: Uint8Array }) => {
    const materialRef = useRef<any>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Calculate average volume of low frequencies (Bass)
        // The first ~10-20 bins are usually sub-bass and bass
        let bassTotal = 0;
        const bassBinCount = 16;

        if (audioData.length > 0) {
            for (let i = 0; i < bassBinCount; i++) {
                bassTotal += audioData[i];
            }
        }

        const averageBass = audioData.length > 0 ? bassTotal / bassBinCount : 0;

        // Smooth Scale (0 to 1 based on volume)
        const intensity = averageBass / 255;

        // Scale the sphere based on bass
        const targetScale = 1.0 + intensity * 1.5;

        // Lerp for smooth transition (Linear Interpolation)
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);

        // Distort material based on intensity
        if (materialRef.current) {
            materialRef.current.distort = 0.3 + intensity * 0.5;
            materialRef.current.color.setHSL(0.5 + intensity * 0.2, 0.9, 0.5); // Blue to Purple
        }

        // Gentle rotation
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Sphere args={[2, 64, 64]} ref={meshRef}>
            <MeshDistortMaterial
                ref={materialRef}
                color="#8b5cf6"
                envMapIntensity={1}
                clearcoat={1}
                roughness={0}
                metalness={0.9}
                distort={0.4}
                speed={2}
            />
        </Sphere>
    );
};
