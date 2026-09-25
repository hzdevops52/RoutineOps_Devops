"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function SectionForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [department, setDepartment] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [year, setYear] = useState("1");

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ department, sectionName, year: Number(year) });
      }}
      className="space-y-4"
    >
      <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
      <Input label="Section name" value={sectionName} onChange={(e) => setSectionName(e.target.value)} required />
      <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
      <Button type="submit">Save</Button>
    </form>
  );
}
