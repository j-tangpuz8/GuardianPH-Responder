import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import React, {useEffect, useRef} from "react";
import {useIncident} from "@/context/IncidentContext";

interface MedicalFacilityDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFacility: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function MedicalFacilityDrawer({
  visible,
  onClose,
  onSelectFacility,
}: MedicalFacilityDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const {incidentState} = useIncident();

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

  const handleSelectHospital = () => {
    onSelectFacility();
    onClose();
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
              <Text style={styles.title}>MEDICAL FACILITY</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Hospital List */}
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.hospitalItem}>
                <View style={styles.hospitalInfo}>
                  {/* <View style={styles.cameraIcon}>
                    <Image
                      source={require("@/assets/images/video-camera.png")}
                      style={styles.cameraImage}
                    />
                  </View> */}
                  <View style={styles.hospitalDetails}>
                    <Text style={styles.hospitalName}>XYz Hospital</Text>
                    <View style={styles.hospitalMetrics}>
                      <Text style={styles.etaText}>
                        ETA <Text style={styles.metricValue}>4min</Text>
                      </Text>
                      <Text style={styles.disText}>
                        DIS <Text style={styles.metricValue}>600m</Text>
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.goButton}
                  onPress={handleSelectHospital}>
                  <Text style={styles.goButtonText}>GO</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 155,
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
    backgroundColor: "#3498db",
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: "70%",
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
  hospitalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#3498db",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cameraImage: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
  },
  hospitalMetrics: {
    flexDirection: "row",
    marginTop: 4,
  },
  etaText: {
    color: "#7f8c8d",
    marginRight: 15,
    fontSize: 14,
  },
  disText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  metricValue: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  goButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  goButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
