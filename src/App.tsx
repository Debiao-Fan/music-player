import { Sidebar } from './components/layout/Sidebar';
import { PlayerBar } from './components/layout/PlayerBar';
import { FullscreenView } from './components/layout/FullscreenView';
import { SettingsModal } from './components/layout/SettingsModal';
import { DropZone } from './components/audio/DropZone';
import { useAudio } from './hooks/useAudio';
import { useState, useEffect } from 'react';
import { VisualizerCanvas } from './components/visualizer/VisualizerCanvas';
import { LyricEditor } from './components/lyrics/LyricEditor';
import { LyricsView } from './components/lyrics/LyricsView';
import { LibraryPage } from './components/library/LibraryPage';

import { useAppStore } from './store/useAppStore';
import { useTranslation } from './i18n/translations';
import { Globe, X } from 'lucide-react';
import { Leva, useControls, button } from 'leva';
import { usePlayerStore } from './store/usePlayerStore';
import { usePersistence } from './hooks/usePersistence';

function App() {
  // Initialize Persistence Layer
  usePersistence();

  // Initialize Audio Engine
  useAudio();

  // Fullscreen state
  const isFullscreen = useAppStore(state => state.isFullscreen);
  const toggleFullscreen = useAppStore(state => state.toggleFullscreen);
  const isConsoleVisible = useAppStore(state => state.isConsoleVisible);
  const isSettingsMenuOpen = useAppStore(state => state.isSettingsMenuOpen);
  const activeMenu = useAppStore(state => state.activeMenu);

  // ESC key handler for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  const { t, language } = useTranslation();
  const toggleLanguage = useAppStore(state => state.toggleLanguage);

  // Audio Store State & Actions
  const playbackRate = usePlayerStore(state => state.playbackRate);
  const preservesPitch = usePlayerStore(state => state.preservesPitch);
  const eqGains = usePlayerStore(state => state.eqGains);
  const setPlaybackRate = usePlayerStore(state => state.setPlaybackRate);
  const setPreservesPitch = usePlayerStore(state => state.setPreservesPitch);
  const setEqGains = usePlayerStore(state => state.setEqGains);

  // EQ Presets
  const EQ_PRESETS = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hiphop: [6, 4, 2, 1, 0, -1, 0, 1, 3, 5], // Boost bass and highs
    bass: [8, 6, 3, 0, -2, -3, -2, 0, 0, 0], // Heavy bass boost
    vocal: [-2, -1, 0, 2, 4, 4, 3, 1, -1, -2], // Mid boost for vocals
  };

  // Chopped & Screwed Controls
  useControls(t('leva.chopped'), {
    speed: {
      label: t('leva.speed'),
      value: playbackRate,
      min: 0.5,
      max: 1.5,
      step: 0.05,
      onChange: (v) => setPlaybackRate(v)
    },
    pitch: {
      label: t('leva.pitch_preserve'),
      value: preservesPitch,
      onChange: (v) => setPreservesPitch(v)
    },
    'C&S Mode': button(() => {
      setPlaybackRate(0.85);
      setPreservesPitch(false);
    }),
    'Normal Mode': button(() => {
      setPlaybackRate(1.0);
      setPreservesPitch(true);
    })
  }, [t, playbackRate, preservesPitch]); // Dependencies ensure UI updates when store changes

  // Equalizer Controls - Using onEditEnd to avoid infinite loop
  useControls(t('leva.eq'), {
    '32Hz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[0] = v;
        setEqGains(newGains);
      }
    },
    '64Hz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[1] = v;
        setEqGains(newGains);
      }
    },
    '125Hz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[2] = v;
        setEqGains(newGains);
      }
    },
    '250Hz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[3] = v;
        setEqGains(newGains);
      }
    },
    '500Hz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[4] = v;
        setEqGains(newGains);
      }
    },
    '1kHz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[5] = v;
        setEqGains(newGains);
      }
    },
    '2kHz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[6] = v;
        setEqGains(newGains);
      }
    },
    '4kHz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[7] = v;
        setEqGains(newGains);
      }
    },
    '8kHz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[8] = v;
        setEqGains(newGains);
      }
    },
    '16kHz': {
      value: 0, min: -12, max: 12, step: 0.5, onEditEnd: (v) => {
        const newGains = [...eqGains];
        newGains[9] = v;
        setEqGains(newGains);
      }
    },
    [t('leva.eq.preset_flat')]: button(() => setEqGains(EQ_PRESETS.flat)),
    [t('leva.eq.preset_hiphop')]: button(() => setEqGains(EQ_PRESETS.hiphop)),
    [t('leva.eq.preset_bass')]: button(() => setEqGains(EQ_PRESETS.bass)),
    [t('leva.eq.preset_vocal')]: button(() => setEqGains(EQ_PRESETS.vocal)),
  }, [t]);

  return (
    <div className="flex h-screen w-full text-white overflow-hidden font-sans selection:bg-primary selection:text-white relative bg-black">
      {/* Fullscreen Overlay */}
      {isFullscreen && <FullscreenView />}

      {/* Settings Modal */}
      {isSettingsMenuOpen && <SettingsModal />}

      <div className={`fixed top-4 right-4 z-[5000] w-80 transition-transform duration-300 ${!isConsoleVisible || isFullscreen ? 'translate-x-[120%]' : 'translate-x-0'
        }`}>
        <div className="relative">
          {/* Custom Close Button for Console */}
          <button
            onClick={() => useAppStore.getState().toggleConsole()}
            className="absolute -left-10 top-0 p-2 bg-surface border border-white/10 text-gray-400 hover:text-white rounded-l-lg shadow-lg backdrop-blur-md transition-colors"
            title={t('settings.close_console')}
          >
            <div className="rotate-0 hover:rotate-90 transition-transform">
              <X className="w-5 h-5" />
            </div>
          </button>
          <Leva
            fill
            titleBar={{ filter: false, title: t('leva.lab'), drag: false }}
            flat={true}
            theme={{
              sizes: { rootWidth: '100%' },
            }}
          />
        </div>
      </div>
      {/* Global Drag & Drop Zone Wrapper */}
      <DropZone>
        {activeMenu === 'player' && (
          <>
            {/* 3D Visualizer Background */}
            <VisualizerCanvas key={language} />

            {/* Lyrics Overlay - Full Screen on top of Visualizer */}
            <LyricsView />
          </>
        )}

        {/* Flex Container for Layout */}
        <div className="flex h-full w-full relative z-10 pointer-events-none">
          {/* Sidebar */}
          <div className="pointer-events-auto h-full">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative overflow-hidden pointer-events-auto">
            <div className="h-16 border-b border-white/5 flex items-center px-6 justify-end bg-[#0a0a0a]/80 backdrop-blur-xl z-20">
              <div className="flex items-center gap-4">
                {/* Segmented Language Control */}
                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                  <button
                    onClick={() => language !== 'en' && toggleLanguage()}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${language === 'en'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => language !== 'zh' && toggleLanguage()}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${language === 'zh'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    中文
                  </button>
                </div>

                <div className="w-8 h-8 rounded-full bg-surface-light border border-white/10" />
              </div>
            </div>


            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
              {activeMenu === 'player' ? (
                <div className="p-6">
                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* Dashboard Widgets */}
                    <div className="max-w-4xl mx-auto space-y-8">
                      {/* Dashboard Widgets */}
                      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-pulse">
                          {t('sidebar.brand')}
                        </div>
                        <p className="text-gray-500 text-sm">{t('player.select_beat')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <LibraryPage />
              )}
            </div>
            {/* Lyric Editor Modal */}
            {useAppStore(state => state.lyricEditor).isOpen && (
              <LyricEditor onClose={() => useAppStore.getState().closeLyricEditor()} />
            )}

            {/* Player Bar */}
            <div className="pointer-events-auto">
              <PlayerBar />
            </div>
          </main>
        </div>
      </DropZone>
    </div>
  );
}

export default App;
