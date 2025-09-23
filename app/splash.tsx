import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>GP</Text>
        </View>
        <Text style={styles.titleText}>GetPrep</Text>
        <Text style={styles.subtitleText}>Your Learning Companion</Text>
        <ActivityIndicator size="large" color="#6D57FC" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  innerContainer: {
    alignItems: 'center',
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
  titleText: {
    fontSize: 30,
    fontFamily: 'Urbanist',
    fontWeight: 'bold',
    color: '#0C0A1C',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 18,
    fontFamily: 'Inter',
    color: 'rgba(38,30,88,0.7)',
    marginBottom: 32,
  },
});