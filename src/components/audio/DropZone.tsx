import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseBlob } from 'music-metadata-browser';
import { usePlayerStore, type Track } from '../../store/usePlayerStore';
import { Upload } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';

// Simple ID generator since we didn't install uuid
const generateId = () => Math.random().toString(36).substring(2, 9);

export const DropZone = ({ children }: { children: React.ReactNode }) => {
    const addTrack = usePlayerStore((state) => state.addTrack);
    const { t } = useTranslation();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        for (const file of acceptedFiles) {
            if (file.type.startsWith('audio/')) {
                try {
                    const metadata = await parseBlob(file);
                    const coverPicture = metadata.common.picture?.[0];
                    let coverUrl = undefined;

                    if (coverPicture) {
                        const blob = new Blob([new Uint8Array(coverPicture.data)], { type: coverPicture.format });
                        coverUrl = URL.createObjectURL(blob);
                    }

                    const track: Track = {
                        id: generateId(),
                        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
                        artist: metadata.common.artist || 'Unknown Artist',
                        album: metadata.common.album || 'Unknown Album',
                        cover: coverUrl,
                        src: URL.createObjectURL(file), // Create object URL for local playback
                        blob: file, // Store actual file for persistence
                        duration: metadata.format.duration || 0,
                        format: metadata.format.container
                    };

                    addTrack(track);

                    // Save to IndexedDB
                    const { db } = await import('../../db');
                    await db.tracks.put(track);
                } catch (error) {
                    console.error('Error parsing audio file:', error);
                    // Fallback if metadata parsing fails
                    const track: Track = {
                        id: generateId(),
                        title: file.name,
                        artist: 'Unknown Artist',
                        src: URL.createObjectURL(file),
                        blob: file,
                        duration: 0,
                    };
                    addTrack(track);

                    const { db } = await import('../../db');
                    await db.tracks.put(track);
                }
            }
        }
    }, [addTrack]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.flac', '.wav', '.ogg', '.m4a']
        },
        noClick: true, // Only drag and drop to avoid interfering with UI clicks
        noKeyboard: true
    });

    return (
        <div {...getRootProps()} className="relative h-full w-full outline-none">
            <input {...getInputProps()} />
            {children}
            {isDragActive && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none border-4 border-primary border-dashed m-4 rounded-3xl animate-pulse">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t('drop.title')}</h2>
                        <p className="text-gray-400">{t('drop.desc')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
