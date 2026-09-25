"use client";
import GenerateScheduleForm from "@/components/forms/GenerateScheduleForm";
import { useSchedule } from "@/hooks/useSchedule";
import { Loader } from "@/components/ui/Loader";
import RoutineWizard from "@/components/forms/RoutineWizard";
import { PageHeader } from "@/components/common/PageHeader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GenerateSchedulePage() {
  const { generateM } = useSchedule();
  const router = useRouter();

  useEffect(() => {
    if (generateM.isSuccess) {
      router.push("/schedule/view");
    }
  }, [generateM.isSuccess, router]);
  return (
    <div className="space-y-6">
      <PageHeader title="Generate Schedule" />
      <RoutineWizard />
      {generateM.isPending && <Loader />}
    </div>
  );
}
