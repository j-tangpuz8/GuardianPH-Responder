import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/context";

type CheckInContextType = {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
};

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export const CheckInProvider = ({ children }: any) => {
  const { user_id } = useAuthStore();
  const [isOnline, setIsOnlineState] = useState(false);

  useEffect(() => {
    const loadCheckIn = async () => {
      if (!user_id) {
        setIsOnlineState(false);
        return;
      }
      const stored = await SecureStore.getItemAsync(`checkin-${user_id}`);
      setIsOnlineState(stored === "true");
    };
    loadCheckIn();
  }, [user_id]);

  const setIsOnline = useCallback(
    async (status: boolean) => {
      setIsOnlineState(status);
      if (user_id) {
        await SecureStore.setItemAsync(
          `checkin-${user_id}`,
          status ? "true" : "false"
        );
      }
    },
    [user_id]
  );

  return (
    <CheckInContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </CheckInContext.Provider>
  );
};

export function useCheckIn() {
  const context = useContext(CheckInContext);
  if (context === undefined) {
    throw new Error("useCheckIn must be used within a CheckInProvider");
  }
  return context;
}
