"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import WeeklyTable from "./WeeklyTable";
import { useSchedule } from "@/hooks/useSchedule";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/ui/Select";
import { DAYS } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { exportElementToPdf } from "@/lib/pdf";
import { useToast } from "@/hooks/useToast";

export default function SectionTimetable() {
  const { list } = useSchedule();
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sections = list.data?.sections ?? [];
  const periodsPerDay = list.data?.periodsPerDay ?? 6;

  useEffect(() => {
    if (!sections.length) {
      setSelectedSection("");
      return;
    }
    if (!sections.find((sec: any) => sec.name === selectedSection)) {
      setSelectedSection(sections[0].name);
    }
  }, [sections, selectedSection]);

  const currentSection = useMemo(() => {
    return sections.find((sec: any) => sec.name === selectedSection) ?? sections[0];
  }, [sections, selectedSection]);

  const tableData = useMemo(() => {
    if (!currentSection) return [];
    const holidaySet = new Set(currentSection.holidays ?? []);
    return DAYS.map((day) => {
      if (holidaySet.has(day)) {
        return Array.from({ length: periodsPerDay }, () => ({ subject: "Holiday", teacher: "" }));
      }
      const slots = currentSection.timetable?.[day] ?? [];
      return Array.from({ length: periodsPerDay }, (_, periodIndex) => {
        const slot = slots[periodIndex];
        return {
          subject: slot?.subjectName ?? slot?.subjectCode ?? "-",
          teacher: slot?.teacherName ?? slot?.teacherId ?? "",
        };
      });
    });
  }, [currentSection, periodsPerDay]);

  const handleExport = async () => {
    if (!currentSection) return;
    setIsExporting(true);
    try {
      await exportElementToPdf(exportRef.current, {
        filename: `routine-${(list.data?.department ?? "dept").toLowerCase()}-${currentSection.name}.pdf`,
        title: `${list.data?.department ?? "Department"} • Section ${currentSection.name} • Year ${list.data?.year ?? "-"}`,
        landscape: true,
      });
      toast("Schedule exported as PDF");
    } catch (err) {
      console.error(err);
      toast("Failed to export schedule");
    } finally {
      setIsExporting(false);
    }
  };

  if (list.isLoading) {
    return <Loader />;
  }

  if (list.isError) {
    return (
      <EmptyState title="Failed to load routine" description={(list.error as any)?.message ?? "Please try again."}>
        <button className="text-sm text-black underline" onClick={() => list.refetch()}>Retry</button>
      </EmptyState>
    );
  }

  if (!sections.length) {
    return <EmptyState title="No routine available" description="Generate a routine to view the timetable." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Select label="Section" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            {sections.map((sec: any) => (
              <option key={sec.name} value={sec.name}>
                {sec.name}
              </option>
            ))}
          </Select>
          <div className="text-sm text-gray-600">
            {list.data?.department} • Year {list.data?.year} • {periodsPerDay} periods/day
          </div>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
          {isExporting ? "Preparing PDF..." : "Export PDF"}
        </Button>
      </div>
      <div ref={exportRef} className="space-y-4">
        <WeeklyTable data={tableData} periods={periodsPerDay} />
        {(list.data?.unsatisfied ?? []).length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Some subjects still need scheduling:
            <ul className="list-disc pl-5">
              {list.data?.unsatisfied?.map((item: any, idx: number) => (
                <li key={`${item.sectionName}-${item.subjectName}-${idx}`}>
                  {item.sectionName}: {item.subjectName} ({item.remaining} classes left)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
