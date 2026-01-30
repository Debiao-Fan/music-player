import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CircularTunnelProps {
    audioData: Uint8Array;
}

export const CircularTunnel = ({ audioData }: CircularTunnelProps) => {
    // Number of rings in the tunnel
    const COUNT = 40;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    // Create a dummy object for positioning instances
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const color = new THREE.Color();
    const targetColor = new THREE.Color();

    useFrame((state) => {
        if (!meshRef.current) return;

        // Move camera through the tunnel
        const time = state.clock.getElapsedTime();
        state.camera.position.z = 20 + Math.sin(time * 0.2) * 5;
        state.camera.position.x = Math.sin(time * 0.5) * 2;
        state.camera.lookAt(0, 0, -50);

        // Analyze audio for bass and high frequencies
        let bass = 0;
        let high = 0;

        if (audioData.length > 0) {
            // Calculate bass (lower frequencies)
            for (let i = 0; i < 20; i++) {
                bass += audioData[i];
            }
            bass = bass / 20 / 255; // Normalize 0-1

            // Calculate highs (mid-high frequencies)
            for (let i = 100; i < 150; i++) {
                high += audioData[i];
            }
            high = high / 50 / 255;
        }

        // Pulse light with bass
        if (lightRef.current) {
            lightRef.current.intensity = 1 + bass * 3;
            lightRef.current.color.setHSL(0.6 + bass * 0.2, 1, 0.5); // Purple to Pink pulse
        }

        // Update each ring
        for (let i = 0; i < COUNT; i++) {
            // Position rings in a tunnel shape along Z axis
            const zPos = -i * 2; // Distance between rings

            // Dynamic warp based on audio
            const warp = Math.sin(time * 2 + i * 0.2) * (bass * 3);
            const scale = 1 + (high * 2) * Math.sin(i * 0.5 + time);

            dummy.position.set(0, 0, zPos);
            dummy.scale.set(scale, scale, 1);
            dummy.rotation.z = time * 0.5 + i * 0.1 + (bass * Math.PI); // Spin faster on bass hit

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color gradient moving through tunnel
            const hue = (0.5 + Math.sin(time * 0.1 + i * 0.1) * 0.2) + (bass * 0.2); // Blue/Purple base + Audio shift
            targetColor.setHSL(hue % 1, 0.8, 0.5 + high * 0.5);

            meshRef.current.setColorAt(i, targetColor);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            {/* Main Tunnel Structure */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
                {/* Ring Geometry: Radius 5, Tube 0.2, RadialSegments 8, TubularSegments 50 */}
                <torusGeometry args={[5, 0.1, 8, 50]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                    toneMapped={false}
                    wireframe={true}
                />
            </instancedMesh>

            {/* Central Light that pulses */}
            <pointLight ref={lightRef} position={[0, 0, 0]} distance={20} decay={2} />
        </group>
    );
};
