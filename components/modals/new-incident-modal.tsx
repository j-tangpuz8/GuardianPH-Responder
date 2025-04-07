import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";

export default function NewIncidentModal() {
  return (
    <Modal transparent visible={true} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>NEW INCIDENT</Text>
          </View>
          <View style={styles.incidentDetails}>
            <Image
              source={require("@/assets/images/Medical.png")}
              style={styles.icon}
            />
            <View>
              <Text style={styles.incidentType}>MEDICAL</Text>
              <Text style={styles.incidentLocation}>
                A. S. Fortuna St, Mandaue City
              </Text>
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.respondButton}>
              <Text style={styles.buttonText}>Respond</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyButton}>
              <Text style={styles.buttonText}>Deny</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#34495e",
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    backgroundColor: "#FF6B6B",
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  incidentDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    padding: 15,
    width: "100%",
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  incidentType: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  incidentLocation: {
    color: "white",
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
  },
  respondButton: {
    flex: 3,
    backgroundColor: "#8BC34A",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  denyButton: {
    flex: 2,
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
