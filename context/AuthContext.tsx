import * as SecureStore from "expo-secure-store";
import {createContext, useContext, useEffect, useState} from "react";

interface AuthProps {
  authState: {
    token: string | null;
    authenticated: boolean | null;
    user_id: string | null;
  };
  onLogin: (email: string, password: string) => Promise<any>;
  onLogout: () => Promise<any>;
  initialized: boolean;
}

const TOKEN_KEY = "auth-token";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const AuthContext = createContext<Partial<AuthProps>>({});

// auth hook
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({children}: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user_id: string | null;
  }>({
    token: null,
    authenticated: null,
    user_id: null,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const data = await SecureStore.getItemAsync(TOKEN_KEY);

      if (data) {
        const object = JSON.parse(data);
        setAuthState({
          token: object.token,
          authenticated: true,
          user_id: object._id,
        });
      }
      setInitialized(true);
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
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

      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user.id,
      });

      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(json));
      return json;
    } catch (e) {
      console.error("Login error:", e);
      return {
        error: true,
        msg: e instanceof Error ? e.message : "Login failed",
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    setAuthState({
      token: null,
      authenticated: false,
      user_id: null,
    });
  };

  const value = {
    onLogin: login,
    onLogout: logout,
    authState,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
