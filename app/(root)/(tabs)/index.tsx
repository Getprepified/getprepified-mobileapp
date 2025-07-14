import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  return (
   <SafeAreaView>
    <Link href="/sign-in">Sign-in </Link>
   
    <Link href="(tabs)/search">Search </Link>
    <Link href="(tabs)/community">Community </Link>
   </SafeAreaView>
  );
}
