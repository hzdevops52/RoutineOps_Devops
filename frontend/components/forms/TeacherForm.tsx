"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSubjects } from "@/hooks/useSubjects";
import { useState } from "react";

export default function TeacherForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { list } = useSubjects();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ name, email: email || undefined, department, subjectIds: subjectId ? [subjectId] : [] });
      }}
      className="space-y-4"
    >
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
      <Select
        label="Subject"
        value={subjectId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setSubjectId(e.target.value);
        }}
        required
      >
        <option value="" disabled>Select a subject</option>
        {(list.data ?? []).map((s: any) => (
          <option key={s._id} value={s._id}>
            {s.subjectName} ({s.subjectCode})
          </option>
        ))}
      </Select>
      <Button type="submit">Save</Button>
    </form>
  );
}
