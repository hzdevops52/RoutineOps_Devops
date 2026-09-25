"use client";
import { DAYS, range } from "@/lib/helpers";

type Cell = {
  subject?: string;
  teacher?: string;
  room?: string;
};

export default function WeeklyTable({ periods = 6, data }: { periods?: number; data: Cell[][] }) {
  return (
    <div className="overflow-auto border rounded-md bg-white">
      <table className="min-w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="p-2 text-left">Day</th>
            {range(periods).map((p) => (
              <th key={p} className="p-2 text-left">P{p + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((d, i) => (
            <tr key={d} className="border-t">
              <td className="p-2 font-medium sticky left-0 bg-white">{d}</td>
              {range(periods).map((p) => {
                const c = data?.[i]?.[p];
                return (
                  <td key={p} className="p-2 align-top">
                    <div className="text-sm font-medium">{c?.subject ?? "-"}</div>
                    <div className="text-xs text-gray-500">{c?.teacher ?? ""}</div>
                    {c?.room && <div className="text-xs text-gray-400">Rm {c.room}</div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
