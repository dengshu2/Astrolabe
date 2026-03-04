import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";

interface ProgressBarProps {
  loaded: number;
  total: number | null;
  className?: string;
}

export function ProgressBar({ loaded, total, className }: ProgressBarProps) {
  const pct = total ? Math.round((loaded / total) * 100) : null;
  const { t } = useLanguage();

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-xs text-(--color-text-muted) mb-1">
        <span>{t.progress.loadingRepos}</span>
        <span>
          {loaded}
          {total ? ` / ${total}` : ""}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-(--color-border-muted) overflow-hidden">
        {pct !== null ? (
          <div
            className="h-full rounded-full bg-(--color-brand) transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-(--color-brand) animate-pulse" />
        )}
      </div>
    </div>
  );
}
