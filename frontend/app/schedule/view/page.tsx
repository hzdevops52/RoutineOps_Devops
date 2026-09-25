"use client";
import TeacherTimetable from "@/components/timetable/TeacherTimetable";
import SectionTimetable from "@/components/timetable/SectionTimetable";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ViewSchedulePage() {
  const [tab, setTab] = useState<"section" | "teacher">("section");
  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-semibold">View Schedule</h1>
        <div className="flex gap-2">
          <Button variant={tab === "section" ? "primary" : "secondary"} onClick={() => setTab("section")}>Section View</Button>
          <Button variant={tab === "teacher" ? "primary" : "secondary"} onClick={() => setTab("teacher")}>Teacher View</Button>
        </div>
        <div>
          {tab === "section" ? <SectionTimetable /> : <TeacherTimetable />}
        </div>
    </div>
  );
}
