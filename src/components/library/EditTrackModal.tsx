import { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Music } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';
import { usePlayerStore } from '../../store/usePlayerStore';
import { db } from '../../db';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string | null;
}

export const EditTrackModal = ({ isOpen, onClose, trackId }: EditTrackModalProps) => {
    const { t } = useTranslation();
    const updateTrack = usePlayerStore(state => state.updateTrack);
    const playlist = usePlayerStore(state => state.playlist);

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [cover, setCover] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const track = playlist.find(t => t.id === trackId);

    useEffect(() => {
        if (track && isOpen) {
            setTitle(track.title);
            setArtist(track.artist);
            setAlbum(track.album || '');
            setCover(track.cover);
        }
    }, [track, isOpen]);

    if (!isOpen || !track) return null;

    const handleSave = async () => {
        if (!trackId) return;

        const updates = {
            title,
            artist,
            album,
            cover
        };

        // Update Store
        updateTrack(trackId, updates);

        // Update DB
        try {
            await db.tracks.update(trackId, updates);
        } catch (error) {
            console.error('Failed to update track in DB:', error);
        }

        onClose();
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCover(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit3Icon className="w-5 h-5 text-primary" />
                        {t('edit.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cover Image Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="relative w-32 h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {cover ? (
                                <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Music className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-primary hover:text-primary-light font-bold uppercase tracking-wide"
                        >
                            {t('edit.change_cover')}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleCoverUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('edit.track_title')}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('edit.artist')}</label>
                                <input
                                    type="text"
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('edit.album')}</label>
                                <input
                                    type="text"
                                    value={album}
                                    onChange={(e) => setAlbum(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors"
                    >
                        {t('edit.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-light text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {t('edit.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Start Icon helper
const Edit3Icon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
);
