"use client";
import { useEffect, useMemo, useState } from "react";
import WeeklyTable from "./WeeklyTable";
import { useSchedule } from "@/hooks/useSchedule";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/ui/Select";
import { DAYS } from "@/lib/helpers";
import { useTeachers } from "@/hooks/useTeachers";

export default function TeacherTimetable() {
  const { list } = useSchedule();
  const { list: teacherList } = useTeachers();
  const [teacherId, setTeacherId] = useState<string>("");
  const sections = list.data?.sections ?? [];
  const periodsPerDay = list.data?.periodsPerDay ?? 6;

  const teacherOptions = useMemo(() => {
    const map = new Map();
    const teachersFromApi = teacherList.data ?? [];
    sections.forEach((sec: any) => {
      DAYS.forEach((day) => {
        const slots = sec.timetable?.[day] ?? [];
        slots.forEach((slot: any) => {
          if (slot?.teacherId) {
            const fallback = teachersFromApi.find((t: any) => String(t._id) === String(slot.teacherId));
            const teacherName = slot.teacherName ?? fallback?.name ?? slot.teacherId;
            if (!map.has(slot.teacherId)) map.set(slot.teacherId, { teacherId: slot.teacherId, teacherName });
          }
        });
      });
    });
    return Array.from(map.values());
  }, [sections, teacherList.data]);

  useEffect(() => {
    if (!teacherOptions.length) {
      setTeacherId("");
      return;
    }
    if (!teacherOptions.find((t) => t.teacherId === teacherId)) {
      setTeacherId(teacherOptions[0].teacherId);
    }
  }, [teacherOptions, teacherId]);

  const tableData = useMemo(() => {
    if (!teacherId) return [];
    return DAYS.map((day) => {
      return Array.from({ length: periodsPerDay }, (_, periodIndex) => {
        const slot = sections
          .map((sec: any) =>
            sec.timetable?.[day]?.[periodIndex]
              ? { ...(sec.timetable[day][periodIndex] as any), sectionName: sec.name }
              : null
          )
          .find((slot: any) => slot?.teacherId === teacherId);
        return {
          subject: slot ? `${slot.subjectName ?? slot.subjectCode ?? ""} (${slot.sectionName})` : "-",
          teacher: slot?.teacherName ?? slot?.teacherId ?? "",
        };
      });
    });
  }, [teacherId, periodsPerDay, sections]);

  if (list.isLoading) return <Loader />;

  if (list.isError)
    return (
      <EmptyState title="Failed to load routine" description={(list.error as any)?.message ?? "Please try again."}>
        <button className="text-sm text-black underline" onClick={() => list.refetch()}>Retry</button>
      </EmptyState>
    );

  if (!sections.length)
    return <EmptyState title="No routine available" description="Generate a routine to view the timetable." />;

  if (!teacherOptions.length)
    return <EmptyState title="No teacher assignments" description="Assign teachers to classes to view their schedules." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select label="Teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          {teacherOptions.map((teacher) => (
            <option key={teacher.teacherId} value={teacher.teacherId}>
              {teacher.teacherName}
            </option>
          ))}
        </Select>
        <div className="text-sm text-gray-600">{list.data?.department} • Year {list.data?.year}</div>
      </div>
      <WeeklyTable data={tableData} periods={periodsPerDay} />
    </div>
  );
}
