import Dexie, { type Table } from 'dexie';
import type { Track } from './store/usePlayerStore';

// We extend the Track interface for DB storage if needed, 
// but Dexie can store structured objects directly.
// Note: Blobs (src) are supported by IndexedDB.

export interface UserSettings {
    id?: number; // Singleton, usually id=1
    language: 'zh' | 'en';
    volume: number;
    playbackRate: number;
    preservesPitch: boolean;
    eqGains: number[]; // Global default EQ

    // Global defaults (used when track has no custom settings)
    defaultBackgroundImage?: string;
    defaultVisualizerMode?: string;
}

export class HipHopDB extends Dexie {
    tracks!: Table<Track, string>; // id is string (UUID)
    settings!: Table<UserSettings, number>;

    constructor() {
        super('HipHopLabDB');
        // Version 1: Original schema
        this.version(1).stores({
            tracks: 'id, title, artist, album',
            settings: '++id'
        });
        // Version 2: Added per-track config (backgroundImage, visualizerMode, customEQ)
        // and global defaults (defaultBackgroundImage, defaultVisualizerMode)
        this.version(2).stores({
            tracks: 'id, title, artist, album', // Schema unchanged, but Track interface extended
            settings: '++id'
        });
    }
}

export const db = new HipHopDB();
