import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    language: 'zh' | 'en';
    toggleLanguage: () => void;
    setLanguage: (lang: 'zh' | 'en') => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    isSettingsMenuOpen: boolean;
    toggleSettingsMenu: () => void;
    isConsoleVisible: boolean;
    toggleConsole: () => void;
    activeMenu: 'player' | 'library';
    setActiveMenu: (menu: 'player' | 'library') => void;

    // Lyric Editor State
    lyricEditor: {
        isOpen: boolean;
        trackId: string | null; // null means editing current track (or none if strictly enforced)
    };
    openLyricEditor: (trackId?: string) => void;
    closeLyricEditor: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: 'zh', // Default to Chinese
            toggleLanguage: () => set((state) => ({ language: state.language === 'zh' ? 'en' : 'zh' })),
            setLanguage: (lang) => set({ language: lang }),
            isFullscreen: false,
            toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
            isSettingsMenuOpen: false,
            toggleSettingsMenu: () => set((state) => ({ isSettingsMenuOpen: !state.isSettingsMenuOpen })),
            isConsoleVisible: false,
            toggleConsole: () => set((state) => ({ isConsoleVisible: !state.isConsoleVisible })),
            activeMenu: 'player',
            setActiveMenu: (menu) => set({ activeMenu: menu }),

            lyricEditor: { isOpen: false, trackId: null },
            openLyricEditor: (trackId = null) => set({ lyricEditor: { isOpen: true, trackId } }),
            closeLyricEditor: () => set({ lyricEditor: { isOpen: false, trackId: null } }),
        }),
        {
            name: 'app-storage',
        }
    )
);
