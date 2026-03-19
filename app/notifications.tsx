import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      setIsLoading(true);
      try {
        const IP_ADDRESS = '192.168.174.35'; //อย่าลืมแก้ ip เป็นวงเดียวกับมือถือตัวเอง

        const storedUser = await AsyncStorage.getItem('user_data');
        let combinedNotifs: any[] = [];

        if (storedUser) {
          setIsLoggedIn(true);
          const user = JSON.parse(storedUser);
          
          const dbRes = await fetch(`http://${IP_ADDRESS}:3000/api/notifications/${user.id}`);
          const dbData = await dbRes.json();
          if (dbData.status === 'success') {
            combinedNotifs = dbData.data.map((n: any) => ({
              id: 'db_' + n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              date: new Date(n.created_at)
            }));
          }
        }

        let userLocation = null;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          userLocation = { lat: location.coords.latitude, lng: location.coords.longitude };
        }

        if (userLocation) {
          const eventsRes = await fetch(`http://${IP_ADDRESS}:3000/api/events`);
          const eventsData = await eventsRes.json();
          
          if (eventsData.status === 'success') {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            eventsData.data.forEach((event: any) => {
              if (event.latitude && event.longitude && event.start_date) {
                const eventDate = new Date(event.start_date);
                const isThisMonth = eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
                
                const distanceKm = getDistanceFromLatLonInKm(userLocation!.lat, userLocation!.lng, Number(event.latitude), Number(event.longitude));
                
                const imageUrl = event.image_url?.startsWith('http') ? event.image_url : `http://${IP_ADDRESS}:3000${event.image_url}`;

                if (isThisMonth && distanceKm <= 30) {
                  combinedNotifs.push({
                    id: 'evt_' + event.id,
                    eventId: event.id,
                    title: 'กิจกรรมใกล้คุณกำลังจะเริ่มขึ้น! ',
                    message: `งาน "${event.title}" อยู่ห่างจากคุณเพียง ${distanceKm.toFixed(1)} กม. จัดขึ้นในเดือนนี้ อย่าลืมแวะไปนะ!`,
                    type: 'event',
                    date: eventDate,
                    image: imageUrl
                  });
                }
              }
            });
          }
        }

        combinedNotifs.sort((a, b) => b.date.getTime() - a.date.getTime());
        setNotifications(combinedNotifs);

      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>ยังไม่มีการแจ้งเตือน</Text>
          <Text style={styles.emptySubtitle}>หากมีกิจกรรมน่าสนใจใกล้คุณ หรือมีความเคลื่อนไหว เราจะรีบแจ้งให้ทราบทันที!</Text>
          {!isLoggedIn ? (
            <Text style={{ marginTop: 20, color: '#FF385C', fontFamily: 'Prompt_500Medium' }}>
              (กรุณาเข้าสู่ระบบเพื่อดูแจ้งเตือนส่วนตัว)
            </Text>
          ) : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {notifications.map((notif) => (
            <TouchableOpacity 
              key={notif.id} 
              style={[styles.notifCard, notif.type === 'warning' ? styles.warningCard : null]}
              activeOpacity={0.7}
              disabled={notif.type === 'warning'}
              onPress={() => {
                if (notif.type === 'event' && notif.eventId) {
                  router.push({ pathname: '/event/[id]', params: { id: notif.eventId } });
                }
              }}
            >
              {notif.type === 'event' && notif.image ? (
                <Image source={{ uri: notif.image }} style={styles.notifImage} />
              ) : (
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="warning" size={24} color="#EF4444" />
                </View>
              )}

              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={3}>{notif.message}</Text>
                <Text style={styles.notifDate}>
                  {notif.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontFamily: 'Prompt_700Bold', color: '#0F172A', fontSize: 18, marginTop: 20 },
  emptySubtitle: { fontFamily: 'Prompt_400Regular', color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  notifCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 3, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  warningCard: { borderWidth: 1, borderColor: '#FECACA' },
  notifImage: { width: 70, height: 70, borderRadius: 12, marginRight: 15, backgroundColor: '#F1F5F9' },
  iconBox: { width: 70, height: 70, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notifTitle: { fontFamily: 'Prompt_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 5 },
  notifMessage: { fontFamily: 'Prompt_400Regular', fontSize: 12, color: '#475569', lineHeight: 18 },
  notifDate: { fontFamily: 'Prompt_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 8, textAlign: 'right' }
});