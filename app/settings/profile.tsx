import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function save() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement API call to update profile
      // await api.put("/users/me", { fullName, email });
      Alert.alert("Success", "Profile updated successfully!");
      await refreshUser();
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-10 pb-6 bg-lavender rounded-b-3xl">
        <Text className="text-3xl font-urbanist font-bold text-ink">
          Profile
        </Text>
        <Text className="text-indigoDeep mt-2">
          Update your personal information.
        </Text>
      </View>

      <View className="px-6 mt-6">
        <View className="mb-6">
          <Text className="text-lg font-inter text-ink mb-2">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-lg font-inter text-ink"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-inter text-ink mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-lg font-inter text-ink"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <Pressable
          className="bg-primary rounded-lg py-4 items-center justify-center"
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-urbanist font-bold">
              Save Changes
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
