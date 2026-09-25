"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/lib/api";

export function useTeachers() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["teachers"], queryFn: getTeachers });
  const createM = useMutation({ mutationFn: createTeacher, onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }) });
  const updateM = useMutation({ mutationFn: ({ id, payload }: any) => updateTeacher(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }) });
  const deleteM = useMutation({ mutationFn: (id: string) => deleteTeacher(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }) });
  return { list, createM, updateM, deleteM };
}
