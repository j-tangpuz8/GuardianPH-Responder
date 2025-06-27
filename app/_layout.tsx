import "react-native-gesture-handler";
import {Slot, useSegments} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import React, {useEffect, useState} from "react";
import {useRouter} from "expo-router";
import {
  StreamVideoClient,
  StreamVideo,
  User,
} from "@stream-io/video-react-native-sdk";
import {OverlayProvider} from "stream-chat-expo";
import {CheckInProvider} from "@/context/checkInContext";
import {WebSocketProvider} from "@/context/webSocketContext";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {logAuth, logIncident} from "@/utils/logger";
import {useAuthStore, useIncidentStore} from "@/context";
import {StoreInitializer} from "@/components/StoreInitializer";

const queryClient = new QueryClient();
const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;

const InitialLayout = () => {
  const {token, authenticated, user_id, initialized} = useAuthStore();
  const {incidentState, isIncidentAssignedToCurrentUser} = useIncidentStore();
  const segments = useSegments();
  const router = useRouter();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!initialized) return;
    const inAuthGroup = segments[0] === "lib";
    if (authenticated && !inAuthGroup) {
      logAuth("NAVIGATION", "Authenticated and in Authgroup");
      router.replace("/lib");
    } else if (!authenticated) {
      logAuth("NAVIGATION", "NOT Authenticated");
      client?.disconnectUser();
      router.replace("/(auth)");
    }
  }, [authenticated, initialized]);

  useEffect(() => {
    if (!initialized || !authenticated) return;

    const isMainLibPage = segments.length === 1 && segments[0] === "lib";
    const isAuthPage = segments[0] === "(auth)";

    if (!isMainLibPage && !isAuthPage) {
      if (!incidentState || Object.keys(incidentState).length === 0) {
        logIncident("NAVIGATION", "No active incident, redirecting to home");
        router.replace("/lib");
      }
    }
  }, [incidentState, segments, initialized, authenticated]);

  useEffect(() => {
    if (authenticated && token) {
      logAuth("STREAM", "Creating Stream video client");
      const user: User = {id: user_id!};
      try {
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_KEY!,
          user,
          token: token,
        });
        setClient(client);
      } catch (e) {
        logAuth("STREAM", "Error creating Stream video client", e);
      }
    }
  }, [authenticated, token, user_id]);

  useEffect(() => {
    if (
      authenticated &&
      incidentState &&
      Object.keys(incidentState).length > 0 &&
      user_id &&
      isIncidentAssignedToCurrentUser(user_id)
    ) {
      logIncident(
        "NAVIGATION",
        "Active incident assigned to current user, navigating to responding"
      );
      router.replace("/(responding)");
    }
  }, [authenticated, incidentState, user_id, isIncidentAssignedToCurrentUser]);

  return (
    <>
      {!client && <Slot />}
      {client && (
        <StreamVideo client={client}>
          <OverlayProvider>
            <Slot />
          </OverlayProvider>
        </StreamVideo>
      )}
    </>
  );
};

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer>
        <CheckInProvider>
          <WebSocketProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              <InitialLayout />
            </GestureHandlerRootView>
          </WebSocketProvider>
        </CheckInProvider>
      </StoreInitializer>
    </QueryClientProvider>
  );
};

export default RootLayout;
