import { create } from "zustand";

type UIState = {
  sidebarOpen: boolean;
  setSidebar: (open: boolean) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;

export const useUIStore = create<UIState>((set: SetState<UIState>) => ({
  sidebarOpen: true,
  setSidebar: (open: boolean) => set({ sidebarOpen: open })
}));
