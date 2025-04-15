import {View, StyleSheet} from "react-native";
import React, {useState, useEffect} from "react";
import {useLocalSearchParams, useRouter} from "expo-router";
import {
  Call,
  CallContent,
  StreamCall,
  useStreamVideoClient,
  StreamVideoEvent,
} from "@stream-io/video-react-native-sdk";
import Spinner from "react-native-loading-spinner-overlay";
import Toast from "react-native-toast-message";

const VideoCall = () => {
  const {id} = useLocalSearchParams<{id: string}>();
  const [call, setCall] = useState<Call | null>(null);
  const client = useStreamVideoClient();
  const router = useRouter();

  const handleCallEnd = async () => {
    try {
      setCall(null);
      await call?.leave();
      router.replace("/");
    } catch (error) {
      console.error("Error ending call:", error);
      await call?.leave();
      router.replace("/");
    }
  };

  useEffect(() => {
    const unsubscribe = client!.on("all", (event: StreamVideoEvent) => {
      console.log(event);

      if (event.type === "call.ended") {
        Toast.show({
          text1: "Call Ended",
          text2: "Returning to room verification",
        });
        router.replace("/");
      }

      if (event.type === "call.reaction_new") {
        console.log(`new reaction: ${event.reaction}`);
      }

      if (event.type === "call.session_participant_joined") {
        console.log(`new participant joined: ${event.participant}`);
        const user = event.participant.user.name;
        Toast.show({
          text1: "user joined",
          text2: `say hello to ${user}`,
        });
      }

      if (event.type === "call.session_participant_left") {
        console.log(`participant left: ${event.participant}`);
        const user = event.participant.user.name;
        Toast.show({
          text1: "user left",
          text2: `${user} left the call`,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!client || call) return;
    const joinCall = async () => {
      console.log("Joining Call with id", id);
      const call = client.call("default", id);
      await call.join({create: false});
      setCall(call);
    };
    joinCall();
  }, [client]);

  return (
    <View style={{flex: 1}}>
      <Spinner visible={!call} />
      {call && (
        <StreamCall call={call}>
          <View style={styles.container}>
            <CallContent layout="grid" onHangupCallHandler={handleCallEnd} />
          </View>
        </StreamCall>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    textAlign: "center",
    justifyContent: "center",
  },
});

export default VideoCall;
