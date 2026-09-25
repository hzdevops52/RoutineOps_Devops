"use client";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useTeachers } from "@/hooks/useTeachers";
import { useSchedule } from "@/hooks/useSchedule";
import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

// Simple step-based wizard for department/year routine generation
export default function RoutineWizard() {
  const router = useRouter();
  const { list: teachers } = useTeachers();
  const { generateM } = useSchedule();
  const { toast } = useToast();
  const { isSuccess, isError, error, reset, isPending } = generateM;

  useEffect(() => {
    if (isSuccess) {
      toast("Routine generated successfully");
      router.push("/schedule/view");
      reset();
    }
  }, [isSuccess, reset, toast, router]);

  useEffect(() => {
    if (isError) {
      const err = error as any;
      const message = err?.response?.data?.message || err?.message || "Failed to generate routine";
      toast(message);
      reset();
    }
  }, [isError, error, toast, reset]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState<string>("1");
  const [sectionCount, setSectionCount] = useState<number>(1);

  type SubjectRow = { subjectId: string; name: string; code: string; teacherId: string; teacherName?: string; weekly: number };
  type SectionData = { name: string; subjects: SubjectRow[]; holidays: string[] };
  const [sections, setSections] = useState<SectionData[]>([]);

  // Initialize sections when advancing from step 1
  const initSections = () => {
    const names = Array.from({ length: Math.max(1, sectionCount) }, (_, i) => String.fromCharCode(65 + i));
    setSections(names.map((n) => ({ name: n, subjects: [], holidays: [] })));
  };

  const addSubject = (secIdx: number) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[secIdx] = {
        ...copy[secIdx],
        subjects: [...copy[secIdx].subjects, { subjectId: "", name: "", code: "", teacherId: "", teacherName: "", weekly: 3 }],
      };
      return copy;
    });
  };

  const updateSubject = (secIdx: number, rowIdx: number, patch: Partial<SubjectRow>) => {
    setSections((prev) => {
      const copy = [...prev];
      const rows = copy[secIdx].subjects.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r));
      copy[secIdx] = { ...copy[secIdx], subjects: rows };
      return copy;
    });
  };

  const removeSubject = (secIdx: number, rowIdx: number) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[secIdx] = { ...copy[secIdx], subjects: copy[secIdx].subjects.filter((_, i) => i !== rowIdx) };
      return copy;
    });
  };

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  const toggleHoliday = (secIdx: number, day: string) => {
    setSections((prev) => {
      const copy = [...prev];
      const selected = new Set(copy[secIdx].holidays);
      if (selected.has(day)) {
        selected.delete(day);
      } else {
        selected.add(day);
      }
      copy[secIdx] = { ...copy[secIdx], holidays: Array.from(selected) };
      return copy;
    });
  };

  const canContinueStep1 = department.trim().length > 0 && Number(year) >= 1 && Number(year) <= 4 && sectionCount > 0;
  const teacherOptions = teachers.data ?? [];
  const subjectsQuery = useQuery({
    queryKey: ["subjects", department],
    queryFn: () => getSubjects({ department }),
    enabled: department.trim().length > 0,
  });
  const subjectOptions = subjectsQuery.data ?? [];

  const summary = useMemo(
    () => ({ department, year: Number(year), sections }),
    [department, year, sections]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium text-gray-900">Routine Setup</div>
          <div className="text-sm text-gray-600">Step {step} of 3</div>
        </div>
        {step === 1 && (
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              initSections();
              setStep(2);
            }}
          >
            <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            <Select label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>
            <Input
              label="Number of Sections"
              type="number"
              value={String(sectionCount)}
              onChange={(e) => setSectionCount(Math.max(1, parseInt((e.target as HTMLInputElement).value || "1")))}
              required
            />
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={!canContinueStep1}>Next</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {sections.map((sec, sIdx) => (
              <div key={sIdx} className="rounded-md border bg-white">
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <div className="font-medium">Section {sec.name}</div>
                  <Button variant="secondary" onClick={() => addSubject(sIdx)}>Add Subject</Button>
                </div>
                <div className="p-4 overflow-auto">
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Select holidays (optional)</div>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const disabled = false;
                        return (
                          <label key={d} className="flex items-center gap-2 px-3 py-1 rounded border">
                            <input
                              type="checkbox"
                              checked={sec.holidays.includes(d)}
                              onChange={() => toggleHoliday(sIdx, d)}
                            />
                            <span className="text-sm">{d}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Teacher</th>
                        <th className="text-left p-2">Weekly Classes</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {sec.subjects.length === 0 && (
                        <tr>
                          <td className="p-3 text-gray-500" colSpan={5}>No subjects. Click Add Subject.</td>
                        </tr>
                      )}
                      {sec.subjects.map((row, rIdx) => (
                        <tr key={rIdx} className="border-t">
                          <td className="p-2">
                            <select
                              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                              value={row.subjectId}
                              onChange={(e) => {
                                const sid = e.target.value;
                                const found = subjectOptions.find((s: any) => s._id === sid);
                                updateSubject(sIdx, rIdx, {
                                  subjectId: sid,
                                  name: found?.subjectName || "",
                                  code: found?.subjectCode || "",
                                });
                              }}
                            >
                              <option value="">Select subject</option>
                              {subjectOptions.map((s: any) => (
                                <option key={s._id} value={s._id}>
                                  {s.subjectName} ({s.subjectCode})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                              value={row.teacherId}
                              onChange={(e) => {
                                const tid = e.target.value;
                                const teacher = teacherOptions.find((t: any) => String(t._id ?? t.id) === tid);
                                updateSubject(sIdx, rIdx, { teacherId: tid, teacherName: teacher?.name });
                              }}
                              disabled={!row.subjectId}
                              title={!row.subjectId ? "Select a subject first" : undefined}
                            >
                              <option value="">{row.subjectId ? "Select teacher" : "Select a subject first"}</option>
                              {teacherOptions
                                .filter((t: any) =>
                                  !!row.subjectId &&
                                  Array.isArray(t.subjects) &&
                                  t.subjects.some((s: any) => String(s?._id ?? s) === row.subjectId)
                                )
                                .map((t: any) => (
                                  <option key={t._id ?? t.id ?? t.name} value={t._id ?? t.id}>{t.name}</option>
                                ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" onClick={() => removeSubject(sIdx, rIdx)}>Remove</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={sections.some((s) => s.subjects.length === 0)}>Review</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">Review and generate routine for {summary.department}, Year {summary.year}</div>
            <div className="space-y-3">
              {sections.map((sec, i) => (
                <div key={i} className="rounded-md border bg-white">
                  <div className="px-4 py-2 border-b font-medium">Section {sec.name}</div>
                  <ul className="p-4 space-y-1 text-sm text-gray-700">
                    {sec.subjects.map((subj, j) => (
                      <li key={j} className="flex gap-3 justify-between">
                        <span className="truncate">{subj.name} ({subj.code})</span>
                        <span className="text-gray-500">{subj.weekly}/week</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button
                onClick={() =>
                  generateM.mutate({
                    department,
                    year: Number(year),
                    sections: sections.map((s) => ({
                      name: s.name,
                      holidays: s.holidays,
                      subjects: s.subjects.map((subj) => ({
                        subjectId: subj.subjectId,
                        subjectName: subj.name,
                        subjectCode: subj.code,
                        teacherId: subj.teacherId,
                        teacherName: subj.teacherName,
                        classesPerWeek: subj.weekly,
                      })),
                    })),
                  })
                }
                disabled={isPending}
              >
                {isPending ? "Generating..." : "Generate Routine"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
