import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 🌟 1. เพิ่ม MaterialCommunityIcons
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🌟 2. เปลี่ยน Mock Data ให้ใช้ชื่อไอคอนของ MaterialCommunityIcons
const ALL_CATEGORIES = [
  { id: '1', name: 'อาหารและเครื่องดื่ม', icon: 'silverware-fork-knife', bgColor: '#FFE4E6' },
  { id: '2', name: 'เทศกาลและงานวัด', icon: 'ferris-wheel', bgColor: '#FEF3C7' }, 
  { id: '3', name: 'ตลาดและช้อปปิ้ง', icon: 'shopping-outline', bgColor: '#F3E8FF' },
  { id: '4', name: 'ดนตรีและคอนเสิร์ต', icon: 'music-note', bgColor: '#E0E7FF' },
  { id: '5', name: 'กีฬาและเอาท์ดอร์', icon: 'run', bgColor: '#D1FAE5' },
  { id: '6', name: 'ศิลปะและนิทรรศการ', icon: 'palette', bgColor: '#E0F2FE' },
  { id: '7', name: 'เวิร์กชอปและสัมมนา', icon: 'book-open-variant', bgColor: '#FCE7F3' },
  { id: '8', name: 'ชุมชนและจิตอาสา', icon: 'handshake-outline', bgColor: '#DCFCE7' },
  { id: '9', name: 'ท่องเที่ยวธรรมชาติ', icon: 'tent', bgColor: '#D1FAE5' },
  { id: '10', name: 'สัตว์เลี้ยง', icon: 'dog', bgColor: '#FFEDD5' },
];

export default function AllCategoriesScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryName: string) => {
    // พอกดเลือกหมวดหมู่ไหน ก็ส่งชื่อนั้นไปให้หน้า Explore ค้นหาต่อ
    router.push({ pathname: '/(tabs)/explore', params: { category: categoryName } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ส่วนหัวของหน้า */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>หมวดหมู่ทั้งหมด</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>ค้นหากิจกรรมตามสไตล์ที่คุณชอบ</Text>
        
        {/* จัดเรียงแบบ Grid (ตาราง 2 คอลัมน์) */}
        <View style={styles.gridContainer}>
          {ALL_CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.gridItem} 
              activeOpacity={0.7} 
              onPress={() => handleCategoryPress(cat.name)}
            >
              <View style={[styles.iconBox, { backgroundColor: cat.bgColor }]}>
                {/* 🌟 3. เรียกใช้ MaterialCommunityIcons ตรงนี้ */}
                <MaterialCommunityIcons name={cat.icon as any} size={36} color="#1E1B4B" />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF'
  },
  backCircle: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', 
    justifyContent: 'center', alignItems: 'center' 
  },
  title: { fontSize: 20, fontFamily: 'Prompt_700Bold', color: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 16, fontFamily: 'Prompt_500Medium', color: '#64748B', marginBottom: 20 },
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  gridItem: { 
    width: '48%', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 3, 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8 
  },
  iconBox: { 
    width: 70, height: 70, borderRadius: 35, 
    justifyContent: 'center', alignItems: 'center', 
    marginBottom: 15 
  },
  categoryName: { 
    fontSize: 14, 
    fontFamily: 'Prompt_500Medium', 
    color: '#334155',
    textAlign: 'center', 
    lineHeight: 20
  }
});