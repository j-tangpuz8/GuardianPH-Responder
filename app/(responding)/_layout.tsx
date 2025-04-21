import {View, StyleSheet} from "react-native";
import {Stack, usePathname} from "expo-router";
import BottomNavigation from "@/components/layouting/bottom-navigation";
import RespondingHeader from "@/components/layouting/responding-header";
import CallPanel from "@/components/calls/CallPanel";
import {useCalls, StreamCall} from "@stream-io/video-react-native-sdk";
import RingingSound from "@/components/calls/RingingSound";

export default function RespondingLayout() {
  const pathname = usePathname();
  const isCallScreen = pathname.includes("call");
  const isDetailScreen =
    pathname.includes("patient-details") ||
    pathname.includes("vital-signs") ||
    pathname.includes("handover-vital-signs");
  const calls = useCalls();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          header: () =>
            !isCallScreen && !isDetailScreen ? <RespondingHeader /> : null,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="audio-call"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="video-call"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="patient-details"
          options={{
            headerShown: true,
            title: "Patient Details",
          }}
        />
        <Stack.Screen
          name="vital-signs"
          options={{
            headerShown: true,
            title: "Vital Signs",
          }}
        />
        <Stack.Screen
          name="handover-vital-signs"
          options={{
            headerShown: true,
            title: "Vital Signs",
          }}
        />
      </Stack>
      {!isCallScreen && <BottomNavigation />}

      {calls && calls.length > 0 && calls[0] ? (
        <StreamCall call={calls[0]}>
          {/* <RingingSound /> */}
          <CallPanel />
        </StreamCall>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
