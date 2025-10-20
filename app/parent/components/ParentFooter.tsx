import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

interface FooterItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const footerItems: FooterItem[] = [
  { name: "home", label: "Home", icon: "home", route: "/parent/dashboard" },
  { name: "courses", label: "Courses", icon: "book", route: "/parent/courses" },
  {
    name: "students",
    label: "Students",
    icon: "people",
    route: "/parent/students",
  },
  {
    name: "settings",
    label: "Settings",
    icon: "settings",
    route: "/parent/settings-page",
  },
];

interface ParentFooterProps {
  style?: any;
}

const ParentFooter: React.FC<ParentFooterProps> = ({ style }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (route: string) => {
    if (pathname !== route) {
      router.push(route as any);
    }
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={[styles.container, style]}>
      {footerItems.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.name}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={active ? "#8B5CF6" : "#6B7280"}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: "#F5F3FF",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter_500Medium",
  },
  labelActive: {
    color: "#8B5CF6",
    fontFamily: "Inter_600SemiBold",
  },
});

export default ParentFooter;
