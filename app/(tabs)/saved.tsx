import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🌟 1. นำเข้า AsyncStorage
import { useFocusEffect, useRouter } from 'expo-router'; // 🌟 2. เพิ่ม useFocusEffect
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SavedScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 3. ใช้ useFocusEffect เพื่อให้ดึงข้อมูลใหม่ "ทุกครั้งที่เปิดหน้านี้"
  useFocusEffect(
    useCallback(() => {
      const loadSavedEvents = async () => {
        setIsLoading(true);
        try {
          // เช็กว่ามีใครล็อกอินอยู่ไหม
          const storedUser = await AsyncStorage.getItem('user_data');
          if (!storedUser) {
            // ถ้าไม่มี (เป็นผู้มาเยือน หรือเพิ่งล็อกเอาท์) ให้หน้าจอว่างเปล่า
            setEvents([]);
            setIsLoading(false);
            return;
          }

          // ถ้าล็อกอินอยู่ ให้ดึงข้อมูลของคนนั้นจาก Backend
          const user = JSON.parse(storedUser);
          const response = await fetch(`http://192.168.174.35:3000/saved-events/${user.id}`);
          const data = await response.json();

          if (data.status === 'success') {
            setEvents(data.data); // เอาข้อมูลที่ได้มาเก็บลง State
          } else {
            setEvents([]);
          }
        } catch (error) {
          console.error('Error fetching saved events:', error);
          setEvents([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadSavedEvents();
    }, [])
  );

  // 🌟 4. ฟังก์ชันสำหรับกดยกเลิกหัวใจ (ยิง API ไปบอก Backend)
  const handleRemove = async (eventId: string) => {
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      
      // ส่งคำสั่ง toggle ไปที่ Backend
      const response = await fetch('http://192.168.174.35:3000/toggle-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, event_id: eventId })
      });
      
      const data = await response.json();
      
      if (data.status === 'un-saved') {
        // ถ้ายกเลิกสำเร็จ ให้เอาการ์ดนั้นออกจากหน้าจอทันที
        setEvents(events.filter(e => e.id !== eventId));
      }
    } catch (error) {
      console.error('Error removing event:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถยกเลิกการบันทึกได้');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>ที่บันทึกไว้</Text>
          <Ionicons name="heart" size={24} color="#FF385C" style={styles.headerIcon} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF385C" /></View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>คุณยังไม่ได้บันทึกกิจกรรมใดๆ</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {events.map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.card} 
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
            >
              {/* ดึงชื่อฟิลด์ให้ตรงกับ Table events ใน MySQL ของคุณ */}
              <Image source={{ uri: event.image_url || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
                
                <View style={styles.subtitleRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  {/* แสดงวันที่ โดยแปลง format หากมีข้อมูล */}
                  <Text style={styles.cardSubtitle}>
                    {event.start_date ? new Date(event.start_date).toLocaleDateString('th-TH') : 'ไม่มีระบุวันที่'}
                  </Text>
                  
                  <Text style={styles.dotSeparator}>•</Text>
                  
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{event.location_name}</Text>
                </View>

              </View>

              <TouchableOpacity style={styles.heartBtn} onPress={() => handleRemove(event.id)}>
                <Ionicons name="heart" size={24} color="#FF385C" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  headerIcon: { marginLeft: 8 }, 
  listContainer: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 15, elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden', alignItems: 'center' },
  cardImage: { width: 90, height: 90 },
  cardInfo: { flex: 1, padding: 15 },
  cardTitle: { fontFamily: 'Prompt_700Bold', fontSize: 15, color: '#0F172A', marginBottom: 5 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardSubtitle: { flexShrink: 1, fontFamily: 'Prompt_400Regular', fontSize: 12, color: '#64748B', marginLeft: 4 },
  dotSeparator: { marginHorizontal: 6, color: '#64748B', fontSize: 12 },
  heartBtn: { padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'Prompt_400Regular', color: '#94A3B8', marginTop: 15, fontSize: 15 }
});