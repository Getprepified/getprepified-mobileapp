import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth";

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "parent",
    schoolCode: "",
    parentCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    if (!formData.email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        ...(formData.schoolCode && { schoolCode: formData.schoolCode.trim() }),
        ...(formData.parentCode && { parentCode: formData.parentCode.trim() }),
      };

      await register(payload);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <Link href="/onboarding" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0C0A1C" />
            </Pressable>
          </Link>
          <Text style={styles.createAccountText}>Create Account</Text>
          <View style={styles.spacer} />
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Role Selection */}
        <View style={styles.roleSelectionContainer}>
          <Text style={styles.roleSelectionTitle}>I am a:</Text>
          <View style={styles.roleButtonsContainer}>
            <Pressable
              style={[
                styles.roleButton,
                formData.role === "student" && styles.roleButtonStudentActive,
                formData.role === "student" && styles.roleButtonStudentInactive,
              ]}
              onPress={() => handleInputChange("role", "student")}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={formData.role === "student" ? "#6D57FC" : "#9CA3AF"}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleTextActive,
                  formData.role === "student" && styles.roleTextInactive,
                ]}
              >
                Student
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.roleButton,
                formData.role === "parent" && styles.roleButtonParentActive,
                formData.role === "parent" && styles.roleButtonParentInactive,
              ]}
              onPress={() => handleInputChange("role", "parent")}
            >
              <Ionicons
                name="people-outline"
                size={24}
                color={formData.role === "parent" ? "#6D57FC" : "#9CA3AF"}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleTextActive,
                  formData.role === "parent" && styles.roleTextInactive,
                ]}
              >
                Parent
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.personalInfoContainer}>
          <Text style={styles.personalInfoTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange("fullName", value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.eyeIconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
            />
          </View>
        </View>

        {/* Optional Codes */}
        <View style={styles.optionalCodesContainer}>
          <Text style={styles.optionalCodesTitle}>
            Optional: Link Your Account
          </Text>
          <Text style={styles.optionalCodesDescription}>
            {formData.role === "student"
              ? "Enter school or parent codes to link your account (you can do this later)"
              : "You will receive a parent code after registration to share with your children"}
          </Text>

          {formData.role === "student" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>School Code (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.schoolCode}
                  onChangeText={(value) =>
                    handleInputChange("schoolCode", value)
                  }
                  placeholder="Enter school code"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent Code (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.parentCode}
                  onChangeText={(value) =>
                    handleInputChange("parentCode", value)
                  }
                  placeholder="Enter parent code"
                  autoCapitalize="characters"
                />
              </View>
            </>
          )}
        </View>

        {/* Register Button */}
        <Pressable
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </Pressable>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  createAccountText: {
    fontSize: 18,
    fontFamily: "Urbanist",
    fontWeight: "semibold",
    color: "#0C0A1C",
  },
  spacer: {
    width: 32,
  },
  formContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  roleSelectionContainer: {
    marginBottom: 24,
  },
  roleSelectionTitle: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#0C0A1C",
    marginBottom: 16,
  },
  roleButtonsContainer: {
    flexDirection: "row",
    // space-x-4
  },
  roleButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  roleButtonStudentActive: {
    borderColor: "#6D57FC",
    backgroundColor: "rgba(109,87,252,0.1)",
  },
  roleButtonStudentInactive: {
    borderColor: "#E5E7EB",
  },
  roleButtonParentActive: {
    borderColor: "#6D57FC",
    backgroundColor: "rgba(109,87,252,0.1)",
  },
  roleButtonParentInactive: {
    borderColor: "#E5E7EB",
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleTextActive: {
    marginTop: 8,
    fontFamily: "Urbanist",
    fontWeight: "semibold",
    color: "#6D57FC",
  },
  roleTextInactive: {
    marginTop: 8,
    fontFamily: "Urbanist",
    fontWeight: "semibold",
    color: "#6B7280",
  },
  personalInfoContainer: {
    marginBottom: 24,
  },
  personalInfoTitle: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#0C0A1C",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#261E58",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: "Inter",
    color: "#0C0A1C",
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: "Inter",
    color: "#0C0A1C",
    paddingRight: 48,
  },
  eyeIconContainer: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  optionalCodesContainer: {
    marginBottom: 32,
  },
  optionalCodesTitle: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#0C0A1C",
    marginBottom: 16,
  },
  optionalCodesDescription: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "rgba(38,30,88,0.7)",
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: "#6D57FC",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Urbanist",
    fontWeight: "bold",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  loginText: {
    color: "#261E58",
    fontFamily: "Inter",
  },
  loginLink: {
    color: "#6D57FC",
    fontFamily: "Urbanist",
    fontWeight: "semibold",
  },
});
