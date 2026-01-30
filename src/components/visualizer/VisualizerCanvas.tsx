import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useMemo, useState } from 'react';
import { AudioDataBridge } from './AudioDataBridge';
import { ClassicBars } from './scenes/ClassicBars';
import { BassPulse } from './scenes/BassPulse';
import { CircularTunnel } from './scenes/CircularTunnel';
import { folder, useControls } from 'leva';
import { useTranslation } from '../../i18n/translations';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';

export const VisualizerCanvas = () => {
    // We keep audio data in a ref so we don't re-render the whole Canvas tree on every frame
    const audioDataRef = useRef<Uint8Array>(new Uint8Array(0));
    const { t } = useTranslation();
    const isFullscreen = useAppStore(state => state.isFullscreen);

    // Get current track and global settings
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const eqGains = usePlayerStore(state => state.eqGains);
    const setEqGains = usePlayerStore(state => state.setEqGains);

    // Load global defaults from localStorage (will be moved to DB later)
    const [globalDefaults, setGlobalDefaults] = useState({
        backgroundImage: localStorage.getItem('global-default-bg-image'),
        visualizerMode: localStorage.getItem('global-default-mode') || 'Classic Bars'
    });

    const handleFrame = (data: Uint8Array) => {
        audioDataRef.current = data;
    };

    // Determine effective settings (track-specific or global default)
    const effectiveBackgroundImage = currentTrack?.backgroundImage || globalDefaults.backgroundImage;
    const effectiveMode = currentTrack?.visualizerMode || globalDefaults.visualizerMode;
    const effectiveEQ = currentTrack?.customEQ || eqGains;

    // Memoize options to prevent identity mismatch in Leva
    const modeOptions = useMemo(() => ({
        [t('leva.mode.classic')]: 'Classic Bars',
        [t('leva.mode.bass')]: 'Bass Pulse',
        [t('leva.mode.tunnel')]: 'Neon Tunnel',
        [t('leva.mode.image')]: 'Image Background'
    }), [t]);

    // Leva controls with translations
    const controls: any = useControls(t('leva.lab'), {
        mode: {
            label: t('leva.mode'),
            options: modeOptions,
            value: effectiveMode
        },
        [t('leva.effects')]: folder({
            bloomIntensity: {
                label: t('leva.bloom_int'),
                value: 1.5,
                min: 0,
                max: 5,
                step: 0.1
            },
            bloomLuminance: {
                label: t('leva.bloom_lum'),
                value: 0.4,
                min: 0,
                max: 1,
                step: 0.01
            },
            starsCount: {
                label: t('leva.stars_count'),
                value: 5000,
                min: 1000,
                max: 20000,
                step: 500
            },
            starsDepth: {
                label: t('leva.stars_depth'),
                value: 50,
                min: 20,
                max: 100,
                step: 5
            },
            starsFade: {
                label: t('leva.stars_fade'),
                value: true
            },
            bgBlur: {
                label: t('leva.bg_blur'),
                value: 10,
                min: 0,
                max: 50,
                step: 1
            }
        })
    });

    const mode = controls.mode;
    const effectsFolder = controls[t('leva.effects')];
    const bloomIntensity = effectsFolder?.bloomIntensity ?? 1.5;
    const bloomLuminance = effectsFolder?.bloomLuminance ?? 0.4;
    const starsCount = effectsFolder?.starsCount ?? 5000;
    const starsDepth = effectsFolder?.starsDepth ?? 50;
    const starsFade = effectsFolder?.starsFade ?? true;
    const bgBlur = effectsFolder?.bgBlur ?? 10;

    // Handle background image upload - saves to current track
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/') && currentTrack) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;

                // Update current track with new background
                const updatedTrack = { ...currentTrack, backgroundImage: dataUrl };

                // Save to database
                const { db } = await import('../../db');
                await db.tracks.update(currentTrack.id, { backgroundImage: dataUrl });

                // Update store
                usePlayerStore.getState().setCurrentTrack(updatedTrack);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save current settings to track
    const saveToCurrentTrack = async () => {
        if (!currentTrack) return;

        const { db } = await import('../../db');
        await db.tracks.update(currentTrack.id, {
            visualizerMode: mode,
            customEQ: effectiveEQ
        });

        // Update store
        const updatedTrack = {
            ...currentTrack,
            visualizerMode: mode,
            customEQ: [...effectiveEQ]
        };
        usePlayerStore.getState().setCurrentTrack(updatedTrack);
    };

    return (
        <div className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-auto">
            {/* Save Settings Button - Top Right */}
            {currentTrack && !isFullscreen && (
                <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                    <button
                        onClick={saveToCurrentTrack}
                        className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {t('leva.save_to_track')}
                    </button>
                </div>
            )}

            {/* Image Background Mode - Upload Button */}
            {mode === 'Image Background' && !isFullscreen && (
                <div className="absolute top-4 left-4 z-50 pointer-events-auto">
                    <label className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg cursor-pointer transition-colors text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('leva.upload_bg')}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            )}

            {/* Image Background Display */}
            {mode === 'Image Background' && effectiveBackgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${effectiveBackgroundImage})`,
                        filter: `blur(${bgBlur}px)`,
                        transform: 'scale(1.1)' // Prevent blur edge artifacts
                    }}
                />
            )}


            {mode !== 'Image Background' && (
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 10, 30]} fov={50} />
                    <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} />

                    {/* Environment */}
                    <color attach="background" args={['#050505']} />
                    <fog attach="fog" args={['#050505', 10, 50]} />
                    <Stars radius={100} depth={starsDepth} count={starsCount} factor={4} saturation={0} fade={starsFade} speed={1} />

                    {/* Lights */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
                    <pointLight position={[-10, 10, -10]} intensity={1} color="#10b981" />

                    {/* Audio Bridge (Invisible) */}
                    <AudioDataBridge onFrame={handleFrame} />

                    {/* Visualizer Scenes */}
                    {mode === 'Classic Bars' && <ClassicBars audioData={audioDataRef.current} />}
                    {mode === 'Bass Pulse' && <BassPulse audioData={audioDataRef.current} />}
                    {mode === 'Neon Tunnel' && <CircularTunnel audioData={audioDataRef.current} />}

                    {/* Post Processing */}
                    <EffectComposer disableNormalPass>
                        <Bloom luminanceThreshold={bloomLuminance} intensity={bloomIntensity} />
                    </EffectComposer>
                </Canvas>
            )}
        </div>
    );
};
