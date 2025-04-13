import {View, StyleSheet} from "react-native";
import {Stack, usePathname} from "expo-router";
import BottomNavigation from "@/components/layouting/bottom-navigation";
import RespondingHeader from "@/components/layouting/responding-header";

export default function RespondingLayout() {
  const pathname = usePathname();
  const isCallScreen = pathname.includes("call");
  const isDetailScreen =
    pathname.includes("patient-details") || pathname.includes("vital-signs");

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
            presentation: "modal",
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
      </Stack>
      {!isCallScreen && <BottomNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
