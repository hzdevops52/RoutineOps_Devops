"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSchedule, getSchedule } from "@/lib/api";

export function useSchedule() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["schedule"], queryFn: () => getSchedule() });
  const generateM = useMutation({ mutationFn: generateSchedule, onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }) });
  return { list, generateM };
}
