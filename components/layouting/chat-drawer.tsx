import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {StreamChat} from "stream-chat";
import {
  Channel,
  Chat,
  DefaultStreamChatGenerics,
  MessageInput,
  MessageList,
} from "stream-chat-expo";
import {Channel as ChannelType} from "stream-chat";
import {useAuth} from "../../context/AuthContext";
import {useIncident} from "@/context/IncidentContext";

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface MessagesDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function MessagesDrawer({
  visible,
  onClose,
}: MessagesDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [channel, setChannel] = useState<
    ChannelType<DefaultStreamChatGenerics> | undefined
  >(undefined);
  const {authState} = useAuth();
  const {incidentState} = useIncident();

  const chatClient = useRef(StreamChat.getInstance(STREAM_KEY!)).current;
  const channelId = incidentState?.incidentId.substring(5, 9);

  useEffect(() => {
    const connectToChannel = async () => {
      try {
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: authState?.user_id!,
              name: "Responder",
              image: "https://getstream.io/random_svg/?name=test",
            },
            authState?.token!
          );
        }

        const channel = chatClient.channel("messaging", channelId, {
          name: "Responder Chat with LGU",
          members: [authState?.user_id!],
        });

        await channel.watch();
        setChannel(channel);
      } catch (error) {
        console.error("Error connecting to channel:", error);
      }
    };

    if (visible && authState?.token && authState?.user_id) {
      connectToChannel();
    }

    return () => {
      if (!visible) {
        channel?.stopWatching();
      }
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (chatClient.userID) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible || !channel) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.handle} />
            <Text style={styles.title}>Message from Dispatch</Text>

            <View style={styles.channelContainer}>
              <Chat client={chatClient}>
                <Channel channel={channel}>
                  <MessageList />
                  <MessageInput />
                </Channel>
              </Chat>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: "rgba(52, 73, 94, 0.95)",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
    height: "80%",
  },
  channelContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: -5,
    paddingHorizontal: 5,
  },
  handle: {
    width: 40,
    height: 1,
    backgroundColor: "#fff",
    borderRadius: 2,
    alignSelf: "center",
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 10,
  },
  messageUser: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#2980b9",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
