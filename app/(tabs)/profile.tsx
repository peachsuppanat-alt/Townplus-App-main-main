import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  
  // 🌟 State เก็บจำนวนรีวิว และ จำนวนกิจกรรมที่บันทึกไว้
  const [totalReviews, setTotalReviews] = useState(0);
  const [savedEventsCount, setSavedEventsCount] = useState(0); // 🌟 เพิ่มตัวแปรเก็บจำนวนที่กดหัวใจ

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const storedUser = await AsyncStorage.getItem('user_data');
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData({
              id: parsedUser.id,
              name: parsedUser.username || 'ผู้ใช้งาน', 
              email: parsedUser.email || 'ไม่มีอีเมล',
              avatarChar: parsedUser.username ? parsedUser.username.charAt(0).toUpperCase() : 'U'
            });

            // 1. ดึงจำนวนรีวิวทั้งหมดจาก Backend
            try {
              const res = await fetch(`http://192.168.174.35:3000/user-reviews/${parsedUser.id}`);
              const data = await res.json();
              if (data.status === 'success') {
                setTotalReviews(data.totalCount);
              }
            } catch (e) {
              console.error('ไม่สามารถดึงจำนวนรีวิวได้', e);
            }

            // 🌟 2. ดึงจำนวนกิจกรรมที่กดหัวใจไว้ (จาก API ที่เรามีอยู่แล้ว)
            try {
              const resSaved = await fetch(`http://192.168.174.35:3000/saved-events/${parsedUser.id}`);
              const dataSaved = await resSaved.json();
              if (dataSaved.status === 'success') {
                setSavedEventsCount(dataSaved.data.length); // นับจำนวนงานในรายการที่ส่งกลับมา
              }
            } catch (e) {
              console.error('ไม่สามารถดึงจำนวนกิจกรรมที่บันทึกได้', e);
            }

          } else {
            setUserData({
              name: 'ผู้มาเยือน',
              email: 'guest@townpulse.com',
              avatarChar: 'G'
            });
            setTotalReviews(0);
            setSavedEventsCount(0); // รีเซ็ตเป็น 0 ถ้าไม่ได้ล็อกอิน
          }
        } catch (error) {
          console.error('Failed to load user data', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_data');
      router.replace('/'); 
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการออกจากระบบ', error);
    }
  };

  const MenuItem = ({ icon, title, color = '#0F172A', onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}><Ionicons name={icon} size={20} color={color} /></View>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  if (isLoading || !userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>โปรไฟล์ของฉัน</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userData.avatarChar}</Text>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          <View style={styles.statsBox}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReviews}</Text>
              <Text style={styles.statLabel}>รีวิวทั้งหมด</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {/* 🌟 แสดงจำนวนที่กดหัวใจจริงจาก Database */}
              <Text style={styles.statValue}>{savedEventsCount}</Text>
              <Text style={styles.statLabel}>กิจกรรมที่รอไป</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>บัญชีและการตั้งค่า</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="person-outline" title="แก้ไขโปรไฟล์" onPress={() => {}} />
            <MenuItem icon="star-outline" title="ประวัติการรีวิวของฉัน" onPress={() => router.push('/my-reviews')} />
            <MenuItem icon="notifications-outline" title="การแจ้งเตือน" onPress={() => router.push('/notifications')} />
          </View>

          <Text style={styles.sectionTitle}>อื่นๆ</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="help-circle-outline" title="ศูนย์ช่วยเหลือ" onPress={() => {}} />
            <MenuItem icon="log-out-outline" title="ออกจากระบบ" color="#EF4444" onPress={() => setLogoutModalVisible(true)} />
          </View>
        </View>
      </ScrollView>

      {/* Modal ออกจากระบบ */}
      <Modal animationType="fade" transparent={true} visible={isLogoutModalVisible} onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconBox}><Ionicons name="log-out-outline" size={36} color="#EF4444" /></View>
            <Text style={styles.modalTitle}>ออกจากระบบ</Text>
            <Text style={styles.modalMessage}>คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีนี้?</Text>
            
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setLogoutModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmLogout} activeOpacity={0.7}>
                <Text style={styles.modalConfirmText}>ออกจากระบบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title: { fontSize: 24, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  profileSection: { backgroundColor: '#FFF', padding: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1E1B4B', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 4, borderColor: '#F1F5F9' },
  avatarText: { fontFamily: 'Prompt_700Bold', fontSize: 36, color: '#FFF' },
  userName: { fontFamily: 'Prompt_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 2 },
  userEmail: { fontFamily: 'Prompt_400Regular', fontSize: 14, color: '#64748B', marginBottom: 20 },
  statsBox: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, paddingVertical: 15, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'Prompt_700Bold', fontSize: 20, color: '#FF385C' },
  statLabel: { fontFamily: 'Prompt_400Regular', fontSize: 12, color: '#64748B' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  menuSection: { padding: 20 },
  sectionTitle: { fontFamily: 'Prompt_700Bold', fontSize: 16, color: '#0F172A', marginBottom: 10, marginTop: 10 },
  menuCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 5, elevation: 2, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { fontFamily: 'Prompt_500Medium', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 25, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'Prompt_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 10 },
  modalMessage: { fontFamily: 'Prompt_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButtonGroup: { flexDirection: 'row', width: '100%', gap: 12 },
  modalCancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { fontFamily: 'Prompt_700Bold', fontSize: 15, color: '#475569' },
  modalConfirmButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center', elevation: 2, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modalConfirmText: { fontFamily: 'Prompt_700Bold', fontSize: 15, color: '#FFF' },
});