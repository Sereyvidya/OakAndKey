"use client";

import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  /** False until the first session check finishes (avoids a signed-out flash). */
  ready: boolean;
  setUser: (user: AuthUser | null) => void;
  setReady: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user, ready: true }),
  setReady: () => set({ ready: true }),
}));
