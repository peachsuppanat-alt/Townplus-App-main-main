import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>การแจ้งเตือน</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.content}>
         <View style={styles.iconCircle}>
           <Ionicons name="notifications-off-outline" size={50} color="#94A3B8" />
         </View>
         <Text style={styles.emptyTitle}>ยังไม่มีการแจ้งเตือน</Text>
         <Text style={styles.emptyText}>หากมีกิจกรรมน่าสนใจใกล้คุณ เราจะรีบแจ้งให้ทราบทันที!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 20, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontFamily: 'Prompt_700Bold', color: '#334155', marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Prompt_400Regular', color: '#64748B', textAlign: 'center', lineHeight: 22 }
});