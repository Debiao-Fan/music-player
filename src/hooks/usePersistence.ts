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
                    src: track.blob ? URL.createObjectURL(track.blob) : track.src
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
        if (playlist.length > 0) {
            const timer = setTimeout(async () => {
                // Save all tracks
                try {
                    await db.tracks.bulkPut(playlist);
                    console.log('✅ Playlist saved:', playlist.length, 'tracks');
                } catch (error) {
                    console.error('❌ Failed to save playlist:', error);
                }
            }, 500); // Reduced from 1000ms to 500ms
            return () => clearTimeout(timer);
        }
    }, [playlist]);

    return null;
};
