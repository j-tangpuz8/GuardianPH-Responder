import {
  useCallStateHooks,
  CallingState,
  useCall,
} from "@stream-io/video-react-native-sdk";
import {useEffect} from "react";
import InCallManager from "react-native-incall-manager";

const RingingSound = () => {
  const call = useCall();
  const isCallCreatedByMe = call?.isCreatedByMe;
  const {useCallCallingState} = useCallStateHooks();

  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState !== CallingState.RINGING) return;

    if (isCallCreatedByMe) {
      InCallManager.start({media: "video", ringback: "_BUNDLE_"});
      return () => InCallManager.stopRingback();
    } else {
      InCallManager.startRingtone(
        "_BUNDLE_",
        [1000, 2000, 3000],
        "default",
        30
      );
      return () => InCallManager.stopRingtone();
    }
  }, [callingState, isCallCreatedByMe]);

  return null;
};

export default RingingSound;
