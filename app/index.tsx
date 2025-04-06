import {View, Text} from "react-native";
import React, {useEffect} from "react";
import {useRouter} from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)");
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  // placeholder if slow laoding..
  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text>Loading...</Text>
    </View>
  );
}
