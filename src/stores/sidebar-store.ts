import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "sidebar-store",
    },
  ),
);
