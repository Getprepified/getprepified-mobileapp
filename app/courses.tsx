import { View, Text, ScrollView, StyleSheet } from "react-native";
// import Section from "../components/Section";
// import CourseCard from "../components/CourseCard";

export default function Courses() {
  const items = [
    { id: "1", title: "3D Illustration Course", duration: "1hr 20min" },
    { id: "2", title: "3D Character Lumion", duration: "1hr 10min" },
    { id: "3", title: "AE Animation", duration: "2hr 05min" },
    { id: "4", title: "AI Design Basic", duration: "1hr 45min" },
  ];
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header gradient block like mock */}
      <View className="h-52 px-6 pt-14" style={{ backgroundColor: "#6D57FC" }}>
        <Text className="text-white/80 font-inter">Category</Text>
        <Text className="text-white text-3xl font-urbanist font-bold mt-2">
          Ready To Learn?
        </Text>
        <Text className="text-white/80 mt-1">Choose your subject.</Text>
      </View>

      <View className="-mt-6 rounded-t-3xl bg-white p-6">
        <View className="flex-row items-center space-x-6">
          <Text className="text-primary font-urbanist">All</Text>
          <Text className="text-indigoDeep">Favourite</Text>
          <Text className="text-indigoDeep">Recommended</Text>
        </View>

        <View className="mt-6 flex-row flex-wrap justify-between">
          {items.map((c) => (
            <View key={c.id} className="w-[48%] mb-4">
              <View
                className="rounded-3xl p-4"
                style={{ backgroundColor: "#FBE3DD" }}
              >
                <View className="h-16 w-16 rounded-2xl bg-white/70 mb-3" />
                <Text className="text-ink font-urbanist" numberOfLines={2}>
                  {c.title}
                </Text>
                <Text className="text-indigoDeep mt-1 text-xs">15 Course</Text>
              </View>
            </View>
          ))}
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
    height: 208,
    paddingHorizontal: 24,
    paddingTop: 56,
    backgroundColor: "#6D57FC",
  },
  headerCategoryText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter",
  },
  headerTitle: {
    color: "white",
    fontSize: 30,
    fontFamily: "Urbanist",
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  contentContainer: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "white",
    padding: 24,
  },
  filterOptionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    // space-x-6
  },
  filterOptionActive: {
    color: "#6D57FC",
    fontFamily: "Urbanist",
  },
  filterOptionInactive: {
    color: "#261E58",
  },
  courseCardsContainer: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  courseCardInnerContainer: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#FBE3DD",
  },
  courseImagePlaceholder: {
    height: 64,
    width: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginBottom: 12,
  },
  courseTitle: {
    color: "#0C0A1C",
    fontFamily: "Urbanist",
  },
  courseCount: {
    color: "#261E58",
    marginTop: 4,
    fontSize: 12,
  },
});
