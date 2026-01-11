// app/(tabs)/_layout.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
        },
      }}>
      <Tabs.Screen
        name="DiningTable"
        options={{
          title: 'Reservation',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="table-restaurant" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="CheckIn" // tên file: CheckIn.tsx
        options={{
          title: 'Check In', // <-- tên hiển thị trên tab
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="list-alt" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="restaurant-menu" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}