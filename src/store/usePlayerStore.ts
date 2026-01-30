import { create } from 'zustand';
import type { LyricLine } from '../utils/lrcParser';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album?: string;
    cover?: string;
    src: string; // Blob URL (ephemeral, regenerated on load)
    blob?: Blob; // Actual file for persistence
    coverBlob?: Blob; // Cover image blob for persistence
    file?: File; // Original file object (ephemeral)
    duration: number;
    format?: string;
    bitrate?: number; // bps
    lyrics?: LyricLine[];

    // Per-track configuration (optional, falls back to global defaults)
    backgroundImage?: string;        // This track's custom background
    visualizerMode?: string;         // This track's preferred visualizer mode
    customEQ?: number[];             // This track's custom EQ settings (10 bands)
}

interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    playbackRate: number;
    preservesPitch: boolean;
    repeatMode: 'all' | 'shuffle' | 'one';
    eqGains: number[]; // 10-band EQ gains in dB (-12 to +12)
    currentTime: number;
    duration: number;
    currentTrack: Track | null;
    playlist: Track[];

    // Actions
    togglePlay: () => void;
    toggleMute: () => void;
    toggleRepeat: () => void;
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    setPreservesPitch: (preserves: boolean) => void;
    setEqGains: (gains: number[]) => void;
    setCurrentTrack: (track: Track) => void;
    setPlaylist: (tracks: Track[]) => void;
    addTrack: (track: Track) => void;
    removeTrack: (id: string) => void;
    playNext: () => void;
    playPrev: () => void;
    setTrackLyrics: (trackId: string, lyrics: LyricLine[]) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    updateTrack: (id: string, updates: Partial<Track>) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    isPlaying: false,
    isMuted: false,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    preservesPitch: true, // Default to normal correction. For C&S/Vinyl feel, set to false.
    repeatMode: 'all',
    eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10-band EQ, all flat
    currentTrack: null,
    playlist: [],

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    toggleRepeat: () => set((state) => {
        const modes: ('all' | 'shuffle' | 'one')[] = ['all', 'shuffle', 'one'];
        const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
    }),
    setVolume: (volume) => set({ volume }),
    setPlaybackRate: (rate) => set({ playbackRate: rate }),
    setPreservesPitch: (preserves) => set({ preservesPitch: preserves }),
    setEqGains: (gains) => set({ eqGains: gains }),
    setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
    setPlaylist: (tracks) => set({ playlist: tracks }),

    addTrack: (track) => set((state) => ({
        playlist: [...state.playlist, track],
        // If no track is playing, auto-play the new one
        currentTrack: state.currentTrack ? state.currentTrack : track,
        isPlaying: state.currentTrack ? state.isPlaying : true
    })),

    removeTrack: (id) => set((state) => {
        const newPlaylist = state.playlist.filter(t => t.id !== id);
        // If removing current track, play next or stop
        let newCurrentTrack = state.currentTrack;
        let newIsPlaying = state.isPlaying;

        if (state.currentTrack?.id === id) {
            if (newPlaylist.length > 0) {
                newCurrentTrack = newPlaylist[0];
            } else {
                newCurrentTrack = null;
                newIsPlaying = false;
            }
        }

        return {
            playlist: newPlaylist,
            currentTrack: newCurrentTrack,
            isPlaying: newIsPlaying
        };
    }),

    playNext: () => {
        const state = get();
        if (!state.currentTrack || state.playlist.length === 0) return;

        // Start from beginning if repeat one
        if (state.repeatMode === 'one') {
            set({ currentTime: 0, isPlaying: true });
            return;
        }

        if (state.repeatMode === 'shuffle') {
            let nextIndex = Math.floor(Math.random() * state.playlist.length);
            // Avoid repeating same track if possible
            if (state.playlist.length > 1 && state.playlist[nextIndex].id === state.currentTrack.id) {
                nextIndex = (nextIndex + 1) % state.playlist.length;
            }
            set({ currentTrack: state.playlist[nextIndex], isPlaying: true });
            return;
        }

        const currentIndex = state.playlist.findIndex(t => t.id === state.currentTrack?.id);
        // Default to 'all' loop behavior for standard playNext if not one/shuffle
        const nextIndex = (currentIndex + 1) % state.playlist.length;
        set({ currentTrack: state.playlist[nextIndex], isPlaying: true });
    },

    playPrev: () => {
        const state = get();
        if (!state.currentTrack || state.playlist.length === 0) return;
        const currentIndex = state.playlist.findIndex(t => t.id === state.currentTrack?.id);
        const prevIndex = (currentIndex - 1 + state.playlist.length) % state.playlist.length;
        set({ currentTrack: state.playlist[prevIndex], isPlaying: true });
    },

    setTrackLyrics: (trackId, lyrics) => {
        set(state => {
            const updatedPlaylist = state.playlist.map(t =>
                t.id === trackId ? { ...t, lyrics } : t
            );
            const updatedCurrentTrack = state.currentTrack?.id === trackId
                ? { ...state.currentTrack, lyrics }
                : state.currentTrack;

            return {
                playlist: updatedPlaylist,
                currentTrack: updatedCurrentTrack
            };
        });
    },

    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    updateTrack: (id, updates) => set((state) => {
        const updatedPlaylist = state.playlist.map((t) =>
            t.id === id ? { ...t, ...updates } : t
        );
        const updatedCurrentTrack =
            state.currentTrack?.id === id
                ? { ...state.currentTrack, ...updates }
                : state.currentTrack;

        return {
            playlist: updatedPlaylist,
            currentTrack: updatedCurrentTrack,
        };
    }),
}));
