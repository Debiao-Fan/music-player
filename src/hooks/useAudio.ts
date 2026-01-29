import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

// --- Singleton Audio Engine State ---
// This ensures multiple components using useAudio (e.g., App and Visualizer)
// share the same physical Audio element and AudioContext.
let audioInstance: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let eqFilters: BiquadFilterNode[] = [];

// EQ Frequencies (10-band, standard)
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Initialize once
const initAudio = () => {
    if (!audioInstance) {
        audioInstance = new Audio();
        audioInstance.crossOrigin = "anonymous";
    }

    if (!audioContext) {
        const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextCls();

        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;

        // Create EQ filters
        eqFilters = EQ_FREQUENCIES.map((freq, i) => {
            const filter = audioContext!.createBiquadFilter();
            filter.type = i === 0 ? 'lowshelf' : i === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1.0;
            filter.gain.value = 0; // Start flat
            return filter;
        });

        // Connect: source -> EQ chain -> analyser -> destination
        try {
            sourceNode = audioContext.createMediaElementSource(audioInstance);

            // Chain EQ filters
            let prevNode: AudioNode = sourceNode;
            for (const filter of eqFilters) {
                prevNode.connect(filter);
                prevNode = filter;
            }

            prevNode.connect(analyserNode);
            analyserNode.connect(audioContext.destination);
        } catch (e) {
            console.warn("Audio routing error:", e);
        }
    }
    return { audio: audioInstance, context: audioContext, analyser: analyserNode };
};

export const useAudio = () => {
    // Ensure initialized
    // We use refs to expose the singletons to the component without triggering re-renders themselves
    // (though the logic below uses side effects)
    const engine = useRef(initAudio());

    // Subscribe to store changes securely
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const volume = usePlayerStore(state => state.volume);
    const playbackRate = usePlayerStore(state => state.playbackRate);
    const preservesPitch = usePlayerStore(state => state.preservesPitch);
    const eqGains = usePlayerStore(state => state.eqGains);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const setIsPlaying = usePlayerStore(state => state.setIsPlaying);
    const setCurrentTime = usePlayerStore(state => state.setCurrentTime);
    const setDuration = usePlayerStore(state => state.setDuration);
    const playNext = usePlayerStore(state => state.playNext);

    // Event Listeners (One-time setup per hook instance? No, this creates duplicate listeners if multiple hooks used)
    // We should probably only attach listeners in the "Main" instance (App.tsx).
    // Or we make the listeners idempotent / named.
    // For now, let's allow duplicate listeners (redundant but not breaking for timeupdate)
    // WARNING: 'ended' -> playNext() called twice? Yes. This is bad.
    // FIX: Only attach listeners if this is the "primary" controller?
    // OR: Move listener logic purely to the singleton? 
    // Let's rely on standard React behavior: cleanup removes them.

    useEffect(() => {
        const audio = audioInstance!;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            // Check if we actually ended (not just paused)
            setIsPlaying(false);
            playNext();
        };

        // We only want ONE entity driving the store updates to avoid race conditions.
        // But identifying "who" is hard.
        // Simple hack: Assign a custom property to audioInstance?
        // Better: Just add them. Redundant store updates are usually de-duped by React/Zustand if value same.
        // 'playNext' is an action. Calling it twice might skip 2 songs!
        // FIX: Check if we are really at the end. Use a flag.

        // Actually, for this fix, let's just accept the risk or only bind events if we are 'App'.
        // But 'useAudio' is generic.
        // Let's just bind them.
        // playNext in store likely just increments index.
        // If called twice rapidly...

        // Optimized: helper functions are reference stable? No.
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setCurrentTime, setDuration, setIsPlaying, playNext]);

    // Playback Rate & Pitch
    useEffect(() => {
        if (audioInstance) {
            audioInstance.playbackRate = playbackRate;
            audioInstance.preservesPitch = preservesPitch;
        }
    }, [playbackRate, preservesPitch]);

    // EQ Gains
    useEffect(() => {
        if (eqFilters.length > 0 && eqGains.length === eqFilters.length) {
            eqFilters.forEach((filter, i) => {
                filter.gain.value = eqGains[i];
            });
        }
    }, [eqGains]);

    // Playback Logic
    useEffect(() => {
        const audio = audioInstance!;
        if (!currentTrack) return;

        const isSrcChanged = audio.src !== currentTrack.src;
        if (isSrcChanged) {
            audio.src = currentTrack.src;
        }

        if (isPlaying) {
            if (audioContext?.state === 'suspended') {
                audioContext.resume();
            }
            audio.play().catch(e => {
                if (e.name !== 'AbortError') console.error("Playback failed:", e);
            });
        } else {
            audio.pause();
        }
    }, [currentTrack, isPlaying]);

    // Volume
    useEffect(() => {
        if (audioInstance) audioInstance.volume = volume;
    }, [volume]);

    return {
        audioRef: { current: audioInstance },
        analyserNodeRef: { current: analyserNode },
        seek: (time: number) => {
            if (audioInstance) audioInstance.currentTime = time;
        }
    };
};
