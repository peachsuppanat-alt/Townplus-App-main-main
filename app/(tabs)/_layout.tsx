import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#FF385C', 
        tabBarInactiveTintColor: '#94A3B8', 
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10
        },
        tabBarLabelStyle: { fontFamily: 'Prompt_500Medium', fontSize: 11, marginTop: 4 }
      }}>
      {/* 🌟 4 ปุ่มหลักที่เราต้องการให้โชว์ */}
      <Tabs.Screen name="home" options={{ title: 'หน้าหลัก', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'สำรวจ', tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'ที่บันทึก', tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} />
      
      {/* 🚫 ซ่อนไฟล์อื่นๆ ทั้งหมดที่หลงอยู่ในโฟลเดอร์ (tabs) เพื่อกำจัดปุ่มสามเหลี่ยม! */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="event-detail" options={{ href: null }} />
      <Tabs.Screen name="all-categories" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="[id]" options={{ href: null }} />
      <Tabs.Screen name="event" options={{ href: null }} />
    </Tabs>
  );
}