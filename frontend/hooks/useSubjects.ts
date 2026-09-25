"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubjects, createSubject } from "@/lib/api";

export function useSubjects() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["subjects"], queryFn: getSubjects });
  const createM = useMutation({ mutationFn: createSubject, onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }) });
  return { list, createM };
}
