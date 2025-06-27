import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  TextInput,
  Image,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {useIncidentStore} from "@/context";
import {useRouter} from "expo-router";

interface CloseIncidentDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_WORDS = 100;

export default function CloseIncidentDrawer({
  visible,
  onClose,
}: CloseIncidentDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const {incidentState, clearIncident} = useIncidentStore();
  const router = useRouter();

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

  if (!visible) return null;

  const handleSubmit = async () => {
    try {
      onClose();
      router.push("/(responding)/pending-close");
    } catch (error) {
      console.error("Error clearing incident:", error);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Text style={[styles.star, i <= rating ? styles.starFilled : {}]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

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
            <View style={styles.header}>
              <Text style={styles.title}>CLOSE INCIDENT</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Please help us improve our service by providing more details about
              your experience.
            </Text>

            <View style={styles.dispatcherContainer}>
              <View style={styles.dispatcherImageContainer}>
                <Image
                  source={require("@/assets/images/avatar.png")}
                  style={styles.dispatcherImage}
                />
              </View>
              <Text style={styles.dispatcherName}>
                "{incidentState?.lgu?.firstName}"
              </Text>
              <Text style={styles.dispatcherRole}>
                Emergency Dispatch Operator
              </Text>
            </View>

            <View style={styles.ratingContainer}>{renderStars()}</View>
            <Text style={styles.ratingText}>Please rate your dispatcher</Text>

            <Text style={styles.messageLabel}>Message</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Not more than 100 words."
              placeholderTextColor="#888"
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  drawer: {
    backgroundColor: "white",
    width: "100%",
    maxHeight: "90%",
  },
  header: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{translateY: -12}],
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  dispatcherContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  dispatcherImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 5,
  },
  dispatcherImage: {
    width: "100%",
    height: "100%",
  },
  dispatcherName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  dispatcherRole: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 2,
  },
  star: {
    fontSize: 24,
    color: "#ddd",
    marginHorizontal: 3,
  },
  starFilled: {
    color: "#f1c40f",
  },
  ratingText: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 15,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
