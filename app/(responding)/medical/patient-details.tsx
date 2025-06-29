import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, {useRef, useState} from "react";
import {useIncidentStore} from "@/context";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import {SignatureButton} from "@/components/buttons/signatureButton";
import Toast from "react-native-toast-message";

export default function PatientDetailsForm() {
  const {incidentState} = useIncidentStore();
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
      Toast.show({
        type: "success",
        text1: "Patient Details Saved",
      });
      router.replace("/(responding)/medical/vital-signs");
    } catch (error) {
      console.error("Error saving patient details:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PATIENT DETAILS</Text>
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
          {incidentState?.incidentDetails?.location || "Location unavailable"}
        </Text>
        <Text style={styles.locationText}>
          {currentDate}, {currentTime}
        </Text>
      </View>

      {/* Patient Info */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="FIRST NAME"
          value={patientData.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="LAST NAME"
          value={patientData.lastName}
          onChangeText={(text) => handleChange("lastName", text)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="AGE"
          keyboardType="numeric"
          value={patientData.age}
          onChangeText={(text) => handleChange("age", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="GENDER"
          value={patientData.gender}
          onChangeText={(text) => handleChange("gender", text)}
        />
      </View>

      {/* Assessment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assessment Summary:</Text>
        <Text style={styles.sectionText}>
          The patient was evaluated by EMS personnel and the following was
          noted:
        </Text>

        <CustomCheckbox
          value={patientData.isConscious}
          onValueChange={(value) => handleChange("isConscious", value)}
          label="Conscious and alert"
        />

        <CustomCheckbox
          value={patientData.isOriented}
          onValueChange={(value) => handleChange("isOriented", value)}
          label="Oriented to time, place, and person"
        />

        <CustomCheckbox
          value={patientData.noLifeThreat}
          onValueChange={(value) => handleChange("noLifeThreat", value)}
          label="No apparent life-threatening condition"
        />

        <CustomCheckbox
          value={patientData.refusesTransport}
          onValueChange={(value) => handleChange("refusesTransport", value)}
          label="Refuses recommended transport to a medical facility"
        />
      </View>

      {/* Explanation of Risks */}
      {patientData.refusesTransport && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explanation of Risks:</Text>
            <Text style={styles.sectionText}>
              I, the undersigned, understand that:
            </Text>
            <Text style={styles.sectionText}>
              I have been advised by EMS personnel to be transported to a
              hospital for further medical evaluation and/or treatment.
            </Text>
            <Text style={styles.sectionText}>
              EMS personnel have explained the potential risks of refusing
              transport, which may include serious health deterioration,
              permanent injury, or death.
            </Text>
            <Text style={styles.sectionText}>
              Refusing treatment or transport is against medical advice.
            </Text>
            <Text style={styles.sectionText}>
              Despite this, I decline transport to a hospital by
            </Text>
          </View>

          {/* Acknowledgment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acknowledgment:</Text>
            <Text style={styles.sectionText}>
              I understand the risks and implications of my decision. I release
              the EMS crew, ambulance service, and their affiliates from any
              liability resulting from my refusal.
            </Text>

            <View style={styles.signatureContainer}>
              <SignatureButton
                onSignatureSave={(signature) =>
                  handleChange("patientSignature", signature)
                }
                title="Patient Signature"
              />
            </View>

            <Text style={styles.dateText}>
              {currentDate}, {currentTime}
            </Text>

            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="Witness (EMS Personnel)"
              value={patientData.witnessName}
              onChangeText={(text) => handleChange("witnessName", text)}
            />

            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="ID/Badge No."
              value={patientData.idBadge}
              onChangeText={(text) => handleChange("idBadge", text)}
            />

            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="Additional Witness (if any)"
              value={patientData.additionalWitness}
              onChangeText={(text) => handleChange("additionalWitness", text)}
            />

            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="Relationship"
              value={patientData.relationship}
              onChangeText={(text) => handleChange("relationship", text)}
            />

            <CustomCheckbox
              value={patientData.advisedToSeekHelp}
              onValueChange={(value) =>
                handleChange("advisedToSeekHelp", value)
              }
              label="Patient was advised to seek medical attention immediately if symptoms worsen."
            />

            <CustomCheckbox
              value={patientData.refusedToSign}
              onValueChange={(value) => handleChange("refusedToSign", value)}
              label="Patient refused to sign (explain below):"
            />

            <TextInput
              style={[styles.input, styles.fullWidthInput, styles.textArea]}
              placeholder="Explain"
              multiline
              numberOfLines={3}
              value={patientData.refusalExplanation}
              onChangeText={(text) => handleChange("refusalExplanation", text)}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <TextInput
              style={[styles.input, styles.fullWidthInput, styles.textArea]}
              placeholder="Explain"
              multiline
              numberOfLines={4}
              value={patientData.notes}
              onChangeText={(text) => handleChange("notes", text)}
            />
          </View>
        </>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleProceed}>
        <Text style={styles.submitButtonText}>PROCEED</Text>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  signatureContainer: {
    marginVertical: 10,
    borderRadius: 5,
  },
  signature: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  header: {
    backgroundColor: "#4285F4",
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
    marginVertical: 2,
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
