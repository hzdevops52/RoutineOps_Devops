"use client";
import DataTable from "@/components/table/DataTable";
import SectionForm from "@/components/forms/SectionForm";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/lib/types";

export default function SectionsPage() {
  const { list, createM } = useSections();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
        <PageHeader title="Sections">
          <Button onClick={() => setShowForm((v) => !v)}>Add Section</Button>
        </PageHeader>
        {showForm && (
          <div className="rounded-md border bg-white p-4">
            <SectionForm onSubmit={(data) => { createM.mutate(data); setShowForm(false); }} />
          </div>
        )}
        {list.isError && (
          <div className="rounded-md border bg-white p-4">
            <div className="text-sm text-red-600 mb-2">Failed to load sections.</div>
            <div className="text-xs text-gray-600 mb-3">{String((list.error as any)?.message ?? "Unknown error")}</div>
            <Button variant="secondary" onClick={() => list.refetch()}>Retry</Button>
          </div>
        )}
        <DataTable<Section>
          columns={[
            { key: "name", label: "Name" },
            { key: "department", label: "Department" },
            { key: "year", label: "Year" },
          ]}
          rows={list.data ?? []}
          loading={list.isLoading}
          emptyTitle="No sections"
          emptyDescription="Create sections for the selected year."
          renderCell={(item, columnKey) => {
            switch (columnKey) {
              case "name":
                return item.name;
              case "department":
                return item.department;
              case "year":
                return item.year;
              default:
                return null;
            }
          }}
        />
    </div>
  );
}
