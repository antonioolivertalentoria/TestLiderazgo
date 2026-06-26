import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-glass bg-glass p-6 shadow-[0_20px_60px_rgba(9,12,20,0.45)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
