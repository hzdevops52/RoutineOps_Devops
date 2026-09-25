"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axiosInstance";

export default function DiagnosticsPage() {
  const health = useQuery({ queryKey: ["health"], queryFn: async () => (await axios.get("/health")).data });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Diagnostics</h1>
      <div className="rounded-md border bg-white p-4">
        <div className="text-sm font-medium mb-2">Backend Health</div>
        {health.isLoading && <div className="text-sm text-gray-600">Checking...</div>}
        {health.isError && <div className="text-sm text-red-600">Failed to reach backend.</div>}
        {health.data && (
          <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">{JSON.stringify(health.data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
