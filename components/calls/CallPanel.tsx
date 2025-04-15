import {StyleSheet, View, Dimensions} from "react-native";
import {
  CallingState,
  useCall,
  useCallStateHooks,
  IncomingCall,
} from "@stream-io/video-react-native-sdk";
import {useRouter} from "expo-router";

const {width, height} = Dimensions.get("window");

export default function CallPanel() {
  const call = useCall();
  const isCallCreatedByMe = call?.isCreatedByMe;
  const {useCallCallingState} = useCallStateHooks();
  const router = useRouter();

  const handleAcceptCall = async () => {
    try {
      if (call) {
        await call.accept();
        router.push({
          pathname: "/(responding)/video-call",
          params: {id: "fad-call"},
        });
      }
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const callingState = useCallCallingState();
  if (callingState === CallingState.RINGING && !isCallCreatedByMe) {
    return (
      <View style={styles.fullScreenContainer}>
        <IncomingCall onAcceptCallHandler={handleAcceptCall} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
});
