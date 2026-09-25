"use client";
import { Button } from "@/components/ui/Button";

export function ActionButtons({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex gap-2">
      {onEdit && <Button onClick={onEdit} variant="secondary">Edit</Button>}
      {onDelete && <Button onClick={onDelete} variant="danger">Delete</Button>}
    </div>
  );
}
