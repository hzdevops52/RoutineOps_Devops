"use client";
import TeacherForm from "@/components/forms/TeacherForm";
import { useTeachers } from "@/hooks/useTeachers";

export default function AddTeacherPage() {
  const { createM } = useTeachers();
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Add Teacher</h1>
      <TeacherForm onSubmit={(data) => createM.mutate(data)} />
    </div>
  );
}
