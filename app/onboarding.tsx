import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
  const router = useRouter();

  const handleOnboardingDone = () => {
    router.replace('/dashboard');
  };

  return (
    <Onboarding
      onDone={handleOnboardingDone}
      onSkip={handleOnboardingDone}
      pages={[
        {
          backgroundColor: '#6366f1', // Indigo primary color
          image: <Image source={require('../assets/images/react-logo.png')} className="w-48 h-48" />,
          title: 'Welcome to GetPrep!',
          subtitle: 'Master your exams with personalized practice and real-time feedback.',
        },
        {
          backgroundColor: '#059669', // Emerald green
          image: <Image source={require('../assets/images/splash-icon.png')} className="w-48 h-48" />,
          title: 'Practice with Real Questions',
          subtitle: 'Access thousands of authentic WAEC, NECO, and JAMB past questions.',
        },
        {
          backgroundColor: '#dc2626', // Red for progress tracking
          image: <Image source={require('../assets/images/icon.png')} className="w-48 h-48" />,
          title: 'Track Your Progress',
          subtitle: 'Monitor your performance with detailed analytics and insights.',
        },
        {
          backgroundColor: '#7c3aed', // Purple for community
          image: <Image source={require('../assets/images/react-logo.png')} className="w-48 h-48" />,
          title: 'Compete & Learn',
          subtitle: 'Challenge friends, climb leaderboards, and stay motivated.',
        },
      ]}
      NextButtonComponent={({ ...props }) => (
        <TouchableOpacity className="p-4 bg-white rounded-full shadow-lg" {...props}>
          <Text className="text-indigo-600 font-bold text-lg">Next</Text>
        </TouchableOpacity>
      )}
      SkipButtonComponent={({ ...props }) => (
        <TouchableOpacity className="p-4" {...props}>
          <Text className="text-white opacity-70">Skip</Text>
        </TouchableOpacity>
      )}
      DoneButtonComponent={({ ...props }) => (
        <TouchableOpacity className="p-4 bg-white rounded-full shadow-lg" {...props}>
          <Text className="text-indigo-600 font-bold text-lg">Get Started</Text>
        </TouchableOpacity>
      )}
      DotComponent={({ selected }) => (
        <View className={`w-3 h-3 rounded-full mx-1 ${selected ? 'bg-white' : 'bg-white opacity-30'}`} />
      )}
      titleStyles={{
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
      }}
      subTitleStyles={{
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        paddingHorizontal: 20,
        opacity: 0.9,
      }}
    />
  );
};

export default OnboardingScreen;