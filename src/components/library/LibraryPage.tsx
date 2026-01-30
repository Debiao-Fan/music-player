import { useRef, useState, useMemo } from 'react';
import { Upload, Music, Trash2, Edit3, Mic2, Plus, Search, ChevronDown, ListFilter } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';
import type { Track } from '../../store/usePlayerStore';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EditTrackModal } from './EditTrackModal';
import { parseBlob } from 'music-metadata-browser';

type SortOption = 'date' | 'title' | 'artist';

export const LibraryPage = () => {
    const { t } = useTranslation();
    const playlist = usePlayerStore(state => state.playlist);
    const addTrack = usePlayerStore(state => state.addTrack);
    const removeTrack = usePlayerStore(state => state.removeTrack);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const setCurrentTrack = usePlayerStore(state => state.setCurrentTrack);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for search and sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    // Local state for delete confirmation
    const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
    const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

    // Filter and Sort Logic
    const filteredPlaylist = useMemo(() => {
        let result = [...playlist];

        // Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(track =>
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.album?.toLowerCase().includes(query)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'artist':
                    return a.artist.localeCompare(b.artist);
                case 'date':
                default:
                    // Assuming newer tracks are added to the end of the playlist array naturally
                    // To sort by "date added", we can use index or assuming ID creation time if we had it.
                    // Since we don't have explicit dateAdded field, we'll reverse index order for "Newest"
                    // But playlist is already in added order. Let's just reverse it for "Newest first" display?
                    // Actually, let's keep it simple: default order is Oldest -> Newest.
                    // If 'date', let's reverse to show Newest first as that is usually preferred.
                    return playlist.indexOf(b) - playlist.indexOf(a);
            }
        });

        return result;
    }, [playlist, searchQuery, sortBy]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // 1. Extract Metadata using music-metadata-browser
            const metadata = await parseBlob(file);
            const { common, format } = metadata;

            // 2. Handle Cover Art
            let coverUrl = undefined;
            let coverBlob = undefined;
            if (common.picture && common.picture.length > 0) {
                const picture = common.picture[0];
                // Convert Buffer to Uint8Array for Blob compatibility
                const data = new Uint8Array(picture.data);
                coverBlob = new Blob([data], { type: picture.format });
                coverUrl = URL.createObjectURL(coverBlob);
            }

            // 3. Fallback for duration if metadata fails (optional, but good for robustness)
            // If format.duration is available, use it. Otherwise decode.
            let duration = format.duration || 0;
            if (!duration) {
                const arrayBuffer = await file.arrayBuffer();
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                duration = audioBuffer.duration;
            }

            const newTrack: Track = {
                id: crypto.randomUUID(),
                title: common.title || file.name.replace(/\.[^/.]+$/, ""),
                artist: common.artist || 'Unknown Artist',
                album: common.album,
                cover: coverUrl,
                coverBlob: coverBlob,
                duration: duration,
                format: format.codec || file.type,
                bitrate: format.bitrate,
                file: file,
                src: URL.createObjectURL(file)
            };

            addTrack(newTrack);
        } catch (error) {
            console.error('Error loading file:', error);
            // Fallback to basic load if metadata parsing fails
            try {
                const arrayBuffer = await file.arrayBuffer();
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                addTrack({
                    id: crypto.randomUUID(),
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    artist: 'Unknown Artist',
                    duration: audioBuffer.duration,
                    file: file,
                    src: URL.createObjectURL(file)
                });
            } catch (fallbackError) {
                console.error('Critical error loading file:', fallbackError);
            }
        }
    };

    const handleDeleteConfirm = () => {
        if (trackToDelete) {
            removeTrack(trackToDelete);
            setTrackToDelete(null);
        }
    };

    return (
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-gradient-to-br from-black via-[#121212] to-[#0a0a0a]">
            {/* Header */}
            <div className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-30 gap-6">
                <div className="flex flex-col min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Music className="w-6 h-6 text-primary" />
                        </div>
                        {t('menu.library')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 ml-14 font-medium tracking-wider uppercase opacity-60">
                        {playlist.length} {t('library.tracks')}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 sm:text-sm transition-all"
                            placeholder={t('library.search_placeholder')}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all hover:border-white/20"
                        >
                            <ListFilter className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {sortBy === 'date' && t('library.sort.date_added')}
                                {sortBy === 'title' && t('library.sort.title')}
                                {sortBy === 'artist' && t('library.sort.artist')}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>

                        {isSortMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl py-1 z-20 backdrop-blur-xl">
                                    <button
                                        onClick={() => { setSortBy('date'); setIsSortMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${sortBy === 'date' ? 'text-primary font-bold' : 'text-gray-400'}`}
                                    >
                                        {t('library.sort.date_added')}
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('title'); setIsSortMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${sortBy === 'title' ? 'text-primary font-bold' : 'text-gray-400'}`}
                                    >
                                        {t('library.sort.title')}
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('artist'); setIsSortMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${sortBy === 'artist' ? 'text-primary font-bold' : 'text-gray-400'}`}
                                    >
                                        {t('library.sort.artist')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Import Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-light transition-all text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 ml-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden lg:inline">{t('card.import.title')}</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="audio/*"
                        className="hidden"
                    />
                </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-2">
                    {playlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm group hover:border-primary/20 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <div className="p-6 bg-white/5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-12 h-12 text-gray-600 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-300 mb-2">{t('sidebar.no_tracks')}</h3>
                            <p className="text-gray-500 text-sm mb-6">{t('card.import.desc')}</p>
                            <button
                                className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium transition-all text-gray-400 group-hover:text-white"
                            >
                                {t('card.import.title')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3 pb-20">
                            {/* Header Row */}
                            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-6 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10">
                                <div className="w-8 text-center">#</div>
                                <div>{t('library.header.title')}</div>
                                <div>{t('library.header.artist')}</div>
                                <div className="text-right pr-4">{t('library.header.actions')}</div>
                            </div>

                            {/* Tracks */}
                            {filteredPlaylist.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    No tracks found matching "{searchQuery}"
                                </div>
                            ) : (
                                filteredPlaylist.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className={`group grid grid-cols-[auto_1fr_1fr_auto] gap-6 px-6 py-4 rounded-xl items-center transition-all duration-300 border backdrop-blur-sm
                                            ${currentTrack?.id === track.id
                                                ? 'bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className="w-8 text-center text-gray-500 font-mono text-sm">
                                            {currentTrack?.id === track.id ? (
                                                <div className="w-4 h-4 mx-auto flex items-end justify-center gap-0.5">
                                                    <div className="w-1 h-3 bg-primary animate-[bounce_1s_infinite]" />
                                                    <div className="w-1 h-2 bg-primary animate-[bounce_1.2s_infinite]" />
                                                    <div className="w-1 h-4 bg-primary animate-[bounce_0.8s_infinite]" />
                                                </div>
                                            ) : (
                                                <span className="opacity-50 group-hover:opacity-100 transition-opacity">{(index + 1).toString().padStart(2, '0')}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0" onClick={() => setCurrentTrack(track)}>
                                            <div className={`font-bold text-base truncate cursor-pointer transition-colors ${currentTrack?.id === track.id ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>
                                                {track.title}
                                            </div>
                                        </div>

                                        <div className="text-gray-500 text-sm font-medium truncate group-hover:text-gray-400 transition-colors">
                                            {track.artist}
                                        </div>

                                        <div className="flex items-center gap-3 justify-end opacity-60 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-primary hover:text-white text-gray-400 text-xs font-bold tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 border border-white/5 hover:border-transparent group/btn"
                                                title={t('card.lyrics.title')}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    useAppStore.getState().openLyricEditor(track.id);
                                                }}
                                            >
                                                <Mic2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                                <span className="hidden sm:inline">{t('card.lyrics.title')}</span>
                                            </button>

                                            <div className="w-px h-4 bg-white/10 mx-1" />

                                            <button
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTrackId(track.id);
                                                }}
                                                title="Edit Info"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>

                                            <button
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTrackToDelete(track.id);
                                                }}
                                                title="Remove Track"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!trackToDelete}
                title={t('confirm.delete_title')}
                message={t('confirm.delete_desc')}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setTrackToDelete(null)}
            />

            {/* Edit Track Modal */}
            <EditTrackModal
                isOpen={!!editingTrackId}
                trackId={editingTrackId}
                onClose={() => setEditingTrackId(null)}
            />
        </div>
    );
};
