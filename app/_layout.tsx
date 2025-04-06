import "react-native-gesture-handler";
import {Slot, Stack, useSegments} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {AuthProvider, useAuth} from "@/context/AuthContext";
import React, {useEffect, useState} from "react";
import {useRouter} from "expo-router";
import {
  StreamVideoClient,
  StreamVideo,
  User,
} from "@stream-io/video-react-native-sdk";
import {OverlayProvider} from "stream-chat-expo";
import {CheckInProvider} from "@/context/CheckInContext";
const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;

const InitialLayout = () => {
  const {authState, initialized} = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!initialized) return;
    const inAuthGroup = segments[0] === "lib";
    if (authState?.authenticated && !inAuthGroup) {
      console.log("Authenticated and in Authgroup");
      router.replace("/lib");
    } else if (!authState?.authenticated) {
      console.log("NOT Authenticated ");
      client?.disconnectUser();
      router.replace("/(auth)");
    }
  }, [authState, initialized]);

  useEffect(() => {
    if (authState?.authenticated && authState.token) {
      console.log("Creating a client");
      const user: User = {id: authState.user_id!};
      try {
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_KEY!,
          user,
          token: authState.token,
        });
        setClient(client);
      } catch (e) {
        console.log("Error creating client: ", e);
      }
    }
  }, [authState]);

  // useEffect(() => {
  //   if (incidentState) {
  //     router.replace({
  //       pathname: "/landing/(room)/RoomVerification",
  //       params: {
  //         emergencyType: incidentState.emergencyType,
  //         channelId: incidentState.channelId,
  //         incidentId: incidentState.incidentId,
  //       },
  //     });
  //   }
  // }, []);

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
    <AuthProvider>
      {/* <IncidentProvider> */}
      <CheckInProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <InitialLayout />
        </GestureHandlerRootView>
      </CheckInProvider>
      {/* </IncidentProvider> */}
    </AuthProvider>
  );
};

export default RootLayout;
