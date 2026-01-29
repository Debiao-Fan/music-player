import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ClassicBars = ({ audioData }: { audioData: Uint8Array }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 64; // Number of bars
    const radius = 12; // Circle radius

    // Create dummy object for positioning
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;

        // Use a subset of audio data (low to mid frequencies)
        const dataLen = audioData.length;
        const step = Math.floor((dataLen || 0) / count / 2);

        for (let i = 0; i < count; i++) {
            const dataIndex = i * step;
            // Default value to 20 if no audio data, so we see something (idle state)
            const value = dataLen > 0 ? (audioData[dataIndex] || 0) : 20;

            // Calculate position in circle
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Scale height based on audio value
            const scaleY = 0.5 + (value / 255) * 15;

            dummy.position.set(x, 0, z);
            dummy.rotation.y = -angle; // Rotate to face center or outward
            dummy.scale.set(1, scaleY, 1);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color change based on height
            const color = new THREE.Color();
            // Idle color vs Audio color
            if (dataLen > 0) {
                // Hip-Hop theme: Purple to Green gradient reaction
                color.setHSL(0.75 + (value / 255) * 0.4, 0.8, 0.5);
            } else {
                // Idle purple
                color.setHSL(0.75, 0.5, 0.2);
            }
            meshRef.current.setColorAt(i, color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

        // Rotate entire ring slowly
        meshRef.current.rotation.y += 0.002;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.8, 1, 0.8]} />
            <meshStandardMaterial toneMapped={false} />
        </instancedMesh>
    );
};
