import { View, Text, StyleSheet } from "react-native";

export default function Grades() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Grades</Text>
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
  text: {
    fontSize: 30,
    color: '#6D57FC',
    fontFamily: 'Urbanist',
  },
});