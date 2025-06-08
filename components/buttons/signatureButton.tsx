import React, {useState} from "react";
import {TouchableOpacity, Text, StyleSheet, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SignatureModal} from "@/components/modals/signatureModal";

interface SignatureButtonProps {
  onSignatureSave: (signature: string) => void;
  title?: string;
  buttonText?: string;
}

export const SignatureButton: React.FC<SignatureButtonProps> = ({
  onSignatureSave,
  title = "Signature",
  buttonText = "Input Signature",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSaveSignature = (signature: string) => {
    onSignatureSave(signature);
    setIsModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>{buttonText}</Text>
        <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>

      <SignatureModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveSignature}
        title={title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
