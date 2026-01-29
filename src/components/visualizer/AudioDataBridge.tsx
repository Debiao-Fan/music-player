import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAudio } from '../../hooks/useAudio';

interface AudioDataBridgeProps {
    onFrame: (data: Uint8Array) => void;
}

export const AudioDataBridge = ({ onFrame }: AudioDataBridgeProps) => {
    const { analyserNodeRef } = useAudio();
    // Reuse the array to avoid garbage collection
    const dataArray = useRef(new Uint8Array(2048)); // Default FFT size usually 2048, buffer is half or full depending on usage. getByteFrequencyData uses binCount (fftSize/2)

    useFrame(() => {
        if (analyserNodeRef.current) {
            // Need to re-init buffer if fftSize changes, but for now assuming constant
            if (dataArray.current.length !== analyserNodeRef.current.frequencyBinCount) {
                dataArray.current = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
            }

            analyserNodeRef.current.getByteFrequencyData(dataArray.current);
            onFrame(dataArray.current);
        }
    });

    return null;
};
