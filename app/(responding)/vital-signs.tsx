import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useGetVolunteerInfo} from "@/hooks/useGetVolunteerInfo";
import {useGetUserInfo} from "@/hooks/useGetUserInfo";
import {useRouter} from "expo-router";

export default function VitalSigns() {
  const {volunteerInfo} = useGetVolunteerInfo();
  const {userInfo} = useGetUserInfo();
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    hospitalName: "",
    erTraumaUnit: "",
    arrivalDateTime: "",
    chiefComplaint: "",
    // vital sign formData
    bp: "",
    hr: "",
    rr: "",
    spo2: "",
    gcs: "",
    painScore: "",
    // pre-hospital intenventions
    cSpineImmobilization: false,
    oxygenAdministration: false,
  });
  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>VITAL SIGNS</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons
            name="close-circle"
            size={24}
            color="white"
            onPress={() => router.replace("/")}
          />
        </TouchableOpacity>
      </View>

      {/* patient info -  name, gender, age */}
      <View style={styles.patientInfoHeader}>
        <View style={styles.patientInfoRow}>
          <Text style={styles.patientInfoLabel}>FULL NAME:</Text>
          <Text style={styles.patientInfoValue}>
            {volunteerInfo?.firstName?.toUpperCase()}{" "}
            {volunteerInfo?.lastName?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.patientInfoRow}>
          <Text style={styles.patientInfoLabel}>AGE & GENDER:</Text>
          <View style={styles.ageGenderContainer}>
            <TextInput
              style={styles.ageInput}
              placeholder="Age"
              keyboardType="numeric"
              value={patientData.age}
              onChangeText={(text) => handleChange("age", text)}
            />
            <View style={styles.genderButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  patientData.gender === "Male" && styles.genderButtonActive,
                ]}
                onPress={() => handleChange("gender", "Male")}>
                <Text
                  style={[
                    styles.genderButtonText,
                    patientData.gender === "Male" &&
                      styles.genderButtonTextActive,
                  ]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  patientData.gender === "Female" && styles.genderButtonActive,
                ]}
                onPress={() => handleChange("gender", "Female")}>
                <Text
                  style={[
                    styles.genderButtonText,
                    patientData.gender === "Female" &&
                      styles.genderButtonTextActive,
                  ]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* hospital info */}
      <TextInput
        style={styles.formInput}
        placeholder="Hospital Name"
        value={patientData.hospitalName}
        onChangeText={(text) => handleChange("hospitalName", text)}
      />

      <TextInput
        style={styles.formInput}
        placeholder="ER/Trauma Unit"
        value={patientData.erTraumaUnit}
        onChangeText={(text) => handleChange("erTraumaUnit", text)}
      />

      <TextInput
        style={styles.formInput}
        placeholder="Date/Time of Arrival"
        value={patientData.arrivalDateTime}
        onChangeText={(text) => handleChange("arrivalDateTime", text)}
      />

      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="Chief Complaint / Mechanism of Injury"
        multiline
        numberOfLines={3}
        value={patientData.chiefComplaint}
        onChangeText={(text) => handleChange("chiefComplaint", text)}
      />

      {/* ambulance info */}
      <View style={styles.ambulanceContainer}>
        <View style={styles.ambulanceIconContainer}>
          <Image
            source={require("@/assets/images/AMBU.png")}
            style={{width: 80, height: 40, marginRight: 10}}
          />
        </View>
        <View style={styles.ambulanceTextContainer}>
          <Text style={styles.ambulanceText}>
            {userInfo?.firstName} {userInfo?.lastName}
          </Text>
          <Text style={styles.ambulanceSubtext}>
            Bantay Mandaue Command Center
          </Text>
        </View>
      </View>

      {/* preHospital checcboxes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pre-hospital Interventions:</Text>

        <CustomCheckbox
          value={patientData.cSpineImmobilization}
          onValueChange={(value) => handleChange("cSpineImmobilization", value)}
          label="C-spine Immobilization"
        />

        <CustomCheckbox
          value={patientData.oxygenAdministration}
          onValueChange={(value) => handleChange("oxygenAdministration", value)}
          label="Oxygen Administration"
        />
      </View>

      {/* onscene vital signs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vital Signs on Scene:</Text>

        <View style={styles.vitalSignsRow}>
          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>BP:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              value={patientData.bp}
              onChangeText={(text) => handleChange("bp", text)}
            />
          </View>

          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>HR:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              value={patientData.hr}
              onChangeText={(text) => handleChange("hr", text)}
            />
          </View>

          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>RR:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              value={patientData.rr}
              onChangeText={(text) => handleChange("rr", text)}
            />
          </View>
        </View>

        <View style={styles.vitalSignsRow}>
          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>SpO₂:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              placeholder="%"
              value={patientData.spo2}
              onChangeText={(text) => handleChange("spo2", text)}
            />
          </View>

          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>GCS:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              placeholder="/15"
              value={patientData.gcs}
              onChangeText={(text) => handleChange("gcs", text)}
            />
          </View>

          <View style={styles.vitalSignItem}>
            <Text style={styles.vitalSignsLabel}>Pain:</Text>
            <TextInput
              style={styles.vitalSignsInput}
              placeholder="/10"
              value={patientData.painScore}
              onChangeText={(text) => handleChange("painScore", text)}
            />
          </View>
        </View>
      </View>

      {/* save patient detailsv button */}
      <TouchableOpacity style={styles.submitButton}>
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
  patientInfoHeader: {
    backgroundColor: "#2c3e50",
    padding: 10,
  },
  patientInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3.5,
  },
  patientInfoLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  patientInfoValue: {
    color: "#e74c3c",
    fontSize: 20,
    fontWeight: "bold",
  },
  patientInfoInput: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#e74c3c",
    padding: 0,
    flex: 1,
  },
  ageGenderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  ageInput: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 15,
    textAlign: "center",
    backgroundColor: "white",
    padding: 5,
    width: 70,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  genderButtonsContainer: {
    flexDirection: "row",
  },
  genderButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  genderButtonActive: {
    backgroundColor: "#e74c3c",
  },
  genderButtonText: {
    color: "#e74c3c",
    fontSize: 14,
  },
  genderButtonTextActive: {
    color: "white",
  },
  formInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  ambulanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    padding: 10,
    paddingLeft: 35,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingBottom: 15,
  },
  ambulanceIconContainer: {
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  ambulanceTextContainer: {
    flex: 1,
  },
  ambulanceText: {
    color: "#e74c3c",
    fontSize: 18,
    fontWeight: "bold",
  },
  ambulanceSubtext: {
    color: "white",
    fontSize: 12,
  },
  section: {
    backgroundColor: "#2c3e50",
    padding: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
  vitalSignsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  vitalSignItem: {
    flex: 1,
    alignItems: "center",
  },
  vitalSignsLabel: {
    color: "white",
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  vitalSignsInput: {
    backgroundColor: "white",
    padding: 5,
    width: 70,
    borderRadius: 3,
    textAlign: "center",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
  },
  vitalSignsUnit: {
    color: "white",
    marginLeft: 2,
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
});
