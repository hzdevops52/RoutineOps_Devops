"use client";
import { cn } from "@/lib/helpers";

export function EmptyState({
  title = "No data",
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-md border bg-white py-10", className)}>
      <div className="text-sm font-medium text-gray-900">{title}</div>
      {description && <div className="text-sm text-gray-500">{description}</div>}
      {children}
    </div>
  );
}
