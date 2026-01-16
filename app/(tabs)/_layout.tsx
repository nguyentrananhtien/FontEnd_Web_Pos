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
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Orders Tab */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />

      {/* Dish Tab */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Dish",
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant" size={24} color={color} />
          ),
        }}
      />

      {/* Dining Tab */}
      <Tabs.Screen
        name="dining"
        options={{
          title: "Dining",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="table-restaurant" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check In', // <-- tên hiển thị trên tab
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="list-alt" size={24} color={color} />
          ),
        }}
      />

    <Tabs.Screen
        name="vnpaytest"
        options={{
            title: "Test",
            tabBarIcon: ({ color }) => (
                <MaterialIcons name="receipt-long" size={24} color={color} />
            ),
        }}
    />
      {/* Hidden screens - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="cart"
        options={{
          href: null, // Hide from tab bar
          title: "Cart",
        }}
      />

      <Tabs.Screen
        name="screen"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}