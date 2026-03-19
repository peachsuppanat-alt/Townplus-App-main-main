import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FILTERS = [
  'ทั้งหมด', 'อาหารและเครื่องดื่ม', 'ตลาดและช้อปปิ้ง', 'ดนตรีและคอนเสิร์ต', 
  'เทศกาลและงานวัด', 'กีฬาและเอาท์ดอร์', 'ศิลปะและนิทรรศการ', 'สัตว์เลี้ยง', 'ท่องเที่ยวธรรมชาติ'
];

// 🌟 ฟังก์ชันคำนวณระยะทาง (สูตร Haversine) ให้ผลลัพธ์เป็นกิโลเมตร
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
};

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const initialCategory = typeof params.category === 'string' ? params.category : 'ทั้งหมด';
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 🌟 ดึง GPS
  useEffect(() => {
    const getUserLocation = async () => {
      if (params.lat && params.lon) {
        setUserLocation({ lat: Number(params.lat), lng: Number(params.lon) });
        return;
      }
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    };
    getUserLocation();
  }, [params.lat, params.lon]);

  // 🌟 โหลดข้อมูล รีวิว และคำนวณระยะทาง
  useFocusEffect(
    useCallback(() => {
      const fetchEventsAndRatings = async () => {
        setIsLoading(true);
        try {
          //  เปลี่ยน IP ต้องมาแก้ตรงนี้
          const IP_ADDRESS = '192.168.174.35'; 

          const eventsRes = await fetch(`http://${IP_ADDRESS}:3000/api/events`);
          const eventsJson = await eventsRes.json();
          const dbEvents = eventsJson.status === 'success' ? eventsJson.data : [];

          let ratingsMap: any = {};
          try {
            const res = await fetch(`http://${IP_ADDRESS}:3000/all-ratings`);
            const data = await res.json();
            if (data.status === 'success') {
              data.data.forEach((r: any) => {
                ratingsMap[r.event_id.toString()] = { avg: r.avg_rating, count: r.total_reviews };
              });
            }
          } catch (e) {
            console.error('ไม่สามารถดึงคะแนนดาวได้', e);
          }

          // จัดรูปข้อมูลและคำนวณระยะทาง
          let result = dbEvents.map((e: any) => {
            let distanceKm = 999999; 
            let distanceText = 'ไม่ทราบระยะทาง'; 

            if (userLocation && e.latitude && e.longitude) {
              distanceKm = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, Number(e.latitude), Number(e.longitude));
              distanceText = distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} ม.` : `${distanceKm.toFixed(1)} กม.`;
            }

            const imageUrl = e.image_url?.startsWith('http') ? e.image_url : `http://${IP_ADDRESS}:3000${e.image_url}`;
            const dateText = e.start_date ? new Date(e.start_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : '-';

            return {
              id: e.id.toString(), 
              dbId: e.id,
              title: e.title,
              category: e.category || 'เทศกาลและงานวัด', 
              date: dateText,
              image: imageUrl,
              lat: e.latitude,
              lng: e.longitude,
              rating: ratingsMap[e.id] ? ratingsMap[e.id].avg : '0.0',
              reviewsCount: ratingsMap[e.id] ? ratingsMap[e.id].count : '0',
              distanceKm: distanceKm, 
              realDistanceText: distanceText 
            };
          });
          
          // 1. กรองหมวดหมู่ (ถ้าเป็น 'ทั้งหมด' จะไม่โดนกรอง และโชว์ทุกงาน)
          if (activeFilter !== 'ทั้งหมด') {
             result = result.filter((e: any) => e.category === activeFilter);
          }

          // 2. กรองคำค้นหา
          if (searchQuery.trim() !== '') {
             result = result.filter((e: any) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
          }
          
          // 3. เรียงลำดับจาก "ใกล้สุด ไป ไกลสุด" เสมอ (ถ้ามีพิกัด GPS)
          if (userLocation || params.mode === 'near_me') {
            result.sort((a: any, b: any) => a.distanceKm - b.distanceKm);
          } else {
            // ถ้ายังหา GPS ไม่เจอ ให้เรียงจากกิจกรรมที่เพิ่มล่าสุดขึ้นก่อน
            result.sort((a: any, b: any) => b.dbId - a.dbId);
          }

          setEvents(result);

        } catch (error) {
          console.error(error);
          // 🚨 แจ้งเตือนทันทีถ้าแอปต่อเซิร์ฟเวอร์ไม่ได้
          Alert.alert(
            'เชื่อมต่อล้มเหลว 🔌', 
            'ไม่สามารถดึงข้อมูลกิจกรรมได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่ หรือ IP Address ตรงกับเครื่องคอมพิวเตอร์หรือไม่'
          );
        } finally {
          setIsLoading(false); 
        }
      };

      fetchEventsAndRatings();
    }, [activeFilter, searchQuery, userLocation, params.mode]) 
  );

  const clearSearch = () => setSearchQuery('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>สำรวจกิจกรรม</Text>
          <Ionicons name="compass" size={26} color="#FF385C" style={{ marginLeft: 8 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput 
            style={styles.searchInput} placeholder="ค้นหางาน, สถานที่ หรือ คอนเสิร์ต..." 
            value={searchQuery} onChangeText={setSearchQuery} 
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={clearSearch}><Ionicons name="close-circle" size={20} color="#94A3B8" /></TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ paddingVertical: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {FILTERS.map(filter => (
            <TouchableOpacity key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}>
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF385C" /></View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>ไม่พบกิจกรรมที่คุณค้นหา</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {events.map(event => (
            <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.eventCategory}>{event.category}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={{ fontFamily: 'Prompt_700Bold', fontSize: 12, color: '#D97706', marginLeft: 4 }}>{event.rating}</Text>
                  </View>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventFooter}>
                  <View style={styles.iconTextRow}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Ionicons name="location" size={14} color="#FF385C" />
                    <Text style={styles.eventDistance}>{event.realDistanceText}</Text>
                  </View>
                </View>
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
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Prompt_400Regular', fontSize: 15, color: '#0F172A' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  activeFilterChip: { backgroundColor: '#1E1B4B', borderColor: '#1E1B4B' },
  filterText: { fontFamily: 'Prompt_500Medium', color: '#64748B', fontSize: 13 },
  activeFilterText: { color: '#FFF' },
  listContainer: { padding: 20, paddingBottom: 40 },
  eventCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 15, elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden' },
  eventImage: { width: 110, height: 110 },
  eventInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  eventCategory: { fontFamily: 'Prompt_700Bold', fontSize: 10, color: '#FF385C', textTransform: 'uppercase' },
  eventTitle: { fontFamily: 'Prompt_700Bold', fontSize: 15, color: '#0F172A', lineHeight: 22 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  iconTextRow: { flexDirection: 'row', alignItems: 'center' },
  eventDate: { fontFamily: 'Prompt_400Regular', fontSize: 11, color: '#64748B', marginLeft: 4 }, 
  eventDistance: { fontFamily: 'Prompt_500Medium', fontSize: 11, color: '#475569', marginLeft: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'Prompt_400Regular', color: '#94A3B8', marginTop: 15, fontSize: 15 }
});