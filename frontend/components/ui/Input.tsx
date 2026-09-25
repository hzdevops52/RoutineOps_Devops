"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/helpers";

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, ...rest }, ref
) {
  return (
    <label className="w-full space-y-1 block">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input
        ref={ref}
        className={cn(
          "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black",
          className
        )}
        {...rest}
      />
    </label>
  );
});
