import { useEffect, useState, useMemo } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTranslation } from '../../i18n/translations';

interface LyricPosition {
    x: number; // percentage
    y: number; // percentage
    rotation: number; // degrees
    animation: 'fadeSlideUp' | 'fadeSlideDown' | 'fadeSlideLeft' | 'fadeSlideRight' | 'zoomBounce' | 'rotateIn';
}

const getRandomAnimation = (): LyricPosition['animation'] => {
    const animations: LyricPosition['animation'][] = ['fadeSlideUp', 'fadeSlideDown', 'fadeSlideLeft', 'fadeSlideRight', 'zoomBounce', 'rotateIn'];
    return animations[Math.floor(Math.random() * animations.length)];
};

const getRandomPosition = (): LyricPosition => {
    return {
        x: 20 + Math.random() * 60, // 20-80% (more centered to avoid edges)
        y: 20 + Math.random() * 60, // 20-80% (more centered to avoid edges)
        rotation: -3 + Math.random() * 6, // -3 to 3 degrees (reduced rotation)
        animation: getRandomAnimation()
    };
};

export const LyricsView = () => {
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const currentTime = usePlayerStore(state => state.currentTime);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { t } = useTranslation();

    const lyrics = currentTrack?.lyrics || [];

    // Generate random positions for each lyric line (memoized)
    const lyricPositions = useMemo(() => {
        return lyrics.map(() => getRandomPosition());
    }, [lyrics.length]);

    // Find active line
    useEffect(() => {
        if (!lyrics.length) return;

        let index = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (lyrics[i].time <= currentTime) {
                index = i;
            } else {
                break;
            }
        }

        setActiveIndex(index);
    }, [currentTime, lyrics]);

    if (!lyrics.length) {
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse text-2xl">
                    {t('lyrics.none')}
                </p>
            </div>
        );
    }

    const currentLine = activeIndex >= 0 ? lyrics[activeIndex] : null;
    const position = activeIndex >= 0 ? lyricPositions[activeIndex] : null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Current Line - Random Position with Dynamic Animation */}
            {currentLine && position && (
                <div
                    key={activeIndex}
                    className={`absolute pointer-events-auto cursor-pointer animate-${position.animation}`}
                    style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                        maxWidth: '80vw', // Prevent overflow
                    }}
                    onClick={() => {
                        usePlayerStore.getState().setCurrentTime(currentLine.time);
                    }}
                >
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 blur-2xl bg-primary opacity-30 scale-150 group-hover:opacity-50 transition-opacity"></div>

                        {/* Text */}
                        <p className="relative text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl leading-tight hover:scale-110 transition-transform duration-300 text-center break-words"
                            style={{
                                textShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.5), 0 4px 8px rgba(0,0,0,0.5)',
                                WebkitTextStroke: '1px rgba(139, 92, 246, 0.3)',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                        >
                            {currentLine.text}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
