"use client";
import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, label, children, ...rest }, ref
) {
  return (
    <label className="w-full space-y-1 block">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <select
        ref={ref}
        className={cn(
          "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black",
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
});
