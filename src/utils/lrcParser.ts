export interface LyricLine {
    time: number;
    text: string;
}

export const parseLrc = (lrc: string): LyricLine[] => {
    const lines = lrc.split('\n');
    const lyrics: LyricLine[] = [];
    // Match [mm:ss.xx] or [mm:ss.xxx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            // Handle 2 or 3 digit milliseconds
            const msStr = match[3];
            const milliseconds = parseInt(msStr, 10);
            // If 2 digits (e.g. .50), it means 500ms (standard), or 50cs? Typically .xx is centiseconds (1/100).
            // .xxx is milliseconds.
            // .50 -> 0.5s. .500 -> 0.5s.
            const msInSeconds = milliseconds / Math.pow(10, msStr.length);

            const time = minutes * 60 + seconds + msInSeconds;
            const text = line.replace(timeRegex, '').trim();

            // Allow empty lines if they are gaps? Usually we filter empty text unless instrumental
            if (text) {
                lyrics.push({ time, text });
            }
        }
    }
    return lyrics;
};

export const formatLrc = (lyrics: LyricLine[]): string => {
    return lyrics.map(line => {
        const minutes = Math.floor(line.time / 60);
        const seconds = Math.floor(line.time % 60);
        const ms = Math.floor((line.time % 1) * 100);

        const mm = minutes.toString().padStart(2, '0');
        const ss = seconds.toString().padStart(2, '0');
        const xx = ms.toString().padStart(2, '0');

        return `[${mm}:${ss}.${xx}]${line.text}`;
    }).join('\n');
};
