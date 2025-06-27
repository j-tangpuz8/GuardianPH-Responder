import {create} from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  token: string | null;
  authenticated: boolean | null;
  user_id: string | null;
  initialized: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  loadStoredAuth: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  token: null,
  authenticated: null,
  user_id: null,
  initialized: false,

  setInitialized: (initialized: boolean) => set({initialized}),

  loadStoredAuth: async () => {
    try {
      const data = await SecureStore.getItemAsync("auth-token");
      if (data) {
        const object = JSON.parse(data);
        set({
          token: object.token,
          authenticated: true,
          user_id: object.user.id,
          initialized: true,
        });
      } else {
        set({initialized: true});
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      set({initialized: true});
    }
  },

  login: async (email: string, password: string) => {
    try {
      const result = await fetch(`${API_URL}/responders/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      const json = await result.json();

      if (!result.ok) {
        throw new Error(json.message || "Login failed");
      }

      await SecureStore.setItemAsync("auth-token", JSON.stringify(json));

      set({
        token: json.token,
        authenticated: true,
        user_id: json.user.id,
      });

      return json;
    } catch (e) {
      console.error("Login error:", e);
      return {
        error: true,
        msg: e instanceof Error ? e.message : "Login failed",
      };
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("auth-token");
    } catch (error) {
      console.error("Error deleting auth token:", error);
    }

    set({
      token: null,
      authenticated: false,
      user_id: null,
    });
  },
}));
