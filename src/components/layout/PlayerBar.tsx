import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Repeat, Repeat1, Shuffle, Mic2, Disc } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';

// Helper to format bitrate
const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return '';
    return `${Math.round(bitrate / 1000)}kbps`;
};

// Helper to cleanup codec string
const formatCodec = (codec?: string) => {
    if (!codec) return '';
    return codec.replace('MPEG 1 Layer 3', 'MP3').replace('MPEG-4 AAC', 'AAC');
};

const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const PlayerBar = () => {
    const { t } = useTranslation();
    const {
        isPlaying,
        currentTrack,
        togglePlay,
        playNext,
        playPrev,
        volume,
        setVolume,
        currentTime,
        duration,
        setCurrentTime,
        isMuted,
        toggleMute,
        repeatMode,
        toggleRepeat
    } = usePlayerStore();

    const toggleFullscreen = useAppStore((state) => state.toggleFullscreen);
    const openLyricEditor = useAppStore((state) => state.openLyricEditor);

    // Calculate progress percentage
    const progress = duration ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setCurrentTime(percent * duration);
    };

    return (
        <div className="h-24 bg-white/[0.08] backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between z-50 relative">
            {/* Track Info */}
            <div className="flex items-center gap-5 w-1/3">
                <div className="relative w-16 h-16 group">
                    <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                    <div className={`relative w-full h-full bg-neutral-900 rounded-full overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                        {currentTrack?.cover ? (
                            <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                <Disc className="w-8 h-8 text-neutral-600" />
                            </div>
                        )}
                        {/* Vinyl center hole */}
                        <div className="absolute w-4 h-4 bg-black rounded-full border border-white/10" />
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="font-bold text-white text-base truncate hover:text-primary transition-colors cursor-default">
                        {currentTrack?.title || t('player.no_track')}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium tracking-wide">
                        <span className="uppercase truncate max-w-[120px]">{currentTrack?.artist || t('player.select_beat')}</span>
                        {(currentTrack?.format || currentTrack?.bitrate) && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-primary/80 border border-white/5 uppercase">
                                    {formatCodec(currentTrack.format)} {formatBitrate(currentTrack.bitrate)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="flex items-center gap-8 translate-x-3"> {/* Offset slightly to center visually without Shuffle */}
                    <button
                        onClick={playPrev}
                        className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
                        title={t('player.prev')}
                    >
                        <SkipBack className="w-6 h-6" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        title={isPlaying ? t('player.pause') : t('player.play')}
                    >
                        <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-full opacity-100" />
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-white relative z-10 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 text-white relative z-10 fill-current ml-1" />
                        )}
                    </button>
                    <button
                        onClick={playNext}
                        className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
                        title={t('player.next')}
                    >
                        <SkipForward className="w-6 h-6" />
                    </button>
                    <button
                        onClick={toggleRepeat}
                        className={`transition-colors hover:scale-110 active:scale-95 ${repeatMode === 'one' || repeatMode === 'shuffle' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                        title={t('player.loop')}
                    >
                        {repeatMode === 'one' && <Repeat1 className="w-4 h-4" />}
                        {repeatMode === 'shuffle' && <Shuffle className="w-4 h-4" />}
                        {repeatMode === 'all' && <Repeat className="w-4 h-4" />}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-lg flex items-center gap-3 text-[10px] font-mono font-medium text-gray-500">
                    <span className="w-8 text-right">{formatTime(currentTime)}</span>
                    <div
                        className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer group relative"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <span className="w-8">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end gap-5 w-1/3">
                <button
                    onClick={() => currentTrack && openLyricEditor(currentTrack.id)}
                    className={`hover:bg-white/5 p-2 rounded-lg transition-all ${currentTrack ? 'text-gray-500 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
                    title={t('card.lyrics.title')}
                    disabled={!currentTrack}
                >
                    <Mic2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 w-32 group">
                    <button onClick={toggleMute} className="focus:outline-none">
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        )}
                    </button>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                setVolume(parseFloat(e.target.value));
                                if (isMuted) toggleMute();
                            }}
                            className="w-full h-full opacity-0 absolute cursor-pointer z-10"
                            title={t('player.volume')}
                        />
                        <div
                            className={`h-full transition-colors ${isMuted ? 'bg-gray-700' : 'bg-gray-500 group-hover:bg-white'}`}
                            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <button
                    onClick={toggleFullscreen}
                    className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all active:scale-95"
                    title={t('player.fullscreen')}
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
