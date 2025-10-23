import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/UserContext";
import { Logger } from "../utils/logger";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webAccessModal, setWebAccessModal] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    Logger.info("🔄 User attempting login", { email });

    try {
      const result = await login(email, password);

      if (result.success && result.user) {
        Logger.info("✅ Login successful, checking user role");

        // Check if user role is allowed for mobile app (only parent and student)
        const allowedRoles = ["parent", "student"];
        if (!allowedRoles.includes(result.user.role)) {
          Logger.warn("🚫 Non-parent/student user attempted mobile login", {
            role: result.user.role,
          });
          setWebAccessModal(true);
          setIsLoading(false);
          return;
        }

        // Navigate based on role from login response
        if (result.user.role === "parent") {
          Logger.info(
            "👪 Parent user detected, navigating to parent dashboard"
          );
          router.replace("/parent/dashboard");
        } else {
          Logger.info("🎓 Regular user, navigating to standard dashboard");
          router.replace("/dashboard");
        }
      } else {
        Logger.warn("❌ Login failed");
        Alert.alert(
          "Login Failed",
          "Invalid email or password. Please try again."
        );
      }
    } catch (error: any) {
      Logger.error("💥 Login error occurred", error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your learning journey
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.linkTextBold}>Register here</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Web Access Modal for Non-Parent/Student Users */}
      <Modal
        transparent
        visible={webAccessModal}
        animationType="fade"
        onRequestClose={() => setWebAccessModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setWebAccessModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIcon}>
                    <Text style={styles.modalIconText}>🌐</Text>
                  </View>
                </View>

                <Text style={styles.modalTitle}>Web Interface Required</Text>
                <Text style={styles.modalMessage}>
                  This mobile app is designed exclusively for parents and
                  students. School administrators and staff should use our web
                  interface.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setWebAccessModal(false)}
                  >
                    <Text style={styles.modalButtonText}>I Understand</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.webLinkContainer}>
                  <Text style={styles.webLinkText}>
                    Visit our web interface at:{"\n"}
                    <Text style={styles.webLinkUrl}>https://getprep.com</Text>
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6366f1", // Indigo gradient start
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
    // marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 24,
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
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
    height: 56,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 18,
    padding: 2,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#6366f1",
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
    paddingBottom: 10,
  },
  linkText: {
    textAlign: "center",
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "500",
  },
  linkTextBold: {
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalIconText: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    width: "100%",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  webLinkContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  webLinkText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  webLinkUrl: {
    color: "#6366f1",
    fontWeight: "600",
  },
});

export default LoginPage;
