import { useAppStore } from '../store/useAppStore';

type Translations = {
    [key: string]: {
        en: string;
        zh: string;
    };
};

export const translations: Translations = {
    // Menu
    'menu.player': { en: 'Player', zh: '播放器' },
    'menu.library': { en: 'Library', zh: '音乐库' },
    'menu.settings': { en: 'Settings', zh: '设置' },
    'menu.playlists': { en: 'PLAYLISTS', zh: '播放列表' },
    'menu.liked': { en: 'Liked Songs', zh: '我喜欢的音乐' },
    'sidebar.brand': { en: 'HIP-HOP LAB', zh: '说唱实验室' },
    'sidebar.playlist': { en: 'Playlist', zh: '播放列表' },
    'sidebar.no_tracks': { en: 'No tracks yet.\nDrag & drop to upload.', zh: '暂无曲目\n拖放文件上传' },

    // Header
    'header.title': { en: 'The Lab', zh: '实验中心' },

    // Dashboard Cards
    'card.import.title': { en: 'Import Track', zh: '导入音乐' },
    'card.import.desc': { en: 'Drag & Drop MP3, WAV, FLAC', zh: '拖拽 MP3, WAV, FLAC 文件' },
    'card.visuals.title': { en: 'Visuals', zh: '视觉效果' },
    'card.visuals.desc': { en: 'Configure particle effects', zh: '配置粒子特效' },
    'card.lyrics.title': { en: 'Lyrics', zh: '歌词制作' },
    'card.lyrics.desc': { en: 'Tap to sync mode', zh: '点击打点同步' },
    'card.lyrics.open': { en: 'OPEN EDITOR', zh: '打开编辑器' },

    // DropZone
    'drop.title': { en: "Drop it like it's hot", zh: "把你的狠货拖进来" },
    'drop.desc': { en: 'Import your beats and tracks', zh: '导入伴奏和音轨' },

    // Lyric Editor
    'editor.title': { en: 'Lyric Studio', zh: '歌词工作室' },
    'editor.play': { en: 'Play Music', zh: '播放音乐' },
    'editor.pause': { en: 'Pause', zh: '暂停' },
    'editor.save': { en: 'Save', zh: '保存' },
    'editor.close': { en: 'Close', zh: '关闭' },
    'editor.source': { en: 'SOURCE TEXT', zh: '原始文本' },
    'editor.preview': { en: 'SYNC PREVIEW', zh: '同步预览' },
    'editor.paste': { en: 'Paste LRC', zh: '粘贴 LRC' },
    'editor.clear': { en: 'Clear Timestamps', zh: '清除时间戳' },
    'editor.start': { en: 'START SYNC', zh: '开始同步' },
    'editor.recording': { en: 'RECORDING (Tap Space)', zh: '录制中 (按空格打点)' },
    'editor.placeholder': { en: 'Paste lyrics here (one line per bar)...', zh: '在这里粘贴歌词 (一行一个 Bar)...' },
    'editor.import.success': { en: 'Imported lines from clipboard!', zh: '成功从剪贴板导入歌词！' },
    'editor.no_lrc': { en: 'No valid LRC found in clipboard', zh: '剪贴板中没有有效的 LRC 内容' },
    'editor.clipboard_fail': { en: 'Clipboard access failed', zh: '无法访问剪贴板' },

    // PlayerBar
    'player.visualizer': { en: 'Visualizer', zh: '可视化' },
    'player.no_track': { en: 'No Track Selected', zh: '未选择任何曲目' },
    'player.select_beat': { en: 'Select a beat to start', zh: '选择一个伴奏开始 Drop' },

    // Lyrics View
    'lyrics.none': { en: 'No Lyrics', zh: '暂无歌词' },

    // Leva / Visualizer Controls
    'leva.lab': { en: 'The Lab', zh: '实验控制台' },
    'leva.filter': { en: 'Filter...', zh: '搜索配置...' },
    'leva.mode': { en: 'Mode', zh: '视觉模式' },
    'leva.mode.classic': { en: 'Classic Bars', zh: '经典频谱' },
    'leva.mode.bass': { en: 'Bass Pulse', zh: '低音律动' },
    'leva.effects': { en: 'Effects', zh: '视觉特效' },
    'leva.bloom_int': { en: 'Bloom Intensity', zh: '辉光强度' },
    'leva.bloom_lum': { en: 'Bloom Luminance', zh: '辉光阈值' },
    'leva.chopped': { en: 'Chopped & Screwed', zh: '黑胶变速 (C&S)' },
    'leva.speed': { en: 'Speed', zh: '播放速度' },
    'leva.pitch_preserve': { en: 'Preserve Pitch', zh: '保持音调' },
    'leva.eq': { en: 'Equalizer (10-Band)', zh: '均衡器 (10 段)' },
    'leva.eq.preset_flat': { en: 'Flat', zh: '平坦' },
    'leva.eq.preset_hiphop': { en: 'Hip-Hop Boost', zh: 'Hip-Hop 增强' },
    'leva.eq.preset_bass': { en: 'Bass Boost', zh: '低音增强' },
    'leva.eq.preset_vocal': { en: 'Vocal Enhance', zh: '人声增强' },
    'leva.stars_count': { en: 'Stars Count', zh: '星星数量' },
    'leva.stars_depth': { en: 'Stars Depth', zh: '星空深度' },
    'leva.stars_fade': { en: 'Stars Fade', zh: '星星淡出' },
    'leva.mode.image': { en: 'Image Background', zh: '图片背景' },
    'leva.bg_blur': { en: 'Background Blur', zh: '背景模糊' },
    'leva.upload_bg': { en: 'Upload Image', zh: '上传图片' },
    'leva.save_to_track': { en: 'Save to This Track', zh: '保存到该曲目' },

    // Player
    'player.fullscreen': { en: 'Fullscreen Mode', zh: '全屏模式' },

    // Settings
    'settings.experimental': { en: 'Experimental Features', zh: '实验性功能' },
    'settings.console': { en: 'Developer Console', zh: '实验控制台' },
    'settings.close_console': { en: 'Close Console', zh: '关闭控制台' },
    'settings.console_desc': { en: 'Enable Leva controls for visual debugging', zh: '启用 Leva 控件进行视觉调试' },
    'settings.general': { en: 'General', zh: '常规' },
    'settings.check_updates': { en: 'Check for Updates', zh: '检查更新' },

    // Confirmation Modal
    'confirm_delete': { en: 'Delete', zh: '删除' },
    'confirm.cancel': { en: 'Cancel', zh: '取消' },
    'confirm.delete_title': { en: 'Delete Track', zh: '删除曲目' },
    'confirm.delete_desc': { en: 'Are you sure you want to delete this track? This action cannot be undone.', zh: '您确定要删除此曲目吗？此操作无法撤销。' },

    // Library
    'library.tracks': { en: 'TRACKS', zh: '首曲目' },
};

export const useTranslation = () => {
    const language = useAppStore((state) => state.language);

    const t = (key: string) => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[language] || entry['en'];
    };

    return { t, language };
};
