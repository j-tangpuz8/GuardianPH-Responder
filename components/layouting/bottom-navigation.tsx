import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {FontAwesome5} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useIncidentStore} from "@/context";
import {useAuthStore} from "@/context";
import {useStreamVideoClient} from "@stream-io/video-react-native-sdk";
import UpdateStatusModal from "./update-status";
import MessagesDrawer from "./chat-drawer";

export default function BottomNavigation() {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showMessagesDrawer, setShowMessagesDrawer] = React.useState(false);
  const {incidentState} = useIncidentStore();
  const {logout, user_id} = useAuthStore();
  const client = useStreamVideoClient();

  const handleLogout = () => {
    logout();
  };

  const initiateAudioCall = async () => {
    if (!client || !incidentState?.lgu || !user_id) {
      alert("Cannot initiate call - missing required information");
      return;
    }

    try {
      const callId = "fad-call";
      const callType = "default";
      const outgoingCall = client.call(callType, callId);
      await outgoingCall.getOrCreate({
        data: {
          members: [
            {user_id: user_id, role: "call_member"},
            {user_id: String(incidentState.lgu._id), role: "call_member"},
          ],
          settings_override: {
            audio: {mic_default_on: true, default_device: "speaker"},
            video: {camera_default_on: false, enabled: false},
          },
        },
        ring: true,
      });
      // await outgoingCall.join();
      router.push({
        pathname: "/(responding)/audio-call",
        params: {callId: callId},
      });
    } catch (err) {
      console.error("Failed to initiate call:", err);
      alert("Failed to start call. Please try again.");
    }
  };

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

        {/* <TouchableOpacity style={styles.tab} onPress={initiateAudioCall}>
          <FontAwesome5 name="phone" size={24} color="white" />
        </TouchableOpacity> */}

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

        <TouchableOpacity style={styles.tab} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={24} color="white" />
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
    backgroundColor: "#1B4965",
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
