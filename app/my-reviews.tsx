import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MyReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        const res = await fetch(`http://192.168.174.35:3000/user-reviews/${user.id}`);
        const data = await res.json();
        
        if (data.status === 'success') {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching my reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>ประวัติการรีวิวของฉัน</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF385C" /></View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="star-half-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>คุณยังไม่ได้รีวิวกิจกรรมใดๆ</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {reviews.map(rev => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.eventInfoRow}>
                <Image source={{ uri: rev.image_url || 'https://via.placeholder.com/150' }} style={styles.eventImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{rev.event_title}</Text>
                  <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>{rev.rating}</Text>
                </View>
              </View>
              
              <View style={styles.commentBox}>
                <Text style={styles.commentText}>{rev.comment}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'Prompt_400Regular', color: '#94A3B8', marginTop: 15, fontSize: 15 },
  listContainer: { padding: 20 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eventImage: { width: 44, height: 44, borderRadius: 8 },
  eventTitle: { fontFamily: 'Prompt_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 2 },
  reviewDate: { fontFamily: 'Prompt_400Regular', fontSize: 12, color: '#64748B' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontFamily: 'Prompt_700Bold', color: '#D97706', fontSize: 14, marginLeft: 4 },
  commentBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  commentText: { fontFamily: 'Prompt_400Regular', color: '#475569', fontSize: 14, lineHeight: 22 }
});