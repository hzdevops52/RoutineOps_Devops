"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSections, createSection } from "@/lib/api";

export function useSections() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["sections"], queryFn: getSections });
  const createM = useMutation({ mutationFn: createSection, onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }) });
  return { list, createM };
}
