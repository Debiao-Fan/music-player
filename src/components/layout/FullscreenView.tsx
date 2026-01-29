import { VisualizerCanvas } from '../visualizer/VisualizerCanvas';
import { LyricsView } from '../lyrics/LyricsView';
import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const FullscreenView = () => {
    const toggleFullscreen = useAppStore(state => state.toggleFullscreen);

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullscreen]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black">
            {/* Visualizer Background */}
            <div className="absolute inset-0 z-0">
                <VisualizerCanvas />
            </div>

            {/* Lyrics Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <LyricsView />
            </div>
        </div>
    );
};
