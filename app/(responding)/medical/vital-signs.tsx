import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

export default function VitalSigns() {
  const [patientData, setPatientData] = useState({
    // vital sign formData
    bp: "",
    hr: "",
    rr: "",
    spo2: "",
    temperature: "",
    bloodGlucose: "",
    painLevel: "",
    levelOfConsciousness: "",
  });
  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      await SecureStore.setItemAsync(
        "vitalSignsData",
        JSON.stringify(patientData)
      );
      Toast.show({
        type: "success",
        text1: "Vital Signs Saved",
      });
      router.replace("/(responding)/medical/handover-vital-signs");
    } catch (error) {
      console.error("Error saving vital signs:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ONSCENE VITAL SIGNS</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons
            name="close-circle"
            size={24}
            color="white"
            onPress={() => router.replace("/")}
          />
        </TouchableOpacity>
      </View>
      {/* Patient info header */}
      <View style={styles.patientNameHeader}>
        <Text style={styles.patientNameText}>Input values here:</Text>
      </View>

      {/* Vital Signs Form */}
      <View style={styles.formSection}>
        <View style={styles.formRowDouble}>
          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Heart Rate:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="bpm"
              value={patientData.hr}
              onChangeText={(text) => handleChange("hr", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Respiratory Rate:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="bpm"
              value={patientData.rr}
              onChangeText={(text) => handleChange("rr", text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRowDouble}>
          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Blood Pressure:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="mmHg"
              value={patientData.bp}
              onChangeText={(text) => handleChange("bp", text)}
            />
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>SpO2:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="%"
              value={patientData.spo2}
              onChangeText={(text) => handleChange("spo2", text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRowDouble}>
          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Temperature:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="°C"
              value={patientData.temperature}
              onChangeText={(text) => handleChange("temperature", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Blood Glucose:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="mg/dL"
              value={patientData.bloodGlucose}
              onChangeText={(text) => handleChange("bloodGlucose", text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRowDouble}>
          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Pain Level:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="/10"
              value={patientData.painLevel}
              onChangeText={(text) => handleChange("painLevel", text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.formLabel}>Consciousness Level:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="AVPU"
              value={patientData.levelOfConsciousness}
              onChangeText={(text) =>
                handleChange("levelOfConsciousness", text)
              }
            />
          </View>
        </View>
      </View>
      <View style={styles.spacer}></View>

      {/* save patient detailsv button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
        <Text style={styles.submitButtonText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  header: {
    backgroundColor: "#4285F4",
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 10,
  },
  submitButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  spacer: {
    height: 50,
  },
  patientNameHeader: {
    backgroundColor: "#2c3e50",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
  },
  patientNameText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  textSubheading: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  formSection: {
    padding: 15,
  },
  formRow: {
    marginBottom: 10,
  },
  formLabel: {
    color: "white",
    fontSize: 16,
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 3,
    fontSize: 16,
  },

  textArea: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 3,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 60,
    marginBottom: 15,
  },

  formRowDouble: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  formColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
});
