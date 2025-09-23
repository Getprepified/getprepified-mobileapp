import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: "Welcome to GetPrep",
    subtitle: "Your Ultimate Learning Companion",
    description: "Master WAEC subjects with personalized practice, track your progress, and achieve academic excellence.",
    icon: "school-outline",
    color: "#6D57FC"
  },
  {
    id: 2,
    title: "Practice & Learn",
    subtitle: "Thousands of Past Questions",
    description: "Access 20+ years of WAEC past questions across all subjects. Practice with instant feedback and detailed explanations.",
    icon: "library-outline",
    color: "#4CAF50"
  },
  {
    id: 3,
    title: "Track Progress",
    subtitle: "Monitor Your Growth",
    description: "Get detailed analytics on your performance, identify weak areas, and track your improvement over time.",
    icon: "trending-up-outline",
    color: "#FF9800"
  },
  {
    id: 4,
    title: "Stay Connected",
    subtitle: "Parents & Teachers Included",
    description: "Parents can monitor their child's progress, while teachers can create assignments and track class performance.",
    icon: "people-outline",
    color: "#E91E63"
  }
];

export default function Onboarding() {
  return (
    <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>GP</Text>
          </View>
          <Pressable style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </View>

      {/* Onboarding Content */}
      <View style={styles.onboardingContentContainer}>
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemIconContainer}>
              <View 
                style={[styles.itemIconBackground, { backgroundColor: `${item.color}20` }]}
              >
                <Ionicons name={item.icon as any} size={40} color={item.color} />
              </View>
              
              <Text style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text style={styles.itemSubtitle}>
                {item.subtitle}
              </Text>
              <Text style={styles.itemDescription}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Link href="/register" asChild>
          <Pressable style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
        </Link>
        
        <Link href="/login" asChild>
          <Pressable style={styles.alreadyHaveAccountButton}>
            <Text style={styles.alreadyHaveAccountText}>I Already Have an Account</Text>
          </Pressable>
        </Link>
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
  logoContainer: {
    height: 48,
    width: 48,
    borderRadius: 9999,
    backgroundColor: '#6D57FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#261E58',
    fontFamily: 'Inter',
  },
  onboardingContentContainer: {
    paddingHorizontal: 24,
  },
  itemContainer: {
    marginBottom: 48,
  },
  itemIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  itemIconBackground: {
    height: 96,
    width: 96,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  itemTitle: {
    fontSize: 30,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
    color: '#0C0A1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  itemSubtitle: {
    fontSize: 20,
    fontFamily: 'Urbanist',
    fontWeight: 'semibold',
    color: '#6D57FC',
    textAlign: 'center',
    marginBottom: 16,
  },
  itemDescription: {
    fontSize: 18,
    fontFamily: 'Inter',
    color: 'rgba(38,30,88,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginTop: 32,
  },
  getStartedButton: {
    backgroundColor: '#6D57FC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
  },
  alreadyHaveAccountButton: {
    borderWidth: 2,
    borderColor: '#6D57FC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyHaveAccountText: {
    color: '#6D57FC',
    fontSize: 18,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
  },
});