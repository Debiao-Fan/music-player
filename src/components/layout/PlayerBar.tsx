import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, Disc, Maximize } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTranslation } from '../../i18n/translations';
import { useAudio } from '../../hooks/useAudio';
import { useAppStore } from '../../store/useAppStore';

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerBar = () => {
    const { isPlaying, togglePlay, volume, setVolume, currentTrack, currentTime, duration, playNext, playPrev } = usePlayerStore();
    const { t } = useTranslation();
    const { seek } = useAudio();
    const { toggleFullscreen } = useAppStore();

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        seek(newTime);
    };

    return (
        <div className="h-24 bg-surface border-t border-white/5 px-6 flex items-center justify-between z-50 relative">
            {/* Track Info */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="w-14 h-14 bg-neutral-800 rounded-md overflow-hidden flex items-center justify-center">
                    {currentTrack?.cover ? (
                        <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <Disc className="w-6 h-6 text-neutral-600" />
                    )}
                </div>
                <div>
                    <h4 className="font-medium text-white truncate">{currentTrack?.title || t('player.no_track')}</h4>
                    <p className="text-sm text-gray-400 truncate">{currentTrack?.artist || t('player.select_beat')}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={playPrev}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>
                    <button
                        onClick={playNext}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Repeat className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <div
                        className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden cursor-pointer group"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-white group-hover:bg-primary transition-colors relative"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end gap-3 w-1/3">
                <button className="text-gray-400 hover:text-white">
                    <Mic2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 w-24">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="text-gray-400 hover:text-white transition-colors"
                    title={t('player.fullscreen')}
                >
                    <Maximize className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
