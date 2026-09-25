"use client";
import { cn } from "@/lib/helpers";

export const Card = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-white shadow-sm", className)} {...rest} />
);
export const CardHeader = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 py-3 border-b font-medium", className)} {...rest} />
);
export const CardBody = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...rest} />
);
