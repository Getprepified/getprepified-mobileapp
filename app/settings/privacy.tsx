import { ScrollView, Text, View } from "react-native";

export default function Privacy() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16 }}
    >
      <Text className="text-xl font-urbanist font-semibold text-ink mb-4">
        Privacy
      </Text>
      <View className="bg-white rounded-2xl p-4 border border-lavender">
        <Text className="text-indigoDeep">
          We respect your privacy. Your practice data is used to generate
          insights and rankings. You can request data deletion from your
          profile.
        </Text>
      </View>
    </ScrollView>
  );
}
