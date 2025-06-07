import {View, StyleSheet} from "react-native";
import {Stack, usePathname} from "expo-router";
import BottomNavigation from "@/components/layouting/bottom-navigation";
import RespondingHeader from "@/components/layouting/responding-header";
import CallPanel from "@/components/calls/CallPanel";
import {useCalls, StreamCall} from "@stream-io/video-react-native-sdk";
// import RingingSound from "@/components/calls/RingingSound";

export default function RespondingLayout() {
  const pathname = usePathname();
  const isCallScreen =
    pathname.includes("call") || pathname.includes("pending-close");
  const isDetailScreen =
    pathname.includes("patient-details") ||
    pathname.includes("vital-signs") ||
    pathname.includes("pending-close") ||
    pathname.includes("handover-vital-signs") ||
    pathname.includes("fire-details");
  const calls = useCalls();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          header: () =>
            !isCallScreen && !isDetailScreen ? <RespondingHeader /> : null,
        }}>
        {/* responding screens */}
        <Stack.Screen name="index" />
        <Stack.Screen
          name="audio-call"
          options={{presentation: "modal", headerShown: false}}
        />
        <Stack.Screen name="video-call" options={{headerShown: false}} />
        <Stack.Screen name="pending-close" options={{headerShown: false}} />

        {/* medical emergency screens */}
        <Stack.Screen
          name="medical/patient-details"
          options={{headerShown: true, title: "Patient Details"}}
        />
        <Stack.Screen
          name="medical/vital-signs"
          options={{headerShown: true, title: "Vital Signs"}}
        />
        <Stack.Screen
          name="medical/handover-vital-signs"
          options={{headerShown: true, title: "Handover Vital Signs"}}
        />

        {/* fire emergency screens */}
        <Stack.Screen
          name="fire/fire-details"
          options={{headerShown: true, title: "Fire Details"}}
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
