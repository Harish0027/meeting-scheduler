import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initFromCookie: () => void;
}

// Helper to read user from cookie
function getUserFromCookie(): User | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user="));
  if (cookie) {
    try {
      return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    } catch {
      return null;
    }
  }
  return null;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  initFromCookie: () => {
    const user = getUserFromCookie();
    if (user) set({ user });
  },
}));
