import React, {useEffect} from "react";
import {useAuth} from "@/context/AuthContext";
import {Slot, useRouter} from "expo-router";

export default function RootLayout() {
  const {authState} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState) {
      router.replace("/(auth)");
    }
  }, [authState, router]);

  return <Slot />;
}
