import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./contexts/UserContext";
import { Logger } from "./utils/logger";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'parent'
  const [schoolCode, setSchoolCode] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    Logger.info("🔄 User attempting registration", { email, role });

    try {
      const registrationData: any = {
        fullName,
        email,
        password,
      };

      // Add role-specific fields
      if (role === "parent") {
        registrationData.role = "parent";
        registrationData.adminSecret =
          process.env.ADMIN_REGISTRATION_SECRET || "";
      }

      if (schoolCode) {
        registrationData.schoolCode = schoolCode;
      }

      if (parentCode) {
        registrationData.parentCode = parentCode;
      }

      const success = await register(registrationData);

      if (success) {
        Logger.info("✅ Registration successful, navigating to dashboard");

        if (role === "parent") {
          Alert.alert(
            "Registration Successful",
            "You are now registered as a parent. Your parent code will be shown in your profile.",
            [{ text: "OK", onPress: () => router.replace("/dashboard") }]
          );
        } else {
          Alert.alert(
            "Registration Successful",
            "Welcome to GetPrep! You can now start learning.",
            [{ text: "OK", onPress: () => router.replace("/dashboard") }]
          );
        }
      } else {
        Logger.warn("❌ Registration failed");
        Alert.alert(
          "Registration Failed",
          "Registration failed. Please try again."
        );
      }
    } catch (error: any) {
      Logger.error("💥 Registration error occurred", error);
      Alert.alert(
        "Registration Failed",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Join GetPrep</Text>
        <Text style={styles.subtitle}>
          Create your account and start learning
        </Text>
      </View>

      {/* Form Section */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>I am registering as:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "student"
                  ? styles.roleButtonActive
                  : styles.roleButtonInactive,
              ]}
              onPress={() => setRole("student")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "student"
                    ? styles.roleButtonTextActive
                    : styles.roleButtonTextInactive,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "parent"
                  ? styles.roleButtonActive
                  : styles.roleButtonInactive,
              ]}
              onPress={() => setRole("parent")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "parent"
                    ? styles.roleButtonTextActive
                    : styles.roleButtonTextInactive,
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Conditional fields based on role */}
        {role === "student" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your school code"
                placeholderTextColor="#9CA3AF"
                value={schoolCode}
                onChangeText={setSchoolCode}
                autoCapitalize="characters"
              />
              <Text style={styles.helperText}>
                Get this code from your school administrator
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your parent's code"
                placeholderTextColor="#9CA3AF"
                value={parentCode}
                onChangeText={setParentCode}
                autoCapitalize="characters"
              />
              <Text style={styles.helperText}>
                Get this code from your parent
              </Text>
            </View>
          </>
        )}

        {role === "parent" && (
          <View style={styles.infoSection}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Parent Registration Info:</Text>
              <Text style={styles.infoText}>
                After registration, you'll receive a unique parent code that you
                can share with your child to link their account to yours.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>Sign In Instead</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkTextBold}>Sign in here</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#059669", // Emerald gradient start
  },
  header: {
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 16,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
  },
  roleButtonInactive: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  roleButtonText: {
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#059669",
  },
  roleButtonTextInactive: {
    color: "#6b7280",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
    fontSize: 16,
  },
  helperText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTitle: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  infoText: {
    color: "#1d4ed8",
    fontSize: 14,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#059669",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
  linkContainer: {
    marginBottom: 32,
  },
  linkText: {
    textAlign: "center",
    color: "#059669",
    fontSize: 16,
    fontWeight: "500",
  },
  linkTextBold: {
    fontWeight: "600",
  },
});

export default RegisterPage;
