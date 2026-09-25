"use client";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
export default function DataTable<T>({
  columns,
  rows,
  renderCell,
  loading,
  emptyTitle = "No data",
  emptyDescription,
}: {
  columns: { key: string; label: string }[];
  rows: T[];
  renderCell: (item: T, columnKey: string) => React.ReactNode;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-auto rounded-md border bg-white table-sticky">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left font-medium text-gray-700 p-2 border-b">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="p-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-[90%]" />
                  <Skeleton className="h-8 w-[80%]" />
                </div>
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td className="p-0" colSpan={columns.length}>
                <EmptyState title={emptyTitle} description={emptyDescription} className="border-0" />
              </td>
            </tr>
          )}
          {rows.map((r: any, idx) => (
            <tr key={r.id ?? idx} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="p-2 align-top">
                  {renderCell(r, c.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
