import { useLanguage } from "@/i18n";
import { daysSince } from "@/lib/utils";

/**
 * Hook that returns a localized timeAgo function
 */
export function useTimeAgo() {
    const { t } = useLanguage();

    return function timeAgo(dateStr: string): string {
        const days = daysSince(dateStr);

        if (days === 0) return t.timeAgo.justNow;
        if (days < 1) {
            const hours = Math.floor(days * 24);
            if (hours < 1) {
                const minutes = Math.floor(days * 24 * 60);
                return `${minutes}${t.timeAgo.minutesAgo}`;
            }
            return `${hours}${t.timeAgo.hoursAgo}`;
        }
        if (days < 30) return `${days}${t.timeAgo.daysAgo}`;
        if (days < 365) return `${Math.floor(days / 30)}${t.timeAgo.monthsAgo}`;
        const years = Math.floor(days / 365);
        return `${years}${t.timeAgo.yearsAgo}`;
    };
}
