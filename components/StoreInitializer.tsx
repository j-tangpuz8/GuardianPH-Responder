import React, {useEffect} from "react";
import {useAuthStore, useIncidentStore} from "@/context";

interface StoreInitializerProps {
  children: React.ReactNode;
}

export const StoreInitializer: React.FC<StoreInitializerProps> = ({
  children,
}) => {
  const {loadStoredAuth} = useAuthStore();
  const {loadStoredIncident} = useIncidentStore();

  useEffect(() => {
    const initializeStores = async () => {
      await loadStoredAuth();
      const {user_id} = useAuthStore.getState();
      if (user_id) {
        await loadStoredIncident(user_id);
      }
    };

    initializeStores();
  }, [loadStoredAuth, loadStoredIncident]);

  return <>{children}</>;
};
