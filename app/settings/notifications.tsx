import { View, Text, Switch, ScrollView } from "react-native";
import { useState } from "react";

export default function Notifications() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-urbanist font-semibold text-ink mb-4">Notifications</Text>
      <View className="bg-white rounded-2xl p-4 border border-lavender mb-3 flex-row items-center justify-between">
        <Text className="text-ink">Push Notifications</Text>
        <Switch value={push} onValueChange={setPush} />
      </View>
      <View className="bg-white rounded-2xl p-4 border border-lavender mb-3 flex-row items-center justify-between">
        <Text className="text-ink">Email Updates</Text>
        <Switch value={email} onValueChange={setEmail} />
      </View>
    </ScrollView>
  );
}