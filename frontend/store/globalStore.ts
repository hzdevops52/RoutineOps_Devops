import { create } from "zustand";

type GlobalState = {
  year: string | null;
  setYear: (y: string | null) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;

export const useGlobalStore = create<GlobalState>((set: SetState<GlobalState>) => ({
  year: null,
  setYear: (y: string | null) => set({ year: y }),
}));
