import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
  as: Tag = "div",
  ...props
}: HTMLAttributes<HTMLDivElement> & { as?: "div" | "section" | "article"; children: ReactNode }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border/70 bg-surface/80 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
        className
      )}
      {...(props as object)}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={cn("text-sm font-medium uppercase tracking-[0.12em] text-text-muted", className)}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}
