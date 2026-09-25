"use client";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getTeachers, getSubjects, getSections } from "@/lib/api";

const fetchCounts = async () => {
  const [teachers, subjects, sections] = await Promise.all([
    getTeachers().then((res: any[]) => res.length),
    getSubjects().then((res: any[]) => res.length),
    getSections().then((res: any[]) => res.length),
  ]);
  return { teachers, subjects, sections };
};

export default function DashboardPage() {
  const { data: counts, isLoading } = useQuery({ queryKey: ["counts"], queryFn: fetchCounts });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>Teachers</CardHeader>
          <CardBody>
            <div className="text-3xl font-bold">{isLoading ? "-" : counts?.teachers}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Subjects</CardHeader>
          <CardBody>
            <div className="text-3xl font-bold">{isLoading ? "-" : counts?.subjects}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Sections</CardHeader>
          <CardBody>
            <div className="text-3xl font-bold">{isLoading ? "-" : counts?.sections}</div>
          </CardBody>
        </Card>
      </div>
      <div className="flex gap-3">
        <Button href="/teachers">Manage Teachers</Button>
        <Button href="/subjects" variant="secondary">Manage Subjects</Button>
        <Button href="/sections" variant="secondary">Manage Sections</Button>
        <Button href="/schedule/generate" variant="primary">Generate Schedule</Button>
      </div>
    </div>
  );
}
