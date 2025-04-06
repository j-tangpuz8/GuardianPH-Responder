import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {useRouter} from "expo-router";

const register = () => {
  const router = useRouter();

  return (
    <View>
      <Text>register</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default register;

const styles = StyleSheet.create({});
