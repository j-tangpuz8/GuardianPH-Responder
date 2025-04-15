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
    // vital sign formData
    bp: "",
    hr: "",
    rr: "",
    spo2: "",
    temperature: "",
    bloodGlucose: "",
    painLevel: "",
    levelOfConsciousness: "",
    // monitoring notes
    cardiacRhythm: "",
    pupilSize: "",
    skinSigns: "",
    // handover details
    timeOfFinalVitals: "",
    timeOfHandover: "",
    receivingDoctor: "",
    erNurse: "",
    emsTeamLeader: "",
    emsSignature: "",
    emsDateTime: "",
    receivingDoctorName: "",
    receivingDoctorSignature: "",
    receivingDateTime: "",
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("vitals"); // 'vitals' or 'handover'

  const handleChange = (field: string, value: string | boolean) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

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

      <View>
        {/* Patient info header */}
        <View style={styles.patientNameHeader}>
          <Text style={styles.patientNameText}>
            {volunteerInfo?.firstName?.toUpperCase()}{" "}
            {volunteerInfo?.lastName?.toUpperCase()}
          </Text>
          <Text style={styles.textSubheading}>25 yrs old - Male</Text>
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

          <Text style={styles.sectionTitle}>Monitoring/ Notes:</Text>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Cardiac rhythm</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={2}
            value={patientData.cardiacRhythm}
            onChangeText={(text) => handleChange("cardiacRhythm", text)}
          />

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Pupil size and reactivity</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={2}
            value={patientData.pupilSize}
            onChangeText={(text) => handleChange("pupilSize", text)}
          />

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>
              Skin signs (color, temperature, moisture)
            </Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={2}
            value={patientData.skinSigns}
            onChangeText={(text) => handleChange("skinSigns", text)}
          />
        </View>
      </View>

      <View style={styles.handoverSection}>
        <Text style={styles.handoverSectionTitle}>Vital Signs En Route:</Text>
        <View style={styles.vitalSignsEnRoute}>
          <View style={styles.enRouteInputRow}>
            <View style={styles.enRouteInputGroup}>
              <Text style={styles.enRouteLabel}>BP:</Text>
              <TextInput
                style={styles.enRouteInput}
                value={patientData.bp}
                onChangeText={(text) => handleChange("bp", text)}
                placeholder="mmHg"
                placeholderTextColor="#7f8c8d"
              />
            </View>

            <View style={styles.enRouteInputGroup}>
              <Text style={styles.enRouteLabel}>HR:</Text>
              <TextInput
                style={styles.enRouteInput}
                value={patientData.hr}
                onChangeText={(text) => handleChange("hr", text)}
                placeholder="bpm"
                placeholderTextColor="#7f8c8d"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.enRouteInputGroup}>
              <Text style={styles.enRouteLabel}>RR:</Text>
              <TextInput
                style={styles.enRouteInput}
                value={patientData.rr}
                onChangeText={(text) => handleChange("rr", text)}
                placeholder="bpm"
                placeholderTextColor="#7f8c8d"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.enRouteInputGroup}>
              <Text style={styles.enRouteLabel}>SpO₂:</Text>
              <TextInput
                style={styles.enRouteInput}
                value={patientData.spo2}
                onChangeText={(text) => handleChange("spo2", text)}
                placeholder="%"
                placeholderTextColor="#7f8c8d"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <TextInput
          style={styles.handoverInput}
          placeholder="Time of Final Vitals"
          value={patientData.timeOfFinalVitals}
          onChangeText={(text) => handleChange("timeOfFinalVitals", text)}
        />

        <Text style={styles.handoverSectionTitle}>
          PATIENT HANDOVER DETAILS
        </Text>

        <TextInput
          style={styles.handoverInput}
          placeholder="Time of Handover to ER"
          value={patientData.timeOfHandover}
          onChangeText={(text) => handleChange("timeOfHandover", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Receiving Doctor / Physician"
          value={patientData.receivingDoctor}
          onChangeText={(text) => handleChange("receivingDoctor", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="ER Nurse (if present)"
          value={patientData.erNurse}
          onChangeText={(text) => handleChange("erNurse", text)}
        />

        <Text style={styles.handoverSectionTitle}>SIGNATURES</Text>

        <TextInput
          style={styles.handoverInput}
          placeholder="EMS Team Leader"
          value={patientData.emsTeamLeader}
          onChangeText={(text) => handleChange("emsTeamLeader", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Signature"
          value={patientData.emsSignature}
          onChangeText={(text) => handleChange("emsSignature", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Date & Time"
          value={patientData.emsDateTime}
          onChangeText={(text) => handleChange("emsDateTime", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Receiving Doctor"
          value={patientData.receivingDoctorName}
          onChangeText={(text) => handleChange("receivingDoctorName", text)}
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Signature"
          value={patientData.receivingDoctorSignature}
          onChangeText={(text) =>
            handleChange("receivingDoctorSignature", text)
          }
        />

        <TextInput
          style={styles.handoverInput}
          placeholder="Date & Time"
          value={patientData.receivingDateTime}
          onChangeText={(text) => handleChange("receivingDateTime", text)}
        />

        <TouchableOpacity style={styles.handoverButton}>
          <Text style={styles.handoverButtonText}>HANDOVER</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  handoverSection: {
    paddingHorizontal: 15,
  },
  handoverSectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  vitalSignsEnRoute: {
    backgroundColor: "#34495e",
    padding: 10,
    borderRadius: 3,
    marginBottom: 10,
  },
  enRouteText: {
    color: "white",
    fontSize: 14,
  },
  handoverInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 3,
    marginBottom: 10,
    fontSize: 16,
  },
  handoverButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  handoverButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  enRouteInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  enRouteInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  enRouteLabel: {
    color: "white",
    fontSize: 14,
    marginRight: 5,
  },
  enRouteInput: {
    backgroundColor: "#34495e",
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#3498db",
    padding: 2,
    width: 50,
    fontSize: 14,
  },
});
