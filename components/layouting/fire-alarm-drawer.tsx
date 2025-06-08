import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import React, {useEffect, useRef} from "react";
import {useIncident} from "@/context/IncidentContext";
import {FIRE_ALARM_LEVELS_ARRAY} from "@/constants/fire-alarm-levels";

interface FireAlarmDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFireAlarm: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function FireAlarmDrawer({
  visible,
  onClose,
  onSelectFireAlarm,
}: FireAlarmDrawerProps) {
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

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdropArea} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={[styles.header, {backgroundColor: "#e74c3c"}]}>
          <Text style={styles.title}>ALARM LEVELS</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}>
          {FIRE_ALARM_LEVELS_ARRAY.map((item) => (
            <View key={item.key} style={styles.alarmItem}>
              <Text
                style={[
                  styles.fireLevel,
                  item.key === "UNDER CONTROL"
                    ? {color: "#FFA500"}
                    : item.key === "FIRE OUT"
                    ? {color: "#2ecc40"}
                    : null,
                ]}>
                {item.key}
              </Text>
              <Text style={styles.levelSubheading}>{item.subheading}</Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 155,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  backdropArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    backgroundColor: "#698894",
    width: "100%",
    maxHeight: "90%",
    flex: 1,
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
  alarmItem: {
    backgroundColor: "#34495e",
    marginVertical: 4,
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderColor: "#fff",
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  fireLevel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 1,
  },
  levelSubheading: {
    color: "#ecf0f1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
});
