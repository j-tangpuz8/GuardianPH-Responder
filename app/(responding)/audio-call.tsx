import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {useIncidentStore} from "@/context";
import {useAuthStore} from "@/context";
import {
  useCall,
  StreamCall,
  useStreamVideoClient,
  Call,
} from "@stream-io/video-react-native-sdk";
import {useRouter, useLocalSearchParams} from "expo-router";
import {FontAwesome} from "@expo/vector-icons";

export default function AudioCall() {
  const {incidentState} = useIncidentStore();
  const {user_id} = useAuthStore();
  const router = useRouter();
  const client = useStreamVideoClient();
  const {callId} = useLocalSearchParams<{callId: string}>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callObject, setCallObject] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCall() {
      if (!client || !callId || !incidentState?.lgu) {
        setError("Missing required information");
        setIsInitializing(false);
        return;
      }

      const call = client.call("default", callId);
      setCallObject(call);

      try {
        setIsConnecting(true);
        console.log("Attempting to join call:", callId);

        call.on("call.accepted", (event) => {
          console.log("Call accepted event received for user:", event.user.id);
        });

        call.on("call.rejected", (event) => {
          console.log("Call rejected event received");
          setError("Call was rejected.");
          setIsConnecting(false);
          setTimeout(() => router.back(), 2000);
        });

        await call.join();
        console.log("Successfully joined call:", callId);
        setIsConnecting(false);
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Error joining call:", err);
        if (err.message?.includes("already joined")) {
          console.warn("Attempted to join a call already joined.");
          setIsConnecting(false);
          setIsInitializing(false);
        } else {
          setError(`Failed to join call: ${err.message || "Unknown error"}`);
          setIsConnecting(false);
          setIsInitializing(false);
        }
      }
    }

    setupCall();

    return () => {
      if (callObject) {
        console.log("Leaving call on component unmount:", callObject.id);
        callObject.leave().catch((err: any) => {
          console.error("Error leaving call on unmount:", err);
        });
      }
    };
  }, [client, callId, incidentState?.lgu]);

  // loading ui
  if (isInitializing || isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {isInitializing ? "Initializing..." : "Connecting to call..."}
        </Text>
      </View>
    );
  }

  // error UI
  if (error || !callObject) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || "Call setup failed"}</Text>
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={() => router.back()}>
          <Text style={styles.endCallText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <StreamCall call={callObject}>
      <AudioOnlyContent />
    </StreamCall>
  );
}

function AudioOnlyContent() {
  const call = useCall();
  const router = useRouter();

  const handleEndCall = async () => {
    try {
      await call?.leave();
    } catch (err) {
      console.error("Error ending call:", err);
    } finally {
      router.back();
    }
  };

  return (
    <View style={styles.callContainer}>
      <View style={styles.audioOnlyContent}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="phone" size={50} color="#007AFF" />
        </View>
        <Text style={styles.audioCallText}>Audio Call in Progress</Text>
        <ActivityIndicator
          size="small"
          color="#007AFF"
          style={styles.audioIndicator}
        />
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  callContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  audioOnlyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e1f5fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  audioCallText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  audioIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  callingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  ringIndicator: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  endCallButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    zIndex: 100,
  },
  endCallText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
