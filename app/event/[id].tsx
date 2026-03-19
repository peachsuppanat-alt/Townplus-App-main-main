import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  const [eventData, setEventData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userData, setUserData] = useState<any>(null);
  
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0); 
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState('0.0');
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  //  State สำหรับเก็บว่าตอนนี้กำลัง "แก้ไข" รีวิวอันไหนอยู่
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const fetchReviews = async (dbId: number) => {
    try {
      const res = await fetch(`http://192.168.174.35:3000/events/${dbId}/reviews`); //แก้ ip
      const result = await res.json();
      if (result.status === 'success') {
        setReviewsList(result.reviews);
        setAvgRating(result.averageRating);
        setTotalReviewsCount(result.totalReviews);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      const storedUser = await AsyncStorage.getItem('user_data');
      let currentUser = null;
      if (storedUser) {
        setIsLoggedIn(true);
        currentUser = JSON.parse(storedUser);
        setUserData(currentUser);
      }

      const dataId = id ? (id as string) : '1';

      try {
        const response = await fetch(`http://192.168.174.35:3000/api/events/${dataId}`);
        const result = await response.json();

        if (result.status === 'success') {
          const dbEvent = result.data;
          const startDate = dbEvent.start_date ? new Date(dbEvent.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
          const endDate = dbEvent.end_date ? new Date(dbEvent.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
          
          let dateDisplay = 'ไม่ระบุวันที่';
          if (startDate && endDate) {
             if (startDate === endDate) { dateDisplay = `วันที่ ${startDate}`; } 
             else { dateDisplay = `เริ่ม ${startDate} - สิ้นสุด ${endDate}`; }
          } else if (startDate) { dateDisplay = `เริ่ม ${startDate}`; }

          const imageUrl = dbEvent.image_url?.startsWith('http') ? dbEvent.image_url : `http://192.168.174.35:3000${dbEvent.image_url}`;

          setEventData({
            dbId: dbEvent.id, title: dbEvent.title, date: dateDisplay,
            location: dbEvent.location_name, description: dbEvent.description || 'ไม่มีรายละเอียดกิจกรรม',
            image: imageUrl, tags: [], mapUrl: dbEvent.location 
          });

          fetchReviews(dbEvent.id);
          
          if (currentUser) {
            try {
              const favRes = await fetch(`http://192.168.174.35:3000/saved-events/${currentUser.id}`);
              const favData = await favRes.json();
              if (favData.status === 'success') {
                setIsFavorite(favData.data.some((savedEvent: any) => savedEvent.id === dbEvent.id));
              }
            } catch (error) {}
          }
        } else {
          setEventData({ title: 'ไม่พบกิจกรรม หรือกิจกรรมถูกลบแล้ว' });
        }
      } catch (error) {}
    };
    
    fetchEventDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn || !userData) {
      Alert.alert('ต้องเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อน', [{ text: 'ไปหน้า Login', onPress: () => router.push('/') }]);
      return;
    }
    if (!eventData?.dbId) return;
    setIsFavorite(!isFavorite);
    try {
      await fetch('http://192.168.174.35:3000/toggle-save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.id, event_id: eventData.dbId }) 
      });
    } catch (error) { setIsFavorite(isFavorite); }
  };

  const handleNavigate = () => {
    if (!eventData?.mapUrl || !eventData.mapUrl.startsWith('http')) {
      Alert.alert('ขออภัย', 'ไม่มีลิงก์แผนที่นำทาง'); return;
    }
    Linking.openURL(eventData.mapUrl).catch(err => Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดแผนที่ได้'));
  };

  //   ฟังก์ชันจัดการเมื่อกด "จุด 3 จุด"
  const handleReviewOptions = (review: any) => {
    if (!isLoggedIn || !userData) {
      Alert.alert('ต้องเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบเพื่อทำรายการ');
      return;
    }

    if (userData.id === review.user_id) {
      //  กรณีเป็น "เจ้าของรีวิว" 
      Alert.alert('จัดการรีวิว', 'คุณต้องการทำอะไรกับรีวิวนี้?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'แก้ไขรีวิว', onPress: () => startEditReview(review) },
        { text: 'ลบรีวิว', onPress: () => confirmDeleteReview(review.id), style: 'destructive' }
      ]);
    } else {
      //  กรณีเป็น "รีวิวคนอื่น" (รายงาน)
      Alert.alert('รายงานรีวิว', 'รีวิวนี้มีความไม่เหมาะสมใช่หรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'รายงานรีวิว', onPress: () => submitReportReview(review.id), style: 'destructive' }
      ]);
    }
  };

  //  ดึงข้อมูลเดิมมาใส่ฟอร์มเพื่อรอแก้ไข
  const startEditReview = (review: any) => {
    setEditingReviewId(review.id);
    setReviewText(review.comment);
    setUserRating(review.rating);
  };

  //  ส่ง API ไปลบรีวิวตัวเอง
  const confirmDeleteReview = async (reviewId: number) => {
    try {
      const res = await fetch(`http://192.168.174.35:3000/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        Alert.alert('สำเร็จ', 'ลบรีวิวเรียบร้อยแล้ว');
        fetchReviews(eventData.dbId);
      }
    } catch (err) { Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบรีวิวได้'); }
  };

  //  ส่ง API ไปรายงานรีวิวคนอื่น
  const submitReportReview = async (reviewId: number) => {
    try {
      const res = await fetch(`http://192.168.174.35:3000/api/reviews/${reviewId}/report`, { method: 'PUT' });
      if (res.ok) Alert.alert('ขอบคุณ', 'เราได้ส่งรายงานให้แอดมินตรวจสอบแล้ว');
    } catch (err) { Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งรายงานได้'); }
  };

  //  ฟังก์ชันส่งฟอร์ม (รองรับทั้งการ สร้างใหม่ และ แก้ไข)
  const handleSubmitReview = async () => {
    if (!isLoggedIn || !userData) return Alert.alert('ต้องเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบก่อน');
    if (userRating === 0) return Alert.alert('แจ้งเตือน', 'กรุณากดให้คะแนนดาว');
    if (!reviewText.trim()) return Alert.alert('แจ้งเตือน', 'กรุณาพิมพ์ความคิดเห็น');

    try {
      const apiUrl = editingReviewId 
        ? `http://192.168.174.35:3000/api/reviews/${editingReviewId}/edit` 
        : 'http://192.168.174.35:3000/add-review';
        
      const method = editingReviewId ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.id, event_id: eventData.dbId, rating: userRating, comment: reviewText })
      });
      
      if (response.ok) {
        Alert.alert('สำเร็จ', editingReviewId ? 'อัปเดตรีวิวสำเร็จ!' : 'ส่งรีวิวสำเร็จ!');
        setUserRating(0); 
        setReviewText(''); 
        setEditingReviewId(null); // รีเซ็ตโหมดแก้ไข
        fetchReviews(eventData.dbId); 
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้');
    }
  };

  if (!eventData) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#FF385C" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: eventData?.image }} style={styles.heroImage} />
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#0F172A" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={handleToggleFavorite}><Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#FF385C" : "#0F172A"} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row' }}>
              {(eventData?.tags || []).map((tag: string, i: number) => (<View key={i} style={styles.tagBadge}><Text style={styles.tagText}>{tag}</Text></View>))}
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{avgRating} <Text style={styles.reviewText}>({totalReviewsCount})</Text></Text>
            </View>
          </View>

          <Text style={styles.title}>{eventData?.title}</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}><Ionicons name="calendar" size={20} color="#FF385C" /></View>
            <View style={{ flex: 1 }}><Text style={styles.infoTitle}>วันและเวลา</Text><Text style={styles.infoDetail}>{eventData?.date}</Text></View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}><Ionicons name="location" size={20} color="#FF385C" /></View>
            <View style={{ flex: 1 }}><Text style={styles.infoTitle}>สถานที่จัดงาน</Text><Text style={styles.infoDetail}>{eventData?.location}</Text></View>
          </View>

          <Text style={styles.sectionTitle}>เกี่ยวกับกิจกรรม</Text>
          <Text style={styles.descriptionText}>{eventData?.description}</Text>
          <View style={styles.divider} />

          <View style={{ marginBottom: 30 }}>
            <Text style={styles.sectionTitle}>ความคิดเห็นจากผู้ใช้</Text>
            
            {/* ฟอร์มรีวิว (เปลี่ยนข้อความตามโหมด แก้ไข/สร้างใหม่) */}
            <View style={styles.reviewForm}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.reviewFormTitle}>{editingReviewId ? "✏️ แก้ไขรีวิวของคุณ" : "คุณคิดอย่างไรกับงานนี้?"}</Text>
                {editingReviewId && (
                  <TouchableOpacity onPress={() => { setEditingReviewId(null); setReviewText(''); setUserRating(0); }}>
                    <Text style={{ color: '#94A3B8', fontFamily: 'Prompt_500Medium', fontSize: 12 }}>ยกเลิก</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setUserRating(star)} activeOpacity={0.7}>
                    <Ionicons name={star <= userRating ? "star" : "star-outline"} size={32} color={star <= userRating ? "#FBBF24" : "#D1D5DB"} style={{ marginRight: 8 }} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.reviewInput} placeholder="แบ่งปันประสบการณ์ของคุณ..." multiline value={reviewText} onChangeText={setReviewText} />
              <TouchableOpacity style={[styles.submitReviewBtn, editingReviewId ? { backgroundColor: '#F59E0B' }]} onPress={handleSubmitReview}>
                <Text style={styles.submitReviewText}>{editingReviewId ? 'อัปเดตรีวิว' : 'ส่งรีวิว'}</Text>
              </TouchableOpacity>
            </View>

            {reviewsList.length === 0 ? (
              <Text style={{ fontFamily: 'Prompt_400Regular', color: '#94A3B8', textAlign: 'center', marginTop: 10 }}>ยังไม่มีรีวิว เป็นคนแรกที่รีวิวกิจกรรมนี้สิ!</Text>
            ) : (
              reviewsList.map((rev: any) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}><Text style={{ fontFamily: 'Prompt_700Bold', color: '#FFF' }}>{rev.username ? rev.username.charAt(0).toUpperCase() : 'U'}</Text></View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.reviewUser}>{rev.username}</Text>
                      <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text style={styles.ratingText}>{rev.rating}</Text>
                    </View>
                    
                    {/* 📍 ปุ่มจุด 3 จุด (โชว์เฉพาะคนล็อกอิน) */}
                    {isLoggedIn && (
                      <TouchableOpacity style={{ marginLeft: 15, padding: 5 }} onPress={() => handleReviewOptions(rev)}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.mapButton} onPress={handleNavigate} activeOpacity={0.8}>
          <Ionicons name="navigate-circle" size={28} color="#FFF" />
          <Text style={styles.mapButtonText}>นำทาง</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  imageContainer: { width: '100%', height: 350, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 25 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  tagText: { fontFamily: 'Prompt_500Medium', color: '#475569', fontSize: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontFamily: 'Prompt_700Bold', color: '#D97706', fontSize: 14, marginLeft: 4 },
  reviewText: { fontFamily: 'Prompt_400Regular', color: '#94A3B8', fontSize: 12 },
  title: { fontSize: 24, fontFamily: 'Prompt_700Bold', color: '#0F172A', lineHeight: 32 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFE4E6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoTitle: { fontFamily: 'Prompt_400Regular', color: '#64748B', fontSize: 12, marginBottom: 2 },
  infoDetail: { fontFamily: 'Prompt_500Medium', color: '#0F172A', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontFamily: 'Prompt_700Bold', color: '#0F172A', marginBottom: 15 },
  descriptionText: { fontFamily: 'Prompt_400Regular', color: '#475569', fontSize: 14, lineHeight: 24, marginBottom: 20 },
  reviewForm: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  reviewFormTitle: { fontFamily: 'Prompt_700Bold', fontSize: 14, color: '#0F172A' },
  reviewInput: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, fontFamily: 'Prompt_400Regular', fontSize: 14, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  submitReviewBtn: { backgroundColor: '#FF385C', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  submitReviewText: { fontFamily: 'Prompt_700Bold', color: '#FFF', fontSize: 14 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center' },
  reviewUser: { fontFamily: 'Prompt_700Bold', color: '#0F172A', fontSize: 14 },
  reviewDate: { fontFamily: 'Prompt_400Regular', color: '#94A3B8', fontSize: 11 },
  reviewComment: { fontFamily: 'Prompt_400Regular', color: '#475569', fontSize: 14, lineHeight: 22 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', elevation: 15 },
  mapButton: { flexDirection: 'row', height: 55, borderRadius: 16, backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  mapButtonText: { fontFamily: 'Prompt_700Bold', color: '#FFF', fontSize: 16, marginLeft: 8 },
});