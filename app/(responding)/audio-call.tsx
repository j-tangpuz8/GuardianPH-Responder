import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {useIncident} from "@/context/IncidentContext";
import {useAuth} from "@/context/AuthContext";
import {
  useCall,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import {useRouter} from "expo-router";
import {FontAwesome} from "@expo/vector-icons";

export default function AudioCall() {
  const {incidentState} = useIncident();
  const {authState} = useAuth();
  const router = useRouter();
  const client = useStreamVideoClient();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRinging, setIsRinging] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeCall() {
      if (!client || !incidentState?.lgu || !authState?.user_id) {
        setError("Missing required information");
        setIsInitializing(false);
        return;
      }

      try {
        const callId = `fad-call-${Date.now()}`;
        const call = client.call("default", callId);
        await call.getOrCreate({
          data: {
            members: [
              {user_id: authState.user_id, role: "call_member"},
              {user_id: incidentState.lgu._id, role: "call_member"},
            ],
            settings_override: {
              audio: {
                mic_default_on: true,
                default_device: "speaker",
              },
              video: {
                camera_default_on: false,
                enabled: false,
                target_resolution: {
                  width: 240,
                  height: 300,
                },
              },
            },
          },
          ring: true,
        });

        console.log("Call created, ringing LGU...");
        setCallObject(call);
        setIsInitializing(false);
        setIsRinging(true);

        call.on("call.accepted", (event) => {
          console.log("Call accepted by:", event.user.id);
          if (event.user.id === incidentState?.lgu?._id) {
            console.log("LGU accepted the call");
            setIsRinging(false);
          }
        });

        await call.join();
        console.log("You joined the call, waiting for LGU to accept...");
      } catch (err) {
        console.error("Call initialization error:", err);
        setError("Failed to initialize call");
        setIsInitializing(false);
      }
    }

    initializeCall();

    const timeout = setTimeout(() => {
      if (isRinging) {
        setError("Call not answered");
        if (callObject) {
          callObject.leave().catch((err: any) => {
            console.error("Error leaving call:", err);
          });
        }
        router.back();
      }
    }, 30000);

    return () => {
      clearTimeout(timeout);
      if (callObject) {
        callObject.leave().catch((err: any) => {
          console.error("Error leaving call:", err);
        });
      }
    };
  }, [client, incidentState, authState]);

  // initializeing call ui
  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing call...</Text>
      </View>
    );
  }

  // err ui
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

  // ring
  if (isRinging) {
    return (
      <View style={styles.container}>
        <Text style={styles.callingText}>
          Calling {incidentState?.lgu?.firstName || "LGU"}...
        </Text>
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.ringIndicator}
        />
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={() => {
            callObject.leave().catch((err: any) => {
              console.error("Error leaving call:", err);
            });
            router.back();
          }}>
          <Text style={styles.endCallText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show call UI once connected
  return (
    <StreamCall call={callObject}>
      <AudioOnlyContent />
    </StreamCall>
  );
}

// Component that uses call state hooks (must be inside StreamCall)
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
