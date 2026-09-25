"use client";
import SubjectForm from "@/components/forms/SubjectForm";
import { useSubjects } from "@/hooks/useSubjects";

export default function AddSubjectPage() {
  const { createM } = useSubjects();
  return (
    <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Add Subject</h1>
        <SubjectForm onSubmit={(data) => createM.mutate(data)} />
    </div>
  );
}
