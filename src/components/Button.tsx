import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-[var(--brand-magenta)] text-white shadow-[0_10px_30px_rgba(211,9,118,0.35)] hover:brightness-110",
    ghost:
      "bg-transparent text-white/80 hover:text-white hover:bg-white/10",
    outline:
      "border border-white/20 text-white/90 hover:border-white/50 hover:bg-white/5",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

