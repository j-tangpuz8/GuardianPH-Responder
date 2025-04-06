import * as SecureStore from "expo-secure-store";
import {createContext, useContext, useEffect, useState} from "react";

interface AuthProps {
  authState: {
    token: string | null;
    authenticated: boolean | null;
    user_id: string | null;
  };
  onRegister: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<any>;
  onLogin: (email: string, password: string) => Promise<any>;
  onLogout: () => Promise<any>;
  initialized: boolean;
}

const TOKEN_KEY = "my-token";
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
      // Load token on startup
      const data = await SecureStore.getItemAsync(TOKEN_KEY);

      if (data) {
        const object = JSON.parse(data);
        // Set our context state
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
      const result = await fetch(`${API_URL}/users/login`, {
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

      // Set our context state
      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user.id,
      });

      // Store user data in secure storage
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

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      const result = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const json = await result.json();

      if (!result.ok) {
        throw new Error(json.message || "Registration failed");
      }

      // Set our context state using the _id from the response
      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json._id,
      });

      // Store with the correct structure
      const userData = {
        token: json.token,
        user: {
          id: json._id,
          email: json.email,
        },
      };

      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(userData));

      return userData;
    } catch (e) {
      console.error("Registration error:", e);
      return {
        error: true,
        msg:
          e instanceof Error
            ? e.message
            : "An error occurred during registration",
      };
    }
  };

  const logout = async () => {
    // Delete token from storage
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    // Reset auth state
    setAuthState({
      token: null,
      authenticated: false,
      user_id: null,
    });
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
