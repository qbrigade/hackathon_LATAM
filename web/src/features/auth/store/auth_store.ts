import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@db/schema';

export type PeruanistaUser = User & {
  profile?: Required<Tables<'profiles'>>;
};

type AuthStore = {
  user: PeruanistaUser | null;
  profileCompleted: boolean;
  authChecked: boolean;
  isConfirmed: boolean;
  setUser: (user: PeruanistaUser | null) => void;
  setProfileCompleted: (completed: boolean) => void;
  setAuthChecked: (checked: boolean) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profileCompleted: false,
  authChecked: false,
  isConfirmed: false,
  setUser: (user) => set({
    user,
    isConfirmed: !!user?.confirmed_at,
    profileCompleted: !!user?.profile?.profile_completed
  }),
  setProfileCompleted: (completed) => set({ profileCompleted: completed }),
  setAuthChecked: (checked) => set({ authChecked: checked }),
  clearUser: () => set({ user: null, profileCompleted: false, authChecked: true, isConfirmed: false }),
}));
