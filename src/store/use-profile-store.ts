import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Persisted store interface
interface PersistedProfileStore {
  isProfileComplete: boolean;
  profileProgress: number;
  hasSubmittedProfile: boolean;
  setIsProfileComplete: (value: boolean) => void;
  setProfileProgress: (value: number) => void;
  setHasSubmittedProfile: (value: boolean) => void;
  resetStore: () => void;
}

// Session store interface
interface SessionProfileStore {
  hasShownModalInSession: boolean;
  setHasShownModalInSession: (value: boolean) => void;
}

// Create persisted store
const usePersistedProfileStore = create<PersistedProfileStore>()(
  persist(
    (set) => ({
      isProfileComplete: false,
      profileProgress: 0,
      hasSubmittedProfile: false,
      setIsProfileComplete: (value) => set({ isProfileComplete: value }),
      setProfileProgress: (value) => set({ profileProgress: value }),
      setHasSubmittedProfile: (value) => set({ hasSubmittedProfile: value }),
      resetStore: () => set({
        isProfileComplete: false,
        profileProgress: 0,
        hasSubmittedProfile: false,
      }),
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Create session store
const useSessionProfileStore = create<SessionProfileStore>((set) => ({
  hasShownModalInSession: false,
  setHasShownModalInSession: (value) => set({ hasShownModalInSession: value }),
}));

// Combined hook for easier usage
export function useProfileStore() {
  const persisted = usePersistedProfileStore();
  const session = useSessionProfileStore();

  return {
    ...persisted,
    ...session,
  };
} 