import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] text-white",
  secondary:
    "bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] border border-[var(--color-border)]",
  danger:
    "bg-transparent hover:bg-red-500/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30",
  ghost:
    "bg-transparent hover:bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]",
};

const sizes = {
  sm: "px-2.5 py-1 text-xs rounded-md",
  md: "px-3.5 py-1.5 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
