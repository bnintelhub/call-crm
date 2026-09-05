import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LiveStatusState {
  isLive: boolean;
  liveSince: string | null;
  setLive: (live: boolean) => void;
  toggleLive: () => void;
}

export const useLiveStatusStore = create<LiveStatusState>()(
  persist(
    (set) => ({
      isLive: false,
      liveSince: null,
      setLive: (live: boolean) =>
        set({
          isLive: live,
          liveSince: live ? new Date().toISOString() : null,
        }),
      toggleLive: () =>
        set((state) => ({
          isLive: !state.isLive,
          liveSince: !state.isLive ? new Date().toISOString() : null,
        })),
    }),
    {
      name: 'yucollect-live-status',
    }
  )
);

export default useLiveStatusStore;
