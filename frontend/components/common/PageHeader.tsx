"use client";
import { cn } from "@/lib/helpers";

export function PageHeader({
  title,
  children,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
