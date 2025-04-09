import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import CloseIncidentDrawer from "./close-incident-drawer";

interface UpdateStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function UpdateStatusModal({
  visible,
  onClose,
}: UpdateStatusModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [currentStatus, setCurrentStatus] = useState("onscene");
  const [closeIncidentVisible, setCloseIncidentVisible] = useState(false);

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

  const handleStatusPress = (status: string) => {
    if (status === "close") {
      setCloseIncidentVisible(true);
    } else {
      setCurrentStatus(status);
    }
  };

  return (
    <>
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
              <Text style={styles.title}>UPDATE STATUS</Text>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentStatus === "onscene" && styles.activeButton,
                ]}
                onPress={() => handleStatusPress("onscene")}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "onscene" && styles.activeText,
                  ]}>
                  ONSCENE
                </Text>
                {currentStatus === "onscene" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentStatus === "medical" && styles.activeButton,
                ]}
                onPress={() => handleStatusPress("medical")}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "medical" && styles.activeText,
                  ]}>
                  MEDICAL FACILITY
                </Text>
                {currentStatus === "medical" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentStatus === "return" && styles.activeButton,
                ]}
                onPress={() => handleStatusPress("return")}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "return" && styles.activeText,
                  ]}>
                  RETURN TO BASE
                </Text>
                {currentStatus === "return" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  currentStatus === "close" && styles.activeButton,
                ]}
                onPress={() => handleStatusPress("close")}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "close" && styles.activeText,
                  ]}>
                  CLOSE INCIDENT
                </Text>

                {currentStatus === "close" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {closeIncidentVisible && (
        <CloseIncidentDrawer
          visible={closeIncidentVisible}
          onClose={() => setCloseIncidentVisible(false)}
        />
      )}
    </>
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
    backgroundColor: "#34495e",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
    maxHeight: "80%",
    opacity: 0.9,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#34495e",
    borderWidth: 1,
    borderColor: "white",
  },
  activeButton: {
    backgroundColor: "white",
  },
  statusText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  activeText: {
    color: "#34495e",
  },
  statusSubtext: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
});
