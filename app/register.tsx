import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // 1. เช็กว่ากรอกข้อมูลครบไหม
    if (!username || !email || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    try {
      // 2. ส่งข้อมูลไปที่ Backend
      const response = await fetch('http://192.168.174.35:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          email: email, 
          password: password 
        }),
      });
      
      const data = await response.json();

      // 3. เช็กคำตอบจากเซิร์ฟเวอร์
      if (data.status === 'success') {
        // 🌟 แก้ตรงนี้: ให้เซฟ data.user ที่ได้จาก Backend โดยตรงเลย (โครงสร้างจะได้ตรงกับตอน Login)
        try {
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        } catch (error) {
          console.error('Error saving user data', error);
        }

        // แจ้งเตือนสำเร็จ แล้วเด้งไปหน้า Home ทันที
        Alert.alert('สำเร็จ! 🎉', 'ลงทะเบียนและเข้าสู่ระบบเรียบร้อย', [
          { 
            text: 'เริ่มต้นใช้งาน', 
            onPress: () => router.replace('/(tabs)/home') 
          } 
        ]);
      } else {
        // แจ้งเตือน Error จาก Backend (เช่น อีเมลซ้ำ)
        Alert.alert('เกิดข้อผิดพลาด', data.message);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('การเชื่อมต่อล้มเหลว', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend หรือ XAMPP ทำงานอยู่');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" 
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>สร้างบัญชีใหม่</Text>
            <Text style={styles.subtitle}>เข้าร่วมเป็นส่วนหนึ่งของ Town Pulse</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="ชื่อผู้ใช้ (Username)" 
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="อีเมล (Email)" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="รหัสผ่าน (Password)" 
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่ไหม? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontFamily: 'Prompt_700Bold', color: '#1E1B4B', marginBottom: 5 },
  subtitle: { fontSize: 14, fontFamily: 'Prompt_400Regular', color: '#6B7280' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Prompt_400Regular', fontSize: 15, color: '#111827' },
  registerButton: { backgroundColor: '#1E1B4B', borderRadius: 15, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3, shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  registerButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Prompt_700Bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontFamily: 'Prompt_400Regular', color: '#6B7280', fontSize: 14 },
  loginText: { fontFamily: 'Prompt_700Bold', color: '#1E1B4B', fontSize: 14 },
});