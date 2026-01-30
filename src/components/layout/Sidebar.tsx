import { Settings, ListMusic, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../../i18n/translations';

import { useAppStore } from '../../store/useAppStore';

const NavItem = ({ icon: Icon, label, active = false, onClick, id, className }: { icon: any, label: string, active?: boolean, onClick?: () => void, id?: string, className?: string }) => (
    <button
        id={id}
        onClick={onClick}
        className={cn(
            "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
            active
                ? "text-primary bg-surface-light border-l-2 border-primary"
                : "text-gray-400 hover:text-white hover:bg-white/5",
            className
        )}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

export const Sidebar = () => {
    const { t } = useTranslation();

    // Global Navigation State
    const activeMenu = useAppStore(state => state.activeMenu);
    const setActiveMenu = useAppStore(state => state.setActiveMenu);

    const isSettingsMenuOpen = useAppStore(state => state.isSettingsMenuOpen);
    const toggleSettingsMenu = useAppStore(state => state.toggleSettingsMenu);

    return (
        <aside className="w-64 h-full bg-surface border-r border-white/5 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    {t('sidebar.brand')}
                </h1>
            </div>

            <nav className="px-3 space-y-1">
                <NavItem
                    icon={Play}
                    label={t('menu.player')}
                    active={activeMenu === 'player'}
                    onClick={() => {
                        setActiveMenu('player');
                        if (isSettingsMenuOpen) toggleSettingsMenu();
                    }}
                />
                <NavItem
                    icon={ListMusic}
                    label={t('menu.library')}
                    active={activeMenu === 'library'}
                    onClick={() => {
                        setActiveMenu('library');
                        if (isSettingsMenuOpen) toggleSettingsMenu();
                    }}
                />
            </nav>



            {/* Settings Area - Visually separated */}
            <div className="p-4 mt-auto">
                <NavItem
                    id="settings-trigger-btn"
                    icon={Settings}
                    label={t('menu.settings')}
                    active={isSettingsMenuOpen}
                    onClick={toggleSettingsMenu}
                    className={isSettingsMenuOpen ? "text-white hover:text-primary transition-colors border-l-0" : "hover:text-white transition-colors"}
                />
            </div>
        </aside>
    );
};
