// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF9800',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dining',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="table-restaurant" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}