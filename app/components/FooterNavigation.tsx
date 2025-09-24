import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface FooterNavigationProps {
  // Optional props for customization
}

const FooterNavigation: React.FC<FooterNavigationProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      route: '/dashboard',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: 'library' as keyof typeof Ionicons.glyphMap,
      route: '/courses',
    },
    {
      id: 'hub',
      label: 'Hub',
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      route: '/hub',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'chatbubble-ellipses' as keyof typeof Ionicons.glyphMap,
      route: '/messages',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings' as keyof typeof Ionicons.glyphMap,
      route: '/settings',
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        {navigationItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={active ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 4, // Reduced padding
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItemActive: {
    // Additional styling for active state if needed
  },
  navIcon: {
    marginBottom: 4,
  },
  navIconActive: {
    // Active icon styling
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  navLabelActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default FooterNavigation;