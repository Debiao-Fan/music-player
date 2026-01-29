import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';
import { parseLrc, type LyricLine } from '../../utils/lrcParser';
import { Save, Play, Square, Hammer } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';

export const LyricEditor = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();

    // Store access
    const lyricEditorState = useAppStore(state => state.lyricEditor);
    const playlist = usePlayerStore(state => state.playlist);
    const currentPlayingTrack = usePlayerStore(state => state.currentTrack);

    // Resolve target track
    const targetTrack = lyricEditorState.trackId
        ? playlist.find(t => t.id === lyricEditorState.trackId)
        : currentPlayingTrack;

    // Is the target track currently playing?
    const isTargetPlaying = currentPlayingTrack?.id === targetTrack?.id;

    const isPlaying = usePlayerStore(state => state.isPlaying);
    const currentTime = usePlayerStore(state => state.currentTime);
    const audioDuration = usePlayerStore(state => state.duration); // This might be for playing track only

    // Actions
    const setTrackLyrics = usePlayerStore(state => state.setTrackLyrics);
    const togglePlay = usePlayerStore(state => state.togglePlay);

    // Local State
    const [rawText, setRawText] = useState('');
    const [syncedLines, setSyncedLines] = useState<LyricLine[]>([]);
    const [isSyncMode, setIsSyncMode] = useState(false);
    const [currentSyncIndex, setCurrentSyncIndex] = useState(0);

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize with existing lyrics if any
    useEffect(() => {
        if (targetTrack?.lyrics) {
            setSyncedLines(targetTrack.lyrics);
            setRawText(targetTrack.lyrics.map(l => l.text).join('\n'));
        } else {
            // Reset if no lyrics
            setSyncedLines([]);
            setRawText('');
        }
    }, [targetTrack]);

    // Parse raw text into lines for syncing (strip timestamps if user pasted LRC)
    const linesToSync = rawText
        .split('\n')
        .map(l => l.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim())
        .filter(l => l);

    // Auto-scroll to current line
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeLine = scrollContainerRef.current.querySelector('[data-active="true"]');
            if (activeLine) {
                // Smooth scroll to center
                activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentSyncIndex]);

    const handleTap = useCallback(() => {
        if (currentSyncIndex >= linesToSync.length) return;

        const newLine: LyricLine = {
            time: currentTime,
            text: linesToSync[currentSyncIndex]
        };

        setSyncedLines(prev => {
            const newLines = [...prev];
            if (currentSyncIndex < newLines.length) {
                newLines[currentSyncIndex] = newLine;
            } else {
                newLines.push(newLine);
            }
            return newLines;
        });

        setCurrentSyncIndex(prev => prev + 1);
    }, [currentTime, currentSyncIndex, linesToSync]);

    // Keyboard shortcut for Tap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isSyncMode) {
                e.preventDefault(); // Prevent scrolling
                handleTap();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSyncMode, handleTap]);

    const handleSave = () => {
        if (targetTrack) {
            // Merge current text with captured timestamps
            // Only include lines that have a valid timestamp
            const finalLyrics: LyricLine[] = linesToSync.map((line, i) => ({
                time: syncedLines[i]?.time ?? -1,
                text: line
            })).filter(l => l.time >= 0);

            setTrackLyrics(targetTrack.id, finalLyrics);
            onClose();
        }
    };

    const handleClearTimestamps = () => {
        if (confirm('Clear all timestamps? This will keep the text.')) {
            setSyncedLines([]);
            setCurrentSyncIndex(0);
        }
    };

    const handleImportLrc = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const parsed = parseLrc(text);
            if (parsed.length > 0) {
                setSyncedLines(parsed);
                setRawText(text);
                alert(t('editor.import.success').replace('lines', parsed.length.toString()));
            } else {
                alert(t('editor.no_lrc'));
            }
        } catch (e) {
            alert(t('editor.clipboard_fail'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-10">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                        <Hammer className="w-5 h-5 text-primary" />
                        {t('editor.title')}
                    </h2>
                    <div className="flex gap-2">
                        <Button onClick={togglePlay}>
                            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? t('editor.pause') : t('editor.play')}
                        </Button>
                        <Button onClick={handleSave} variant="primary">
                            <Save className="w-4 h-4" /> {t('editor.save')}
                        </Button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white px-4">{t('editor.close')}</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Raw Text Input */}
                    <div className="w-1/2 border-r border-white/10 flex flex-col p-4 gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-400">{t('editor.source')}</h3>
                            <div className="flex gap-2">
                                <button onClick={handleClearTimestamps} className="text-xs text-red-400 hover:text-red-300">
                                    {t('editor.clear')}
                                </button>
                                <button onClick={handleImportLrc} className="text-xs text-primary hover:underline">
                                    {t('editor.paste')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
                            placeholder={t('editor.placeholder')}
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                            disabled={isSyncMode}
                            spellCheck={false}
                        />
                    </div>

                    {/* Right: Syncer */}
                    <div className="w-1/2 flex flex-col p-4 bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-400 w-full">{t('editor.preview')}</h3>
                            <button
                                onClick={() => {
                                    if (!isSyncMode) {
                                        setIsSyncMode(true);
                                        // Don't auto-reset if manual selection exists, but for now safe default:
                                        if (currentSyncIndex >= linesToSync.length) setCurrentSyncIndex(0);
                                        if (!isPlaying) togglePlay();
                                    } else {
                                        setIsSyncMode(false);
                                    }
                                }}
                                className={`px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isSyncMode ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary text-black hover:bg-primary-light'}`}
                            >
                                {isSyncMode ? t('editor.recording') : t('editor.start')}
                            </button>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto space-y-2 relative"
                        >
                            {/* Overlay Guideline for "Current" */}
                            <div className="sticky top-1/2 left-0 right-0 h-10 border-y border-white/10 bg-white/5 -translate-y-1/2 pointer-events-none z-0" />

                            <div className="py-[40%] relative z-10">
                                {linesToSync.map((line, i) => {
                                    const isCurrent = i === currentSyncIndex;
                                    const isDone = i < currentSyncIndex;
                                    // Robust check for timestamp existence
                                    const timestamp = syncedLines[i]?.time;
                                    const hasTimestamp = typeof timestamp === 'number' && timestamp >= 0;

                                    return (
                                        <div
                                            key={i}
                                            data-active={isCurrent}
                                            onClick={() => setCurrentSyncIndex(i)} // Manual seek/correct
                                            className={`flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${isCurrent
                                                ? 'bg-primary/20 border-primary/30 scale-105 text-white font-bold ml-4'
                                                : isDone
                                                    ? 'opacity-50 text-gray-400'
                                                    : 'opacity-30 text-gray-600'
                                                }`}
                                        >
                                            <span className={`font-mono text-xs w-14 text-right ${hasTimestamp ? 'text-primary' : 'text-gray-700'}`}>
                                                {hasTimestamp ? formatTime(timestamp) : '--:--'}
                                            </span>
                                            <span className="text-lg truncate">{line}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Button = ({ children, variant = 'secondary', onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${variant === 'primary'
            ? 'bg-primary text-black hover:bg-primary-light'
            : 'bg-white/10 hover:bg-white/20'
            }`}
    >
        {children}
    </button>
);

const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};
