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
import Toast from "react-native-toast-message";
import {toastConfig} from "@/utils/toastConfig";

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

    const currentSegment = segments[0];
    const isAuthPage = currentSegment === "(auth)";
    const isLibPage = currentSegment === "lib";
    const isRespondingPage = currentSegment === "(responding)";

    const hasActiveIncident =
      incidentState && Object.keys(incidentState).length > 0;
    const isIncidentAssigned =
      user_id && hasActiveIncident && isIncidentAssignedToCurrentUser(user_id);

    if (!authenticated) {
      logAuth("NAVIGATION", "User not authenticated, redirecting to auth");
      client?.disconnectUser();
      if (!isAuthPage) {
        router.replace("/(auth)");
      }
      return;
    }

    if (authenticated) {
      if (isIncidentAssigned) {
        logIncident(
          "NAVIGATION",
          "Active incident assigned to current user, navigating to responding"
        );
        if (!isRespondingPage) {
          router.replace("/(responding)");
        }
        return;
      }

      if (!hasActiveIncident && !isLibPage && !isAuthPage) {
        logIncident("NAVIGATION", "No active incident, redirecting to home");
        router.replace("/lib");
        return;
      }

      if (isAuthPage) {
        logAuth(
          "NAVIGATION",
          "Authenticated user on auth page, redirecting to lib"
        );
        router.replace("/lib");
        return;
      }
    }
  }, [
    authenticated,
    initialized,
    incidentState,
    user_id,
    segments,
    isIncidentAssignedToCurrentUser,
  ]);

  useEffect(() => {
    if (authenticated && token && user_id) {
      logAuth("STREAM", "Creating Stream video client");
      const user: User = {id: user_id};
      try {
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_KEY!,
          user,
          token: token,
        });
        setClient(streamClient);
      } catch (e) {
        logAuth("STREAM", "Error creating Stream video client", e);
      }
    }
  }, [authenticated, token, user_id]);

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
              <Toast config={toastConfig} />
            </GestureHandlerRootView>
          </WebSocketProvider>
        </CheckInProvider>
      </StoreInitializer>
    </QueryClientProvider>
  );
};

export default RootLayout;
