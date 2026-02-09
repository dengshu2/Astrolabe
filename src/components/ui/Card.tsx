import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export function Card({ className, children, noPadding = false, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                "bg-[var(--color-surface)]",
                "rounded-[var(--radius-card)]",
                "shadow-[var(--shadow-card)]",
                "border border-[var(--color-border)]",
                "transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]",
                !noPadding && "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
