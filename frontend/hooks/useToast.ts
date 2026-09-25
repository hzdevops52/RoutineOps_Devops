"use client";
import { useCallback } from "react";

export function useToast() {
  const toast = useCallback((msg: string) => {
    // Placeholder: integrate any toast lib
    if (typeof window !== "undefined") alert(msg);
  }, []);
  return { toast };
}
