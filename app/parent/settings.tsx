import React from 'react';
import { View } from 'react-native';
import ParentSettings from './settings-page';
import ParentFooter from './components/ParentFooter';

const ParentSettingsPage = () => {
  return (
    <View style={{ flex: 1 }}>
      <ParentSettings />
    </View>
  );
};

export default ParentSettingsPage;