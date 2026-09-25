"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function SubjectForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [department, setDepartment] = useState("");

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ subjectName, subjectCode, department });
      }}
      className="space-y-4"
    >
      <Input label="Subject Name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
      <Input label="Subject Code" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required />
      <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
      <Button type="submit" variant="primary">Save</Button>
    </form>
  );
}
