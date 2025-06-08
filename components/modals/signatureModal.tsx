import React, {useRef} from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import {Ionicons} from "@expo/vector-icons";

interface SignatureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isVisible,
  onClose,
  onSave,
  title = "Signature",
}) => {
  const signatureRef = useRef(null);

  const handleSignature = (signature: string) => {
    onSave(signature);
    onClose();
  };

  const handleEmpty = () => {
    console.log("Signature pad is empty");
  };

  const handleClear = () => {
    // signatureRef.current?.clearSignature();
  };

  const handleEnd = () => {
    console.log("Signature drawing ended");
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              onClear={handleClear}
              onEnd={handleEnd}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText="Save"
              style={styles.signature}
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .m-signature-pad--body {
                  border: none;
                }
                .m-signature-pad--footer {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px;
                  background: #f8f8f8;
                }
              `}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2c3e50",
    width: Dimensions.get("window").width * 0.9,
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#4285F4",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  signatureContainer: {
    height: 300,
    backgroundColor: "white",
    margin: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  signature: {
    flex: 1,
  },
});
