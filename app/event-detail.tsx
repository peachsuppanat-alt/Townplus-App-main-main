import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // รับค่า ID ของงานที่ส่งมา
  const [reviewText, setReviewText] = useState('');
  
  // 🌟 จำลองสถานะ Login (TODO: Backend ต้องเชื่อมระบบ Session ตรงนี้)
  const isLoggedIn = true; 

  const handleOpenMap = () => {
    // โค้ดสำหรับเปิด Google Maps / Apple Maps
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${13.7563},${100.5018}`; // พิกัดจำลอง (ภูเขาทอง)
    const label = 'งานวัดภูเขาทอง';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url as string);
  };

  const handlePostReview = () => {
    if (!isLoggedIn) {
      Alert.alert('กรุณาเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแสดงความคิดเห็นได้', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ไปหน้า Login', onPress: () => router.push('/') }
      ]);
      return;
    }
    if (reviewText.trim() === '') return;
    
    // TODO: Backend ยิง API บันทึกรีวิวลง Database
    Alert.alert('สำเร็จ', 'บันทึกรีวิวของคุณแล้ว');
    setReviewText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Image & Back Button */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800' }} style={styles.coverImage} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* ข้อมูลกิจกรรม */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>งานวัดภูเขาทอง 2569</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#FF385C" />
              <Text style={styles.infoText}>15 - 20 กุมภาพันธ์ 2569</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#FF385C" />
              <Text style={styles.infoText}>วัดสระเกศราชวรมหาวิหาร (ห่างไป 0.5 กม.)</Text>
            </View>

            <Text style={styles.description}>
              งานประจำปีที่ยิ่งใหญ่ที่สุดในย่านฝั่งพระนคร นมัสการพระบรมบรรพต สนุกกับเครื่องเล่นม้าหมุน ชิงช้าสวรรค์ และร้านอาหารสตรีทฟู้ดกว่า 200 ร้าน
            </Text>

            {/* ✨ ไฮไลท์แนะนำโดยแอดมิน (Admin's Picks) */}
            <View style={styles.adminPickBox}>
              <View style={styles.adminPickHeader}>
                <Ionicons name="sparkles" size={20} color="#D97706" />
                <Text style={styles.adminPickTitle}> แอดมินแนะนำ (Admin's Picks)</Text>
              </View>
              <Text style={styles.adminPickText}>
                🎯 พลาดไม่ได้: "ร้านผัดไทยเจ๊นก" โซนประตู 2 และจุดถ่ายรูปไฟประดับทางขึ้นภูเขาทองตอน 1 ทุ่มสวยมาก แนะนำให้มาวันธรรมดาคนจะไม่แน่นเกินไปครับ
              </Text>
            </View>

            {/* ⭐️ ส่วนของรีวิว (Reviews) */}
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>รีวิวจากผู้ใช้งาน (4.8 ⭐️)</Text>
              
              {/* ช่องพิมพ์รีวิว */}
              <View style={styles.reviewInputContainer}>
                <TextInput 
                  style={styles.reviewInput} 
                  placeholder="เขียนรีวิวและให้คะแนนที่นี่..." 
                  multiline
                  value={reviewText}
                  onChangeText={setReviewText}
                />
                <TouchableOpacity style={styles.postReviewButton} onPress={handlePostReview}>
                  <Ionicons name="send" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Mock Comment */}
              <View style={styles.commentBox}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commenterName}>@StudentLife</Text>
                  <Text style={styles.commentStars}>⭐️⭐️⭐️⭐️⭐️</Text>
                </View>
                <Text style={styles.commentText}>ของกินเยอะมากกก บรรยากาศดีครับ แนะนำให้นั่งวินมา รถติดสุดๆ</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* 🗺️ Floating Button นำทาง (Navigate) ด้านล่างจอ */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.navigateButton} onPress={handleOpenMap} activeOpacity={0.9}>
            <Ionicons name="navigate" size={24} color="#FFF" />
            <Text style={styles.navigateText}>นำทางไปที่นี่ (Navigate)</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { paddingBottom: 100 },
  imageContainer: { position: 'relative' },
  coverImage: { width: '100%', height: 280 },
  backButton: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { flex: 1, fontSize: 24, fontFamily: 'Prompt_700Bold', color: '#1E1B4B' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10, marginTop: 5 },
  verifiedText: { fontSize: 11, fontFamily: 'Prompt_700Bold', color: '#059669', marginLeft: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 14, fontFamily: 'Prompt_500Medium', color: '#4B5563', marginLeft: 8 },
  description: { fontSize: 14, fontFamily: 'Prompt_400Regular', color: '#6B7280', lineHeight: 24, marginTop: 10, marginBottom: 20 },
  adminPickBox: { backgroundColor: '#FEF3C7', padding: 15, borderRadius: 16, marginBottom: 25 },
  adminPickHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  adminPickTitle: { fontSize: 16, fontFamily: 'Prompt_700Bold', color: '#D97706' },
  adminPickText: { fontSize: 14, fontFamily: 'Prompt_400Regular', color: '#92400E', lineHeight: 22 },
  reviewSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Prompt_700Bold', color: '#1E1B4B', marginBottom: 15 },
  reviewInputContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  reviewInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 16, padding: 15, paddingTop: 15, fontFamily: 'Prompt_400Regular', fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  postReviewButton: { width: 50, height: 50, backgroundColor: '#1E1B4B', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 5 },
  commentBox: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 16, marginBottom: 15 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  commenterName: { fontSize: 14, fontFamily: 'Prompt_700Bold', color: '#374151' },
  commentStars: { fontSize: 12 },
  commentText: { fontSize: 13, fontFamily: 'Prompt_400Regular', color: '#6B7280' },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: Platform.OS === 'ios' ? 35 : 20 },
  navigateButton: { flexDirection: 'row', backgroundColor: '#FF385C', padding: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF385C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  navigateText: { color: '#FFF', fontSize: 16, fontFamily: 'Prompt_700Bold', marginLeft: 10 },
});