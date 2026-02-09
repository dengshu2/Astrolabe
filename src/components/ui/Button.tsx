import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] text-white shadow-md shadow-blue-500/20",
  secondary:
    "bg-white hover:bg-gray-50 text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm",
  danger:
    "bg-red-50 hover:bg-red-100 text-[var(--color-danger)] border border-red-200",
  ghost:
    "bg-transparent hover:bg-gray-100 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-full",
  md: "px-4 py-2 text-sm rounded-full",
  lg: "px-6 py-3 text-base rounded-full",
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
        "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
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
