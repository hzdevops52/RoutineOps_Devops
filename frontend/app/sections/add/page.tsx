"use client";
import SectionForm from "@/components/forms/SectionForm";
import { useSections } from "@/hooks/useSections";

export default function AddSectionPage() {
  const { createM } = useSections();
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Add Section</h1>
      <SectionForm onSubmit={(data) => createM.mutate(data)} />
    </div>
  );
}
