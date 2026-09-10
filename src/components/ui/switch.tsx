import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 data-[on=true]:bg-accent",
        className,
      )}
      data-on={checked}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-fg transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
          checked ? "translate-x-[18px] bg-accent-fg" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export { Switch };
