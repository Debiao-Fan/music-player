import { useTranslation } from '../../i18n/translations';
import { useAppStore } from '../../store/useAppStore';
import { useRef, useEffect } from 'react';


export const SettingsModal = () => {
    const { t } = useTranslation();
    const toggleSettingsMenu = useAppStore(state => state.toggleSettingsMenu);
    const isConsoleVisible = useAppStore(state => state.isConsoleVisible);
    const toggleConsole = useAppStore(state => state.toggleConsole);
    const popoverRef = useRef<HTMLDivElement>(null);

    // ... (rest of useEffect)

    return (
        <div
            ref={popoverRef}
            className="fixed bottom-20 left-4 z-[100] w-72 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up origin-bottom-left"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h2 className="text-sm font-bold text-white tracking-wide">{t('menu.settings')}</h2>
            </div>

            {/* Content */}
            <div className="p-2 space-y-1">
                {/* General Section */}
                <div className="p-2">
                    <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left group">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors pl-7">
                            {t('settings.check_updates')}
                        </span>
                        <span className="text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">v1.2.0</span>
                    </button>
                </div>

                <div className="h-px bg-white/5 mx-2" />

                {/* Experimental Features Section */}
                <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        {t('settings.experimental')}
                    </h3>

                    {/* Console Toggle */}
                    <div
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={toggleConsole}
                    >
                        <div>
                            <h4 className="font-medium text-white text-sm group-hover:text-primary transition-colors">{t('settings.console')}</h4>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${isConsoleVisible ? 'bg-primary' : 'bg-white/20'
                            }`}>
                            <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-transform ${isConsoleVisible ? 'left-5' : 'left-0.5'
                                }`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
