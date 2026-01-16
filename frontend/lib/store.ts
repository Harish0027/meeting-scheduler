import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
