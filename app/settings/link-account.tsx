import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

export default function LinkAccount() {
  const { user, token, refreshUser } = useAuth();
  const [schoolCode, setSchoolCode] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [linkedSchool, setLinkedSchool] = useState(null);
  const [linkedParent, setLinkedParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLinkedAccounts() {
      try {
        setLoading(true);
        if (user?.schoolId) {
          const schoolRes = await api.get(`/schools/${user.schoolId}`);
          setLinkedSchool(schoolRes.data);
        }
        if (user?.parentId) {
          const parentRes = await api.get(`/users/${user.parentId}`);
          setLinkedParent(parentRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch linked accounts:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user && token) {
      fetchLinkedAccounts();
    }
  }, [user, token]);

  async function handleLinkAccount() {
    try {
      setSubmitting(true);
      const payload: { schoolCode?: string; parentCode?: string } = {};
      if (schoolCode) payload.schoolCode = schoolCode;
      if (parentCode) payload.parentCode = parentCode;

      if (Object.keys(payload).length === 0) {
        Alert.alert("Error", "Please enter either a school code or a parent code.");
        setSubmitting(false);
        return;
      }

      await api.post("/auth/attach", payload);
      Alert.alert("Success", "Account linked successfully!");
      setSchoolCode("");
      setParentCode("");
      refreshUser();
    } catch (error: any) {
      console.error("Failed to link account:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to link account.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6D57FC" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-10 pb-6 bg-lavender rounded-b-3xl">
        <Text className="text-3xl font-urbanist font-bold text-ink">Link Account</Text>
        <Text className="text-indigoDeep mt-2">Connect to your school or parent.</Text>
      </View>

      <View className="px-6 mt-6">
        {linkedSchool ? (
          <View className="bg-lilac p-4 rounded-lg mb-4">
            <Text className="text-lg font-urbanist font-bold text-indigoDeep">Linked School:</Text>
            <Text className="text-md font-inter text-ink mt-1">{linkedSchool.name}</Text>
            <Text className="text-sm font-inter text-indigoDeep/70">Code: {linkedSchool.code}</Text>
          </View>
        ) : (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-lg font-urbanist font-bold text-ink mb-2">Link to School</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-lg font-inter text-ink"
              value={schoolCode}
              onChangeText={setSchoolCode}
              placeholder="Enter School Code"
            />
          </View>
        )}

        {linkedParent ? (
          <View className="bg-lilac p-4 rounded-lg mb-4">
            <Text className="text-lg font-urbanist font-bold text-indigoDeep">Linked Parent:</Text>
            <Text className="text-md font-inter text-ink mt-1">{linkedParent.fullName}</Text>
            <Text className="text-sm font-inter text-indigoDeep/70">Code: {linkedParent.parentCode}</Text>
          </View>
        ) : (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-lg font-urbanist font-bold text-ink mb-2">Link to Parent</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-lg font-inter text-ink"
              value={parentCode}
              onChangeText={setParentCode}
              placeholder="Enter Parent Code"
            />
          </View>
        )}

        <Pressable
          className="bg-primary rounded-lg py-4 items-center justify-center mt-4"
          onPress={handleLinkAccount}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-urbanist font-bold">Link Account</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}