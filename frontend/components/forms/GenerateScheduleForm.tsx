"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function GenerateScheduleForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [year, setYear] = useState("2025-26");
  const [periods, setPeriods] = useState(6);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ year, periodsPerDay: periods, start, end });
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Input label="Academic Year" value={year} onChange={(e) => setYear(e.target.value)} />
      <Input label="Periods per day" type="number" value={String(periods)} onChange={(e) => setPeriods(parseInt(e.target.value || "0"))} />
      <Input label="Term Start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      <Input label="Term End" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      <div className="md:col-span-2">
        <Button type="submit">Generate</Button>
      </div>
    </form>
  );
}
