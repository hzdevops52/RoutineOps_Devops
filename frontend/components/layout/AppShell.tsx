"use client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-background">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
