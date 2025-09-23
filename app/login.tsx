import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await login(formData.email.trim().toLowerCase(), formData.password);
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Login failed. Please check your credentials.');
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
          <Text style={styles.welcomeBackText}>Welcome Back</Text>
          <View style={styles.spacer} />
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSectionContainer}>
        <View style={styles.heroInnerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>GP</Text>
          </View>
          <Text style={styles.heroTitle}>
            Welcome Back!
          </Text>
          <Text style={styles.heroSubtitle}>
            Sign in to continue your learning journey
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoComplete="password"
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

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <Pressable>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>
              Sign In
            </Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialLoginButtonsContainer}>
          <Pressable className="border border-gray-300 rounded-xl py-4 flex-row items-center justify-center">
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialLoginText}>Continue with Google</Text>
          </Pressable>
          
          <Pressable className="border border-gray-300 rounded-xl py-4 flex-row items-center justify-center">
            <Ionicons name="logo-apple" size={20} color="#000000" />
            <Text style={styles.socialLoginText}>Continue with Apple</Text>
          </Pressable>
        </View>

        {/* Register Link */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Link href="/register" asChild>
            <Pressable>
              <Text style={styles.registerLink}>Sign Up</Text>
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
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  welcomeBackText: {
    fontSize: 18,
    fontFamily: 'Urbanist',
    fontWeight: 'semibold',
    color: '#0C0A1C',
  },
  spacer: {
    width: 32,
  },
  heroSectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  heroInnerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    height: 80,
    width: 80,
    borderRadius: 9999,
    backgroundColor: '#6D57FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
    color: '#0C0A1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter',
    color: 'rgba(38,30,88,0.7)',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#261E58',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter',
    color: '#0C0A1C',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter',
    color: '#0C0A1C',
    paddingRight: 48,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#6D57FC',
    fontFamily: 'Urbanist',
    fontWeight: 'semibold',
  },
  loginButton: {
    backgroundColor: '#6D57FC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(38,30,88,0.5)',
    fontFamily: 'Inter',
  },
  socialLoginButtonsContainer: {
    // space-y-3 translated to margin-bottom
    marginBottom: 32,
  },
  socialLoginButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLoginText: {
    color: '#0C0A1C',
    fontFamily: 'Urbanist',
    fontWeight: 'semibold',
    marginLeft: 12,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: '#261E58',
    fontFamily: 'Inter',
  },
  registerLink: {
    color: '#6D57FC',
    fontFamily: 'Urbanist',
    fontWeight: 'semibold',
  },
});