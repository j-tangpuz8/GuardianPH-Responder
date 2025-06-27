import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, {useState} from "react";
import {useIncidentStore} from "@/context";

interface DenyIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  incidentId?: string;
}

export default function DenyIncidentModal({
  visible,
  onClose,
  onConfirm,
  incidentId,
}: DenyIncidentModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const {incidentState, setCurrentIncident, clearIncident} = useIncidentStore();

  const reasons = ["Crew not ready", "On Break", "Maintenance", "Specify"];

  const handleConfirm = () => {
    const finalReason =
      selectedReason === "Specify" ? customReason : selectedReason;

    onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerText}>DENY</Text>
            <Text style={styles.subHeaderText}>Specify denying response</Text>
          </View>

          <View style={styles.reasonsContainer}>
            {reasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.reasonRow}
                onPress={() => setSelectedReason(reason)}>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radio,
                      selectedReason === reason && styles.radioSelected,
                    ]}
                  />
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedReason === "Specify" && (
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason"
              placeholderTextColor="#fff"
              value={customReason}
              onChangeText={setCustomReason}
            />
          )}

          <TouchableOpacity
            style={[styles.sendButton, !selectedReason ? {opacity: 0.5} : {}]}
            onPress={handleConfirm}
            disabled={!selectedReason}>
            <Text style={styles.sendButtonText}>SEND</Text>
          </TouchableOpacity>
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
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#FF6B6B",
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  subHeaderText: {
    color: "white",
    fontSize: 16,
  },
  reasonsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioSelected: {
    backgroundColor: "white",
  },
  reasonText: {
    color: "white",
    fontSize: 16,
  },
  reasonInput: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    padding: 10,
    color: "white",
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
