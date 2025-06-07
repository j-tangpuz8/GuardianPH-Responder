import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, {useState} from "react";
import Spinner from "react-native-loading-spinner-overlay";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "expo-router";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {onLogin} = useAuth();

  const logIn = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    setLoading(true);
    try {
      console.log(
        "Attempting login with URL:",
        process.env.EXPO_PUBLIC_API_URL
      );
      const result = await onLogin!(email, password);

      if (result?.error) {
        Alert.alert("Error", result.msg);
        return;
      }

      console.log("Login successful:", result);
    } catch (err) {
      console.error("Login error details:", err);
      Alert.alert(
        "Error",
        "Server connection failed. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSubmitEditing = () => {
    if (email && password) {
      logIn();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        barStyle="default"
        backgroundColor="transparent"
        translucent
      />
      <Spinner visible={loading} />

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <View style={styles.topHalf}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/banner-icon.png")}
                style={styles.logoImage}
              />
              <View>
                <Text style={styles.header}>GuardianPH V3</Text>
                <Text style={styles.subHeader}>RESPONDER</Text>
              </View>
            </View>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              autoCapitalize="none"
              placeholder="Username"
              value={email}
              onChangeText={setEmail}
              style={styles.textField}
              placeholderTextColor="gray"
              returnKeyType="next"
            />
            <TextInput
              value={password}
              placeholder="Password"
              onChangeText={setPassword}
              style={styles.textField}
              placeholderTextColor="gray"
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={handleSubmitEditing}
            />

            <TouchableOpacity onPress={logIn} style={styles.buttonLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Forgot Password</Text>
              </TouchableOpacity>
              {/* <Text style={styles.linkDivider}>|</Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
  },
  topHalf: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#1B4965",
    padding: 20,
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  logoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoBox: {
    width: 35,
    height: 35,
    borderRadius: 8,
  },
  header: {
    fontSize: 24,
    color: "#215a75",
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#215a75",
    fontWeight: "400",
  },
  textField: {
    marginVertical: 6,
    height: 45,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "#fff",
  },

  buttonLogin: {
    marginTop: 20,
    backgroundColor: "#1B4965",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 0.3,
    borderColor: "white",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    gap: 8,
  },
  linkText: {
    color: "#fff",
    fontSize: 14,
  },
  linkDivider: {
    color: "#fff",
  },
});
