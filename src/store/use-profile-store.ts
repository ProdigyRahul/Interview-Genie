import { create } from 'zustand';

interface ProfileStore {
  isProfileComplete: boolean;
  profileProgress: number;
  hasSubmittedProfile: boolean;
  setIsProfileComplete: (value: boolean) => void;
  setProfileProgress: (value: number) => void;
  setHasSubmittedProfile: (value: boolean) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  isProfileComplete: false,
  profileProgress: 0,
  hasSubmittedProfile: false,
  setIsProfileComplete: (value) => set({ isProfileComplete: value }),
  setProfileProgress: (value) => set({ profileProgress: value }),
  setHasSubmittedProfile: (value) => set({ hasSubmittedProfile: value }),
})); 