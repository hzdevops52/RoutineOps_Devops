"use client";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/helpers";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
  href?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", href, children, ...rest }, ref
) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href as any} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  );
});
