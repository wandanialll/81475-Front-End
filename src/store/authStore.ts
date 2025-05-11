// src/store/authStore.ts
import { create } from "zustand";
import { User } from "firebase/auth";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	setToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	setUser: (user) => set({ user, isAuthenticated: !!user }),
	logout: () => set({ user: null, isAuthenticated: false }),
	setToken: (token) => set({ token, isAuthenticated: !!token }),
	token: null,
}));
