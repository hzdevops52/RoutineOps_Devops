"use client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-14 border-b bg-white flex items-center px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="md:hidden h-9 w-9 p-0"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </Button>
        <div className="font-medium">Department Routine Generator</div>
      </div>
    </header>
  );
}
