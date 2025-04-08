import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {FontAwesome5} from "@expo/vector-icons";
import {useState} from "react";
import {useRouter} from "expo-router";
import UpdateStatusModal from "./update-status";
import MessagesDrawer from "./chat-drawer";

export default function BottomNavigation() {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMessagesDrawer, setShowMessagesDrawer] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setShowMessagesDrawer(true)}>
          <FontAwesome5 name="envelope" size={24} color="white" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push("/(responding)/audio-call")}>
          <FontAwesome5 name="phone" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push("/(responding)/video-call")}>
          <FontAwesome5 name="video" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setShowStatusModal(true)}>
          <FontAwesome5 name="bars" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <UpdateStatusModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />

      <MessagesDrawer
        visible={showMessagesDrawer}
        onClose={() => setShowMessagesDrawer(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#2c3e50",
    padding: 6,
    justifyContent: "space-around",
  },
  tab: {
    position: "relative",
    padding: 10,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
