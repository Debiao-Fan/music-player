import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { db } from '../db';

export const usePersistence = () => {
    // App Store
    const setLanguage = useAppStore(state => state.setLanguage);
    const language = useAppStore(state => state.language);

    // Player Store
    const setVolume = usePlayerStore(state => state.setVolume);
    const setPlaybackRate = usePlayerStore(state => state.setPlaybackRate);
    const setPreservesPitch = usePlayerStore(state => state.setPreservesPitch);
    const setEqGains = usePlayerStore(state => state.setEqGains);
    const setPlaylist = usePlayerStore(state => state.setPlaylist);

    const volume = usePlayerStore(state => state.volume);
    const playbackRate = usePlayerStore(state => state.playbackRate);
    const preservesPitch = usePlayerStore(state => state.preservesPitch);
    const eqGains = usePlayerStore(state => state.eqGains);
    const playlist = usePlayerStore(state => state.playlist);

    // Load on Mount
    useEffect(() => {
        const load = async () => {
            // Load Settings
            const settings = await db.settings.get(1);
            if (settings) {
                setLanguage(settings.language);
                setVolume(settings.volume);
                setPlaybackRate(settings.playbackRate);
                setPreservesPitch(settings.preservesPitch);
                if (settings.eqGains && settings.eqGains.length === 10) {
                    setEqGains(settings.eqGains);
                }
            }

            // Load Library
            const tracks = await db.tracks.toArray();
            if (tracks.length > 0) {
                // Recreate blob URLs from stored blobs
                const tracksWithUrls = tracks.map(track => ({
                    ...track,
                    src: track.blob ? URL.createObjectURL(track.blob) : track.src,
                    cover: track.coverBlob ? URL.createObjectURL(track.coverBlob) : track.cover
                }));
                setPlaylist(tracksWithUrls);
            }
        };
        load();
    }, [setLanguage, setVolume, setPlaybackRate, setPreservesPitch, setEqGains, setPlaylist]);

    // Save Settings on Change
    useEffect(() => {
        db.settings.put({
            id: 1,
            language,
            volume,
            playbackRate,
            preservesPitch,
            eqGains
        });
    }, [language, volume, playbackRate, preservesPitch, eqGains]);

    // Save Playlist on Change (with shorter debounce)
    useEffect(() => {
        // We always run this sync, even if playlist is empty, 
        // because an empty playlist means we might have deleted the last track.
        const timer = setTimeout(async () => {
            try {
                // 1. Get all IDs currently in the Store
                const currentIds = new Set(playlist.map(t => t.id));

                // 2. Get all IDs currently in the DB
                const dbTracks = await db.tracks.toArray();
                const dbIds = dbTracks.map(t => t.id);

                // 3. Find IDs that are in DB but NOT in Store (these should be deleted)
                const idsToDelete = dbIds.filter(id => !currentIds.has(id));

                // 4. Perform Deletion
                if (idsToDelete.length > 0) {
                    await db.tracks.bulkDelete(idsToDelete);
                    console.log('🗑️ Deleted tracks from DB:', idsToDelete.length);
                }

                // 5. Perform Upsert (Add/Update)
                if (playlist.length > 0) {
                    await db.tracks.bulkPut(playlist);
                    console.log('✅ Playlist saved/updated:', playlist.length, 'tracks');
                }
            } catch (error) {
                console.error('❌ Failed to sync playlist:', error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [playlist]);

    return null;
};
