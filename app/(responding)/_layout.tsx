import {View, StyleSheet} from "react-native";
import {Stack, usePathname} from "expo-router";
import BottomNavigation from "@/components/layouting/bottom-navigation";
import RespondingHeader from "@/components/layouting/responding-header";

export default function RespondingLayout() {
  const pathname = usePathname();
  const isCallScreen = pathname.includes("call");

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          header: () => (!isCallScreen ? <RespondingHeader /> : null),
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
