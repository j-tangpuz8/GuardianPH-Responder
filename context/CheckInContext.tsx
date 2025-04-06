import React, {createContext, useContext, useState} from "react";

type CheckInContextType = {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
};

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export function CheckInProvider({children}: {children: React.ReactNode}) {
  const [isOnline, setIsOnline] = useState(false);

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
