import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessons = [
    { id: "l0", title: "00 - Trailer", time: "1:10min", locked: false },
    { id: "l1", title: "01 - Shape", time: "15:10min", locked: true },
    { id: "l2", title: "02 - Coloring", time: "22:56min", locked: true },
    { id: "l3", title: "03 - Typography", time: "22:45min", locked: true },
  ];
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="h-64 bg-ink/90 px-6 pt-14">
        <Text className="text-white/80 font-inter">Detail Course</Text>
        <Text className="text-white text-5xl font-urbanist font-bold mt-2">3D Illustration Course</Text>
        <Text className="text-white/80 mt-2">by Leo Nikuma</Text>
      </View>

      <View className="-mt-6 bg-white rounded-t-3xl p-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-urbanist font-semibold text-ink">12 Lessons</Text>
          <Text className="text-indigoDeep">1hr 20min</Text>
        </View>
        <Text className="text-indigoDeep mt-2">This course will be teach the basic how to star 3D from beginning to finish. 12 Lessons more than 1 hour.</Text>

        {lessons.map((l) => (
          <View key={l.id} className="mt-4 flex-row items-center bg-white rounded-3xl p-4 shadow-sm border border-lavender">
            <View className="h-14 w-14 rounded-2xl bg-primary/20 mr-4 items-center justify-center">
              <Ionicons name="play" size={20} color="#6D57FC" />
            </View>
            <View className="flex-1">
              <Text className="text-indigoDeep">{l.time}</Text>
              <Text className="text-ink text-lg font-urbanist">{l.title}</Text>
              <View className="h-2 bg-lavender rounded-full mt-2" />
            </View>
            {l.locked ? <Ionicons name="lock-closed" size={20} color="#B0A4FD" /> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}