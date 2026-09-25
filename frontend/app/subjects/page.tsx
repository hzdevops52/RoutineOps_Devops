"use client";
import DataTable from "@/components/table/DataTable";
import SubjectForm from "@/components/forms/SubjectForm";
import { useSubjects } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const { list, createM } = useSubjects();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
        <PageHeader title="Subjects">
          <Button onClick={() => setShowForm((v) => !v)}>Add Subject</Button>
        </PageHeader>
        {showForm && (
          <div className="rounded-md border bg-white p-4">
            <SubjectForm onSubmit={(data) => { createM.mutate(data); setShowForm(false); }} />
          </div>
        )}
        {list.isError && (
          <div className="rounded-md border bg-white p-4">
            <div className="text-sm text-red-600 mb-2">Failed to load subjects.</div>
            <div className="text-xs text-gray-600 mb-3">{String((list.error as any)?.message ?? "Unknown error")}</div>
            <Button variant="secondary" onClick={() => list.refetch()}>Retry</Button>
          </div>
        )}
        <DataTable<Subject>
          columns={[
            { key: "subjectName", label: "Name" },
            { key: "subjectCode", label: "Code" },
            { key: "department", label: "Department" },
          ]}
          rows={list.data ?? []}
          loading={list.isLoading}
          emptyTitle="No subjects"
          emptyDescription="Create your first subject to get started."
          renderCell={(item, columnKey) => {
            switch (columnKey) {
              case "subjectName":
                return item.subjectName;
              case "subjectCode":
                return item.subjectCode;
              case "department":
                return item.department;
              default:
                return null;
            }
          }}
        />
    </div>
  );
}
