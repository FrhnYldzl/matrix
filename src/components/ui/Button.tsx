import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ion text-void hover:shadow-[0_0_20px_rgba(77,184,255,0.5)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-elevated text-text border border-border hover:border-border-strong hover:bg-raised",
        ghost: "text-text-muted hover:text-text hover:bg-elevated",
        danger:
          "bg-crimson/20 text-crimson border border-crimson/30 hover:bg-crimson/30 hover:shadow-[0_0_20px_rgba(255,90,111,0.35)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref
) {
  return <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />;
});
