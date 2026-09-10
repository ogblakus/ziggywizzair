import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      suppressHydrationWarning
      className={cn(
        "h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
