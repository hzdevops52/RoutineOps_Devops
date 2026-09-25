"use client";
import DataTable from "@/components/table/DataTable";
import { ActionButtons } from "@/components/table/ActionButtons";
import TeacherForm from "@/components/forms/TeacherForm";
import { useTeachers } from "@/hooks/useTeachers";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Teacher, Subject } from "@/lib/types";

const renderSubjectList = (subjects: Subject[]) =>
  subjects.length > 0 ? subjects.map((s) => `${s.subjectName} (${s.subjectCode})`).join(", ") : "—";

export default function TeachersPage() {
  const { list, createM, deleteM } = useTeachers();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader title="Teachers">
        <Button onClick={() => setShowForm((v) => !v)}>Add Teacher</Button>
      </PageHeader>
      {showForm && (
        <div className="rounded-md border bg-white p-4">
          <TeacherForm
            onSubmit={(data) => {
              createM.mutate(data);
              setShowForm(false);
            }}
          />
        </div>
      )}
      {list.isError && (
        <div className="rounded-md border bg-white p-4">
          <div className="text-sm text-red-600 mb-2">Failed to load teachers.</div>
          <div className="text-xs text-gray-600 mb-3">{String((list.error as any)?.message ?? "Unknown error")}</div>
          <Button variant="secondary" onClick={() => list.refetch()}>Retry</Button>
        </div>
      )}
      <DataTable<Teacher>
        columns={[
          { key: "name", label: "Name" },
          { key: "teachable", label: "Teachable Subjects" },
          { key: "assigned", label: "Assigned Subjects" },
          { key: "actions", label: "Actions" },
        ]}
        rows={list.data ?? []}
        loading={list.isLoading}
        emptyTitle="No teachers"
        emptyDescription="Create a teacher to start assigning subjects."
        renderCell={(item, columnKey) => {
          switch (columnKey) {
            case "name":
              return item.name;
            case "teachable":
              return renderSubjectList(item.subjects);
            case "assigned":
              return renderSubjectList(item.assignedSubjects);
            case "actions":
              return <ActionButtons onDelete={() => deleteM.mutate(item._id)} />;
            default:
              return null;
          }
        }}
      />
    </div>
  );
}
