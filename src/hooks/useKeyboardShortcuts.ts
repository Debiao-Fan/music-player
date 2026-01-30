import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export const useKeyboardShortcuts = () => {
    // We access the store via getState() in the event handler to always get fresh values
    // or use actions which usually handle state internally.
    const togglePlay = usePlayerStore(state => state.togglePlay);
    const playNext = usePlayerStore(state => state.playNext);
    const playPrev = usePlayerStore(state => state.playPrev);
    const toggleMute = usePlayerStore(state => state.toggleMute);
    const setVolume = usePlayerStore(state => state.setVolume);
    const setCurrentTime = usePlayerStore(state => state.setCurrentTime);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is on an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            const state = usePlayerStore.getState();

            switch (e.key) {
                case ' ': // Space: Play/Pause
                    e.preventDefault(); // Prevent scrolling
                    togglePlay();
                    break;

                case 'ArrowRight': // Right: Seek +5s or Next Track (Ctrl)
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey) {
                        playNext();
                    } else {
                        // Seek forward 5s
                        const newTime = Math.min(state.duration, state.currentTime + 5);
                        setCurrentTime(newTime);
                    }
                    break;

                case 'ArrowLeft': // Left: Seek -5s or Prev Track (Ctrl)
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey) {
                        // If < 3s in track, go to prev, else restart current
                        if (state.currentTime > 3) {
                            setCurrentTime(0);
                        } else {
                            playPrev();
                        }
                    } else {
                        // Seek backward 5s
                        const newTime = Math.max(0, state.currentTime - 5);
                        setCurrentTime(newTime);
                    }
                    break;

                case 'ArrowUp': // Up: Volume +10%
                    e.preventDefault();
                    setVolume(Math.min(1, state.volume + 0.1));
                    break;

                case 'ArrowDown': // Down: Volume -10%
                    e.preventDefault();
                    setVolume(Math.max(0, state.volume - 0.1));
                    break;

                case 'm':
                case 'M': // M: Toggle Mute
                    toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [togglePlay, playNext, playPrev, toggleMute, setVolume, setCurrentTime]);
};
