import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Category { id: string; name: string; icon: string; bgColor: string; }
interface EventItem { id: string; title: string; date: string; distance: string; rating: string; image: string; isVerified: boolean; }

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventItem[]>([]);
  const [currentLocationName, setCurrentLocationName] = useState<string>('กำลังหาตำแหน่ง...');
  
  const [userName, setUserName] = useState<string>('ผู้มาเยือน');

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.username || 'ผู้มาเยือน');
      } else {
        setUserName('ผู้มาเยือน');
      }
    } catch (error) {
      console.error('Failed to load user', error);
    }
  };

  // 🌟 ฟังก์ชันดึงข้อมูลหน้า Home พร้อม "ดึงคะแนนดาวเฉลี่ย" จาก Database
  const fetchHomeData = async (showLoading: boolean) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. แอบดึงคะแนนดาวเฉลี่ยจาก Backend เพื่อให้การ์ดอัปเดตล่าสุดเสมอ
      let ratingsMap: any = {};
      try {
        const res = await fetch('http://192.168.174.35:3000/all-ratings');
        const data = await res.json();
        if (data.status === 'success') {
          data.data.forEach((r: any) => {
            ratingsMap[r.event_id.toString()] = r.avg_rating;
          });
        }
      } catch (e) {
        console.error('ไม่สามารถดึงคะแนนดาวหน้า Home ได้', e);
      }

      // 2. อัปเดตข้อมูลหมวดหมู่และกิจกรรมแนะนำ พร้อมใส่ดาวจริงจาก Database
      setCategories([
        { id: '1', name: 'อาหาร', icon: 'silverware-fork-knife', bgColor: '#FFE4E6' },
        { id: '2', name: 'งานวัด', icon: 'ferris-wheel', bgColor: '#FEF3C7' }, 
        { id: '3', name: 'ช้อปปิ้ง', icon: 'shopping-outline', bgColor: '#F3E8FF' },
        { id: '4', name: 'ดนตรี', icon: 'music-note', bgColor: '#E0E7FF' },
        { id: '5', name: 'กีฬา', icon: 'run', bgColor: '#D1FAE5' },
        { id: '6', name: 'ศิลปะ', icon: 'palette', bgColor: '#E0F2FE' },
        { id: '7', name: 'เวิร์กชอป', icon: 'book-open-variant', bgColor: '#FCE7F3' },
        { id: '8', name: 'อาสา', icon: 'handshake-outline', bgColor: '#DCFCE7' },
      ]);
      
      setRecommendedEvents([
        { 
          id: '1', title: 'งานวัดภูเขาทอง 2569', date: '15 - 20 ก.พ.', distance: '0.5 กม.', 
          rating: ratingsMap['1'] || '0.0', // 🌟 ดึงดาวของ id 1
          image: 'https://cms.dmpcdn.com/travel/2024/10/22/bf86a330-9050-11ef-9ac9-8bc58bd3f671_webp_original.webp', 
          isVerified: true 
        },
        { 
          id: '2', title: 'ตลาดนัดคลองถม (Night Market)', date: 'ทุกวันศุกร์ - อาทิตย์', distance: '1.2 กม.', 
          rating: ratingsMap['2'] || '0.0', // 🌟 ดึงดาวของ id 2
          image: 'https://shopee.co.th/blog/wp-content/uploads/2023/08/Shopee-Blog-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%81%E0%B9%88%E0%B8%B2-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%B1%E0%B8%94.jpg', 
          isVerified: true 
        },
      ]);
      setCurrentLocationName('กรุงเทพมหานคร');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 รวมไว้ใน useFocusEffect ที่เดียวเลย จะได้ดึงดาวใหม่ทุกครั้งที่กลับมาหน้าโฮม (โดยไม่ให้วงกลมหมุนโหลดมากวนใจ)
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      // ถ้าเปิดแอปครั้งแรก (categories ยังว่าง) ให้โชว์หน้าโหลดหมุนติ้วๆ แต่ถ้าเคยโหลดแล้วให้แอบอัปเดตดาวแบบเงียบๆ
      fetchHomeData(categories.length === 0); 
    }, [categories.length])
  );

  const handleNearMeClick = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ปฏิเสธการเข้าถึง', 'กรุณาเปิด GPS เพื่อใช้งานฟีเจอร์นี้');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      router.push({ pathname: '/(tabs)/explore', params: { lat: location.coords.latitude, lon: location.coords.longitude, mode: 'near_me' } }); 
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงตำแหน่ง GPS ได้');
    }
  };

  const goToSearch = () => router.push('/(tabs)/explore');
  const goToNotifications = () => router.push('/notifications');
  const goToAllCategories = () => router.push('/all-categories');
  const goToCategory = (categoryName: string) => {
    router.push({ pathname: '/(tabs)/explore', params: { category: categoryName } }); 
  };
  const goToEventDetail = (eventId: string) => {
    router.push({ pathname: '/event/[id]', params: { id: eventId } });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E1B4B" />
        <Text style={styles.loadingText}>กำลังเตรียมกิจกรรมดีๆ สำหรับคุณ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.locationWrapper}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>สวัสดี, {userName}</Text>
            <MaterialCommunityIcons name="hand-wave" size={14} color="#F59E0B" style={{ marginLeft: 6 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={16} color="#FF385C" />
            <Text style={styles.locationTitle}> {currentLocationName} </Text>
            <Ionicons name="chevron-down" size={14} color="#111827" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={goToSearch} activeOpacity={0.6}>
            <Ionicons name="search-outline" size={26} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={goToNotifications} activeOpacity={0.6}>
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={26} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9} onPress={() => goToEventDetail('3')}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop' }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerBadge}>
              <Ionicons name="flame" size={12} color="#FFF" />
              <Text style={styles.bannerBadgeText}>HOT EVENT</Text>
            </View>
            <Text style={styles.bannerTitle}>เทศกาลดนตรีกลางคืน</Text>
            <Text style={styles.bannerSubTitle}>รวมงานที่คุณไม่ควรพลาด สัปดาห์นี้!</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.heroButton} activeOpacity={0.8} onPress={handleNearMeClick}>
          <View style={styles.heroIconBg}><Ionicons name="compass" size={28} color="#FF385C" /></View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroButtonTitle}>กิจกรรมใกล้ฉัน</Text>
            <Text style={styles.heroButtonSub}>ค้นหางานรอบตัวในรัศมี 5 กม.</Text>
          </View>
          <View style={styles.arrowCircle}><Ionicons name="arrow-forward" size={20} color="#FF385C" /></View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>หมวดหมู่ยอดฮิต</Text>
          <TouchableOpacity onPress={goToAllCategories}><Text style={styles.seeAllText}>ดูทั้งหมด</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.7} onPress={() => goToCategory(cat.name)}>
              <View style={[styles.categoryIconCircle, { backgroundColor: cat.bgColor }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={32} color="#1E1B4B" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>แนะนำสำหรับคุณ</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {recommendedEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.95} onPress={() => goToEventDetail(event.id)}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  {/* 🌟 แสดงดาวของ Database แทน Mockup แล้ว */}
                  <Text style={styles.ratingText}>{event.rating}</Text>
                </View>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                <View style={styles.eventDateWrapper}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <View style={styles.eventFooter}>
                  <View style={styles.eventDistanceWrapper}>
                    <Ionicons name="location-outline" size={14} color="#475569" />
                    <Text style={styles.eventDistance}>ห่างไป {event.distance}</Text>
                  </View>
                  {event.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { fontFamily: 'Prompt_500Medium', color: '#64748B', marginTop: 12 },
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }, 
  scrollContent: { paddingBottom: 20 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  locationWrapper: { justifyContent: 'center' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  greetingText: { fontSize: 13, color: '#64748B', fontFamily: 'Prompt_400Regular' },
  locationTitle: { fontSize: 18, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 2, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, zIndex: 1, borderWidth: 2, borderColor: '#FFF' },
  bannerContainer: { marginHorizontal: 20, marginTop: 20, height: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: '#E2E8F0', elevation: 6, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12 },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 20 },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF385C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  bannerBadgeText: { color: '#FFF', fontSize: 10, fontFamily: 'Prompt_700Bold', letterSpacing: 0.5, marginLeft: 4 },
  bannerTitle: { color: '#FFF', fontSize: 22, fontFamily: 'Prompt_700Bold', marginBottom: 2 },
  bannerSubTitle: { color: '#F8FAFC', fontSize: 13, fontFamily: 'Prompt_400Regular' },
  heroButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B4B', marginHorizontal: 20, marginTop: 25, padding: 18, borderRadius: 24, elevation: 8, shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12 },
  heroIconBg: { backgroundColor: '#FFF', padding: 12, borderRadius: 18, marginRight: 15 },
  heroTextContainer: { flex: 1 },
  heroButtonTitle: { color: '#FFF', fontSize: 18, fontFamily: 'Prompt_700Bold', marginBottom: 2 },
  heroButtonSub: { color: '#94A3B8', fontSize: 12, fontFamily: 'Prompt_400Regular' },
  arrowCircle: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  seeAllText: { fontSize: 14, color: '#FF385C', fontFamily: 'Prompt_500Medium' },
  horizontalScroll: { paddingHorizontal: 20 },
  categoryItem: { alignItems: 'center', marginRight: 24 },
  categoryIconCircle: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  categoryName: { fontSize: 14, color: '#475569', fontFamily: 'Prompt_500Medium' },
  eventCard: { width: width * 0.72, backgroundColor: '#FFF', borderRadius: 24, marginRight: 20, elevation: 5, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, marginBottom: 15 },
  imageContainer: { overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 }, 
  eventImage: { width: '100%', height: 150 },
  ratingBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontFamily: 'Prompt_700Bold', color: '#D97706', marginLeft: 4 },
  eventInfo: { padding: 16 },
  eventTitle: { fontSize: 17, fontFamily: 'Prompt_700Bold', color: '#0F172A', marginBottom: 6 },
  eventDateWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eventDate: { fontSize: 13, color: '#64748B', fontFamily: 'Prompt_400Regular', marginLeft: 6 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventDistanceWrapper: { flexDirection: 'row', alignItems: 'center' },
  eventDistance: { fontSize: 13, color: '#475569', fontFamily: 'Prompt_500Medium', marginLeft: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { fontSize: 11, fontFamily: 'Prompt_700Bold', color: '#059669', marginLeft: 4 },
});