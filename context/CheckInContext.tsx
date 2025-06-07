import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import {useAuth} from "./AuthContext";

type CheckInContextType = {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
};

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export function CheckInProvider({children}: {children: React.ReactNode}) {
  const {authState} = useAuth();
  const userId = authState?.user_id;
  const [isOnline, setIsOnlineState] = useState(false);

  useEffect(() => {
    const loadCheckIn = async () => {
      if (!userId) {
        setIsOnlineState(false);
        return;
      }
      const stored = await SecureStore.getItemAsync(`checkin-${userId}`);
      setIsOnlineState(stored === "true");
    };
    loadCheckIn();
  }, [userId]);

  const setIsOnline = useCallback(
    async (status: boolean) => {
      setIsOnlineState(status);
      if (userId) {
        await SecureStore.setItemAsync(
          `checkin-${userId}`,
          status ? "true" : "false"
        );
      }
    },
    [userId]
  );

  return (
    <CheckInContext.Provider value={{isOnline, setIsOnline}}>
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const context = useContext(CheckInContext);
  if (context === undefined) {
    throw new Error("useCheckIn must be used within a CheckInProvider");
  }
  return context;
}
