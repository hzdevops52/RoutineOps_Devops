import { create } from "zustand";

type Assignment = {
  day: number;
  period: number;
  subjectId: string;
  teacherId: string;
  sectionId: string;
  room?: string;
};

type ScheduleState = {
  periodsPerDay: number;
  setPeriods: (n: number) => void;
  assignments: Assignment[];
  setAssignments: (a: Assignment[]) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;

export const useScheduleStore = create<ScheduleState>((set: SetState<ScheduleState>) => ({
  periodsPerDay: 6,
  setPeriods: (n: number) => set({ periodsPerDay: n }),
  assignments: [],
  setAssignments: (a: Assignment[]) => set({ assignments: a }),
}));
