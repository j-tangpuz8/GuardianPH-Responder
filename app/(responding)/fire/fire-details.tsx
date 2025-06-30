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
import {useIncidentStore} from "@/context";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {SignatureButton} from "@/components/buttons/signatureButton";

export default function FireDetails() {
  const {incidentState} = useIncidentStore();
  const router = useRouter();

  // Section visibility state
  const [sectionVisibility, setSectionVisibility] = useState({
    incidentInfo: false,
    responseTeam: false,
    sceneDetails: false,
    investigation: false,
    signatures: false,
  });

  // Checkbox state for Type of Incident
  const [incidentTypes, setIncidentTypes] = useState({
    structure: false,
    vehicle: false,
    grass: false,
    electrical: false,
    falseAlarm: false,
    rescue: false,
    hazmat: false,
    other: "",
  });
  // Checkbox state for Nature of Fire
  const [natureTypes, setNatureTypes] = useState({
    accidental: false,
    intentional: false,
    electrical: false,
    cooking: false,
    unknown: false,
    other: "",
  });

  // Scene Details state
  const [sceneDetails, setSceneDetails] = useState({
    fireOriginLocation: "",
    damageExtent: {
      minor: false,
      moderate: false,
      major: false,
      totalLoss: false,
    },
    propertyValueAffected: "",
    propertyValueSaved: "",
    casualties: {
      none: false,
      injured: "",
      fatalities: "",
      details: "",
    },
    rescuesMade: {
      none: false,
      yes: false,
      numberOfPersons: "",
      remarks: "",
    },
    witnessStatements: {
      yes: false,
      no: false,
    },
    suspectedCause: "",
    initialFindings: "",
  });

  // Signatures state
  const [signatures, setSignatures] = useState({
    incidentCommanderName: "",
    incidentCommanderSignature: "",
    reportingOfficerName: "",
    reportingOfficerSignature: "",
    submissionDateTime: "",
  });

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

  function CustomCheckbox({
    value,
    onValueChange,
    label,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
    label: string;
  }) {
    return (
      <Pressable
        style={styles.checkboxRow}
        onPress={() => onValueChange(!value)}
        accessibilityRole="checkbox"
        accessibilityState={{checked: value}}>
        <Ionicons
          name={value ? "checkbox" : "square-outline"}
          size={22}
          color="white"
          style={{marginRight: 6}}
        />
        <Text style={styles.checkboxLabel}>{label}</Text>
      </Pressable>
    );
  }

  const toggleSection = (section: keyof typeof sectionVisibility) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({
    title,
    icon,
    iconColor,
    sectionKey,
    children,
  }: {
    title: string;
    icon: string;
    iconColor: string;
    sectionKey: keyof typeof sectionVisibility;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => toggleSection(sectionKey)}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name={icon as any}
            size={20}
            color={iconColor}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={sectionVisibility[sectionKey] ? "chevron-up" : "chevron-down"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
      {sectionVisibility[sectionKey] && children}
    </View>
  );

  const handleAgreeAndSave = () => {
    // Handle form submission here
    console.log("Form data:", {
      incidentTypes,
      natureTypes,
      sceneDetails,
      signatures,
    });
    // You can add your save logic here
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

      {/* Date and Incident Times */}
      <View style={styles.section}>
        <Text style={styles.sectionText}>
          <Text style={{fontWeight: "bold"}}>Date of Incident: </Text>March 14,
          2025
        </Text>
        <View style={{marginTop: 10}}>
          <Text style={styles.sectionText}>Time of Dispatched: 13:00</Text>
          <Text style={styles.sectionText}>Time of Arrival: 13:11</Text>
          <Text style={styles.sectionText}>Time Fire Controlled: 13:43</Text>
          <Text style={styles.sectionText}>Time Cleared: 14:03</Text>
        </View>
      </View>

      {/* Incident Information */}
      <CollapsibleSection
        title="Incident Information"
        icon="flame"
        iconColor="#FFA726"
        sectionKey="incidentInfo">
        {/* Type of Incident */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Type of Incident</Text>
          <View style={styles.checkboxGrid}>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={incidentTypes.structure}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, structure: v}))
                }
                label="Structure Fire"
              />
              <CustomCheckbox
                value={incidentTypes.vehicle}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, vehicle: v}))
                }
                label="Vehicle Fire"
              />
              <CustomCheckbox
                value={incidentTypes.grass}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, grass: v}))
                }
                label="Grass/Brush Fire"
              />
              <CustomCheckbox
                value={incidentTypes.electrical}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, electrical: v}))
                }
                label="Electrical Fire"
              />
            </View>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={incidentTypes.falseAlarm}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, falseAlarm: v}))
                }
                label="False Alarm"
              />
              <CustomCheckbox
                value={incidentTypes.rescue}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, rescue: v}))
                }
                label="Rescue"
              />
              <CustomCheckbox
                value={incidentTypes.hazmat}
                onValueChange={(v) =>
                  setIncidentTypes((t) => ({...t, hazmat: v}))
                }
                label="HazMat"
              />
            </View>
          </View>
          <View style={styles.otherInputContainer}>
            <Text style={styles.inputLabel}>Other:</Text>
            <TextInput
              style={styles.otherInput}
              value={incidentTypes.other}
              onChangeText={(text) =>
                setIncidentTypes((t) => ({...t, other: text}))
              }
              placeholder="Specify other type..."
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Incident Location */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Incident Location</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.fullWidthInput}
              placeholder="Enter complete address..."
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Barangay / City / Municipality
            </Text>
            <TextInput
              style={styles.fullWidthInput}
              placeholder="Enter barangay, city, or municipality..."
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Nature of Fire */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Nature of Fire</Text>
          <View style={styles.checkboxGrid}>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={natureTypes.accidental}
                onValueChange={(v) =>
                  setNatureTypes((t) => ({...t, accidental: v}))
                }
                label="Accidental"
              />
              <CustomCheckbox
                value={natureTypes.intentional}
                onValueChange={(v) =>
                  setNatureTypes((t) => ({...t, intentional: v}))
                }
                label="Intentional"
              />
              <CustomCheckbox
                value={natureTypes.electrical}
                onValueChange={(v) =>
                  setNatureTypes((t) => ({...t, electrical: v}))
                }
                label="Electrical"
              />
            </View>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={natureTypes.cooking}
                onValueChange={(v) =>
                  setNatureTypes((t) => ({...t, cooking: v}))
                }
                label="Cooking"
              />
              <CustomCheckbox
                value={natureTypes.unknown}
                onValueChange={(v) =>
                  setNatureTypes((t) => ({...t, unknown: v}))
                }
                label="Unknown"
              />
            </View>
          </View>
          <View style={styles.otherInputContainer}>
            <Text style={styles.inputLabel}>Other:</Text>
            <TextInput
              style={styles.otherInput}
              value={natureTypes.other}
              onChangeText={(text) =>
                setNatureTypes((t) => ({...t, other: text}))
              }
              placeholder="Specify other nature..."
              placeholderTextColor="#888"
            />
          </View>
        </View>
      </CollapsibleSection>

      {/* Fire Response Team & Apparatus Deployed */}
      <CollapsibleSection
        title="Fire Response Team & Apparatus Deployed"
        icon="people"
        iconColor="#FFD600"
        sectionKey="responseTeam">
        {/* Fire Response Team Table */}
        <View style={styles.subsection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 5,
            }}>
            <Ionicons
              name="person"
              size={20}
              color="#FFD600"
              style={{marginRight: 6}}
            />
            <Ionicons
              name="bus"
              size={20}
              color="#FFD600"
              style={{marginRight: 6}}
            />
            <Text style={styles.subsectionTitle}>Fire Response Team</Text>
          </View>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Name</Text>
            <Text style={styles.tableHeader}>Rank/Position</Text>
            <Text style={styles.tableHeader}>Unit/Station</Text>
            <Text style={styles.tableHeader}>Tasks Assigned</Text>
          </View>
          {/* Mock Data Rows */}
          {[
            {
              name: "Juan Dela Cruz",
              rank: "Captain",
              unit: "Station 1",
              tasks: "Command",
            },
            {
              name: "Maria Santos",
              rank: "Firefighter",
              unit: "Station 1",
              tasks: "Hose Operator",
            },
            {
              name: "Jose Ramos",
              rank: "Driver",
              unit: "Station 2",
              tasks: "Pump Operator",
            },
          ].map((member, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCell}>{member.name}</Text>
              <Text style={styles.tableCell}>{member.rank}</Text>
              <Text style={styles.tableCell}>{member.unit}</Text>
              <Text style={styles.tableCell}>{member.tasks}</Text>
            </View>
          ))}
        </View>

        {/* Apparatus Deployed Table */}
        <View style={styles.subsection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 5,
            }}>
            <Ionicons
              name="bus"
              size={20}
              color="#29B6F6"
              style={{marginRight: 6}}
            />
            <Text style={styles.subsectionTitle}>Apparatus Deployed</Text>
          </View>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Unit Plate No. / ID</Text>
            <Text style={styles.tableHeader}>Water Used (liters)</Text>
            <Text style={styles.tableHeader}>Foam Used (liters)</Text>
            <Text style={styles.tableHeader}>Personnel</Text>
          </View>
          {/* Mock Data Rows */}
          {[
            {plate: "ABC-1234", water: "500", foam: "0", personnel: "5"},
            {plate: "XYZ-5678", water: "300", foam: "20", personnel: "3"},
          ].map((app, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCell}>{app.plate}</Text>
              <Text style={styles.tableCell}>{app.water}</Text>
              <Text style={styles.tableCell}>{app.foam}</Text>
              <Text style={styles.tableCell}>{app.personnel}</Text>
            </View>
          ))}
        </View>
      </CollapsibleSection>

      {/* Scene Details */}
      <CollapsibleSection
        title="Scene Details"
        icon="location"
        iconColor="#27AE60"
        sectionKey="sceneDetails">
        {/* Fire Origin Location */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Fire Origin Location</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Room, Floor, Area</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={sceneDetails.fireOriginLocation}
              onChangeText={(text) =>
                setSceneDetails((s) => ({...s, fireOriginLocation: text}))
              }
              placeholder="Specify the exact location where fire originated..."
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Extent of Fire Damage */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Extent of Fire Damage</Text>
          <View style={styles.checkboxGrid}>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.damageExtent.minor}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    damageExtent: {...s.damageExtent, minor: v},
                  }))
                }
                label="Minor"
              />
              <CustomCheckbox
                value={sceneDetails.damageExtent.moderate}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    damageExtent: {...s.damageExtent, moderate: v},
                  }))
                }
                label="Moderate"
              />
            </View>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.damageExtent.major}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    damageExtent: {...s.damageExtent, major: v},
                  }))
                }
                label="Major"
              />
              <CustomCheckbox
                value={sceneDetails.damageExtent.totalLoss}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    damageExtent: {...s.damageExtent, totalLoss: v},
                  }))
                }
                label="Total Loss"
              />
            </View>
          </View>
        </View>

        {/* Property Values */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Property Assessment</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Estimated Value of Property Affected (₱)
            </Text>
            <TextInput
              style={styles.fullWidthInput}
              value={sceneDetails.propertyValueAffected}
              onChangeText={(text) =>
                setSceneDetails((s) => ({...s, propertyValueAffected: text}))
              }
              placeholder="Enter estimated value..."
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Value Saved (₱)</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={sceneDetails.propertyValueSaved}
              onChangeText={(text) =>
                setSceneDetails((s) => ({...s, propertyValueSaved: text}))
              }
              placeholder="Enter estimated value saved..."
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Casualties */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Casualties</Text>
          <CustomCheckbox
            value={sceneDetails.casualties.none}
            onValueChange={(v) =>
              setSceneDetails((s) => ({
                ...s,
                casualties: {...s.casualties, none: v},
              }))
            }
            label="None"
          />
          <View style={styles.casualtyInputRow}>
            <View style={styles.casualtyInput}>
              <Text style={styles.inputLabel}>Injured</Text>
              <TextInput
                style={styles.smallInput}
                value={sceneDetails.casualties.injured}
                onChangeText={(text) =>
                  setSceneDetails((s) => ({
                    ...s,
                    casualties: {...s.casualties, injured: text},
                  }))
                }
                placeholder="0"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.casualtyInput}>
              <Text style={styles.inputLabel}>Fatalities</Text>
              <TextInput
                style={styles.smallInput}
                value={sceneDetails.casualties.fatalities}
                onChangeText={(text) =>
                  setSceneDetails((s) => ({
                    ...s,
                    casualties: {...s.casualties, fatalities: text},
                  }))
                }
                placeholder="0"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Details (if any)</Text>
            <TextInput
              style={[styles.fullWidthInput, styles.textArea]}
              value={sceneDetails.casualties.details}
              onChangeText={(text) =>
                setSceneDetails((s) => ({
                  ...s,
                  casualties: {...s.casualties, details: text},
                }))
              }
              placeholder="Provide details about casualties..."
              placeholderTextColor="#888"
              multiline
            />
          </View>
        </View>

        {/* Rescues Made */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Rescues Made</Text>
          <View style={styles.checkboxGrid}>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.rescuesMade.none}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    rescuesMade: {...s.rescuesMade, none: v},
                  }))
                }
                label="None"
              />
            </View>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.rescuesMade.yes}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    rescuesMade: {...s.rescuesMade, yes: v},
                  }))
                }
                label="Yes"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>No. of persons rescued</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={sceneDetails.rescuesMade.numberOfPersons}
              onChangeText={(text) =>
                setSceneDetails((s) => ({
                  ...s,
                  rescuesMade: {...s.rescuesMade, numberOfPersons: text},
                }))
              }
              placeholder="Enter number of persons rescued..."
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Remarks</Text>
            <TextInput
              style={[styles.fullWidthInput, styles.textArea]}
              value={sceneDetails.rescuesMade.remarks}
              onChangeText={(text) =>
                setSceneDetails((s) => ({
                  ...s,
                  rescuesMade: {...s.rescuesMade, remarks: text},
                }))
              }
              placeholder="Additional remarks about rescues..."
              placeholderTextColor="#888"
              multiline
            />
          </View>
        </View>
      </CollapsibleSection>

      {/* Investigation Notes */}
      <CollapsibleSection
        title="Investigation Notes"
        icon="search"
        iconColor="#E67E22"
        sectionKey="investigation">
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>
            Witness/Owner Statements Taken
          </Text>
          <View style={styles.checkboxGrid}>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.witnessStatements.yes}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    witnessStatements: {...s.witnessStatements, yes: v},
                  }))
                }
                label="Yes"
              />
            </View>
            <View style={styles.checkboxColumn}>
              <CustomCheckbox
                value={sceneDetails.witnessStatements.no}
                onValueChange={(v) =>
                  setSceneDetails((s) => ({
                    ...s,
                    witnessStatements: {...s.witnessStatements, no: v},
                  }))
                }
                label="No"
              />
            </View>
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Suspected Cause of Fire</Text>
          <TextInput
            style={[styles.fullWidthInput, styles.textArea]}
            value={sceneDetails.suspectedCause}
            onChangeText={(text) =>
              setSceneDetails((s) => ({...s, suspectedCause: text}))
            }
            placeholder="Describe the suspected cause of fire..."
            placeholderTextColor="#888"
            multiline
          />
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Initial Findings</Text>
          <TextInput
            style={[styles.fullWidthInput, styles.textArea]}
            value={sceneDetails.initialFindings}
            onChangeText={(text) =>
              setSceneDetails((s) => ({...s, initialFindings: text}))
            }
            placeholder="Document initial findings and observations..."
            placeholderTextColor="#888"
            multiline
          />
        </View>
      </CollapsibleSection>

      {/* Signatures */}
      <CollapsibleSection
        title="Signatures"
        icon="create"
        iconColor="#9B59B6"
        sectionKey="signatures">
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Incident Commander</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={signatures.incidentCommanderName}
              onChangeText={(text) =>
                setSignatures((s) => ({...s, incidentCommanderName: text}))
              }
              placeholder="Enter incident commander name..."
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Signature</Text>
            <SignatureButton
              onSignatureSave={(signature) =>
                setSignatures((s) => ({
                  ...s,
                  incidentCommanderSignature: signature,
                }))
              }
              title="Incident Commander Signature"
              buttonText="Sign Here"
            />
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Reporting Officer</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.fullWidthInput}
              value={signatures.reportingOfficerName}
              onChangeText={(text) =>
                setSignatures((s) => ({...s, reportingOfficerName: text}))
              }
              placeholder="Enter reporting officer name..."
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Signature</Text>
            <SignatureButton
              onSignatureSave={(signature) =>
                setSignatures((s) => ({
                  ...s,
                  reportingOfficerSignature: signature,
                }))
              }
              title="Reporting Officer Signature"
              buttonText="Sign Here"
            />
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>
            Date & Time of Report Submission
          </Text>
          <TextInput
            style={styles.fullWidthInput}
            value={signatures.submissionDateTime}
            onChangeText={(text) =>
              setSignatures((s) => ({...s, submissionDateTime: text}))
            }
            placeholder="Enter submission date and time..."
            placeholderTextColor="#888"
          />
        </View>
      </CollapsibleSection>

      {/* AGREE & SAVE Button */}
      <TouchableOpacity style={styles.agreeButton} onPress={handleAgreeAndSave}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.agreeButtonText}>AGREE & SAVE</Text>
      </TouchableOpacity>

      <View style={{height: 30}} />
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
  fullWidthInput: {
    backgroundColor: "#ecf0f1",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#95a5a6",
    fontSize: 14,
    color: "#2c3e50",
  },
  textArea: {
    height: 60,
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
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableHeader: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#bbb",
    paddingVertical: 2,
  },
  tableCell: {
    color: "#fff",
    flex: 1,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionIcon: {
    marginRight: 8,
  },
  subsection: {
    marginBottom: 15,
    backgroundColor: "#34495e",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  subsectionTitle: {
    color: "#ecf0f1",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  checkboxGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxColumn: {
    flex: 1,
    paddingRight: 10,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    color: "#bdc3c7",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  otherInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#4a6741",
  },
  otherInput: {
    backgroundColor: "#ecf0f1",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#95a5a6",
    fontSize: 12,
    color: "#2c3e50",
    flex: 1,
    marginLeft: 8,
  },
  casualtyInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  casualtyInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  smallInput: {
    backgroundColor: "#ecf0f1",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#95a5a6",
    fontSize: 12,
    color: "#2c3e50",
    textAlign: "center",
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
    marginBottom: 10,
  },
  agreeButton: {
    backgroundColor: "#27AE60",
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  agreeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
