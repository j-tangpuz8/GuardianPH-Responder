import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, {useState} from "react";
import {useIncident} from "@/context/IncidentContext";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function FireDetails() {
  const {incidentState} = useIncident();
  const router = useRouter();
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    isConscious: false,
    isOriented: false,
    noLifeThreat: false,
    refusesTransport: false,
    patientSignature: "",
    witnessName: "",
    idBadge: "",
    additionalWitness: "",
    relationship: "",
    advisedToSeekHelp: false,
    refusedToSign: false,
    refusalExplanation: "",
    notes: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  /// custom checkbox
  const CustomCheckbox = ({
    value,
    onValueChange,
    label,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
    label: string;
  }) => (
    <View style={styles.checkboxRow}>
      <Pressable style={styles.checkbox} onPress={() => onValueChange(!value)}>
        {value ? (
          <Ionicons name="checkbox" size={24} color="white" />
        ) : (
          <Ionicons name="square-outline" size={24} color="white" />
        )}
      </Pressable>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  );

  const handleProceed = async () => {
    try {
      const essentialData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        age: patientData.age,
        gender: patientData.gender,
      };
      await SecureStore.setItemAsync(
        "patientDetailsData",
        JSON.stringify(essentialData)
      );
      router.replace("/(responding)/medical/vital-signs");
    } catch (error) {
      console.error("Error saving patient details:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>FIRE DETAILS</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons
            name="close-circle"
            size={24}
            color="white"
            onPress={() => router.replace("/")}
          />
        </TouchableOpacity>
      </View>

      {/* Location and Time */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {currentDate}, {currentTime}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  header: {
    backgroundColor: "#e74c3c",
    padding: 7,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  locationContainer: {
    backgroundColor: "#2c3e50",
    padding: 4,
    alignItems: "center",
  },
  locationText: {
    color: "white",
    fontSize: 14,
    marginVertical: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  fullWidthInput: {},
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  section: {
    backgroundColor: "#2c3e50",
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionText: {
    color: "white",
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    color: "white",
    flex: 1,
  },
  dateText: {
    color: "white",
    textAlign: "center",
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    margin: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  spacer: {
    height: 20,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 8,
  },
});
