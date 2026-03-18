import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // 🌟 นำเข้า expo-location สำหรับดึง GPS
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🌟 ข้อมูลทั้ง 60 งาน ที่เพิ่มพิกัด lat, lng เข้าไปให้พร้อมคำนวณแล้ว
const MOCK_EVENTS = [
  // 12 งานเดิม
  { id: '1', title: 'งานวัดภูเขาทอง 2569', category: 'เทศกาลและงานวัด', date: '15 - 20 ก.พ.', image: 'https://cms.dmpcdn.com/travel/2024/10/22/bf86a330-9050-11ef-9ac9-8bc58bd3f671_webp_original.webp', lat: 13.7538, lng: 100.5066 },
  { id: '2', title: 'ตลาดนัดคลองถม', category: 'ตลาดและช้อปปิ้ง', date: 'ทุกวันศุกร์ - อาทิตย์', image: 'https://shopee.co.th/blog/wp-content/uploads/2023/08/Shopee-Blog-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%81%E0%B9%88%E0%B8%B2-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%B1%E0%B8%94.jpg', lat: 13.7465, lng: 100.5061 },
  { id: '3', title: 'เทศกาลดนตรีกลางคืน', category: 'ดนตรีและคอนเสิร์ต', date: '28 ก.พ. 2569', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=500', lat: 13.7525, lng: 100.5003 },
  { id: '4', title: 'เทศกาลอาหารไทย', category: 'อาหารและเครื่องดื่ม', date: '10 มี.ค. 2569', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500', lat: 13.7265, lng: 100.5588 },
  { id: '5', title: 'นิทรรศการศิลปะดิจิทัล', category: 'ศิลปะและนิทรรศการ', date: '1-30 พ.ค. 2569', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=500', lat: 13.7466, lng: 100.5300 },
  { id: '6', title: 'Pet Lover Fair 2026', category: 'สัตว์เลี้ยง', date: '15-18 พ.ค. 2569', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500', lat: 13.9113, lng: 100.5484 },
  { id: '7', title: 'เวิร์กชอปปั้นเซรามิกมินิมอล', category: 'เวิร์กชอปและสัมมนา', date: 'ทุกเสาร์-อาทิตย์', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=500', lat: 13.7797, lng: 100.5446 },
  { id: '8', title: 'วิ่งมาราธอน ซิตี้รัน', category: 'กีฬาและเอาท์ดอร์', date: '12 เม.ย. 2569', image: 'https://plus.unsplash.com/premium_photo-1663134254080-a3e9f79ae748?q=80&w=1708&auto=format&fit=crop', lat: 13.7314, lng: 100.5415 },
  { id: '9', title: 'อาสาปลูกป่าชายเลน บางปู', category: 'ชุมชนและจิตอาสา', date: '20 ส.ค. 2569', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=774&auto=format&fit=crop', lat: 13.5186, lng: 100.6542 },
  { id: '10', title: 'แคมป์ปิ้งดูดาว เขาใหญ่', category: 'ท่องเที่ยวธรรมชาติ', date: '5-7 ธ.ค. 2569', image: 'https://images.unsplash.com/flagged/photo-1562307294-4060df701fa3?q=80&w=1016&auto=format&fit=crop', lat: 14.4392, lng: 101.3723 },
  { id: '11', title: 'งานเซลล์แบรนด์เนมประจำปี', category: 'ตลาดและช้อปปิ้ง', date: '1-5 ก.ค. 2569', image: 'https://images.unsplash.com/photo-1768775036854-75341e3a022b?q=80&w=1768&auto=format&fit=crop', lat: 13.7468, lng: 100.5346 },
  { id: '12', title: 'คอนเสิร์ตอินดี้ในสวน', category: 'ดนตรีและคอนเสิร์ต', date: '5 เม.ย. 2569', image: 'https://images.unsplash.com/photo-1749544292533-65b0ec299191?q=80&w=1750&auto=format&fit=crop', lat: 13.7292, lng: 100.5594 },
  
  // อาหารและเครื่องดื่ม 10
  { id: '13', title: 'Wongnai Food Fest 2026', category: 'อาหารและเครื่องดื่ม', date: 'ก.พ. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7468, lng: 100.5393 },
  { id: '14', title: 'เทศกาลอาหารเจ เยาวราช', category: 'อาหารและเครื่องดื่ม', date: 'ต.ค. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7408, lng: 100.5097 },
  { id: '15', title: 'Thailand Coffee Fest', category: 'อาหารและเครื่องดื่ม', date: 'มี.ค. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.9113, lng: 100.5484 },
  { id: '16', title: 'Bangkok Beer Festival', category: 'อาหารและเครื่องดื่ม', date: 'ธ.ค. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7508, lng: 100.5732 },
  { id: '17', title: 'งานเทศกาลทุเรียนนนท์', category: 'อาหารและเครื่องดื่ม', date: 'พ.ค. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.8643, lng: 100.4950 },
  { id: '18', title: 'เทศกาลกินกุ้ง กินปู', category: 'อาหารและเครื่องดื่ม', date: 'เม.ย. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.3512, lng: 100.9856 },
  { id: '19', title: 'Artbox Food Street', category: 'อาหารและเครื่องดื่ม', date: 'ทุกเสาร์-อาทิตย์', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.8000, lng: 100.5510 },
  { id: '20', title: 'เทศกาลอาหารอีสานแซ่บ', category: 'อาหารและเครื่องดื่ม', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7314, lng: 100.5415 },
  { id: '21', title: 'แบงค็อก ซีฟู้ด เฟสติวัล', category: 'อาหารและเครื่องดื่ม', date: 'ส.ค. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7042, lng: 100.5034 },
  { id: '22', title: 'มหกรรมขนมหวานนานาชาติ', category: 'อาหารและเครื่องดื่ม', date: 'ก.ย. 2569', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500', lat: 13.7468, lng: 100.5346 },

  // ตลาดและช้อปปิ้ง 5
  { id: '23', title: 'จ๊อดแฟร์ (Jodd Fairs) แดนเนรมิต', category: 'ตลาดและช้อปปิ้ง', date: 'เปิดทุกวัน', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500', lat: 13.7580, lng: 100.5658 },
  { id: '24', title: 'ถนนคนเดินท่าแพ', category: 'ตลาดและช้อปปิ้ง', date: 'ทุกวันอาทิตย์', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500', lat: 18.7877, lng: 98.9931 },
  { id: '25', title: 'ตลาดชิคาด้า (Cicada Market)', category: 'ตลาดและช้อปปิ้ง', date: 'ทุกศุกร์-อาทิตย์', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500', lat: 12.5341, lng: 99.9658 },
  { id: '26', title: 'ตลาดน้ำอัมพวา', category: 'ตลาดและช้อปปิ้ง', date: 'ทุกศุกร์-อาทิตย์', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500', lat: 13.4259, lng: 99.9550 },
  { id: '27', title: 'Siam Square Walking Street', category: 'ตลาดและช้อปปิ้ง', date: 'ทุกศุกร์-อาทิตย์', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500', lat: 13.7445, lng: 100.5305 },

  // ดนตรีและคอนเสิร์ต 5
  { id: '28', title: 'Big Mountain Music Festival', category: 'ดนตรีและคอนเสิร์ต', date: 'ธ.ค. 2569', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500', lat: 14.4392, lng: 101.3723 },
  { id: '29', title: 'Cat Expo', category: 'ดนตรีและคอนเสิร์ต', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500', lat: 13.8242, lng: 100.6781 },
  { id: '30', title: 'Pattaya Music Festival', category: 'ดนตรีและคอนเสิร์ต', date: 'มี.ค. 2569', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500', lat: 12.9430, lng: 100.8841 },
  { id: '31', title: 'Wonderfruit Festival', category: 'ดนตรีและคอนเสิร์ต', date: 'ธ.ค. 2569', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500', lat: 12.8711, lng: 100.9922 },
  { id: '32', title: 'Chiang Mai Jazz Festival', category: 'ดนตรีและคอนเสิร์ต', date: 'ก.พ. 2569', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500', lat: 18.7961, lng: 98.9666 },

  // เทศกาลและงานวัด 9
  { id: '33', title: 'งานกาชาดประจำปี', category: 'เทศกาลและงานวัด', date: 'ธ.ค. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 13.7314, lng: 100.5415 },
  { id: '34', title: 'ประเพณีสงกรานต์ ถนนข้าวสาร', category: 'เทศกาลและงานวัด', date: '13-15 เม.ย.', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 13.7590, lng: 100.4974 },
  { id: '35', title: 'ประเพณีลอยกระทง สุโขทัย', category: 'เทศกาลและงานวัด', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 17.0187, lng: 99.7042 },
  { id: '36', title: 'งานสมโภชองค์พระปฐมเจดีย์', category: 'เทศกาลและงานวัด', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 13.8197, lng: 100.0601 },
  { id: '37', title: 'งานแห่เทียนพรรษา', category: 'เทศกาลและงานวัด', date: 'ก.ค. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 15.2287, lng: 104.8569 },
  { id: '38', title: 'ประเพณีผีตาโขน', category: 'เทศกาลและงานวัด', date: 'มิ.ย. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 17.2764, lng: 101.1466 },
  { id: '39', title: 'งานนมัสการหลวงพ่อโสธร', category: 'เทศกาลและงานวัด', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 13.6738, lng: 101.0673 },
  { id: '40', title: 'งานไหลเรือไฟ', category: 'เทศกาลและงานวัด', date: 'ต.ค. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 17.3995, lng: 104.7865 },
  { id: '41', title: 'งานฉลองย่าโม', category: 'เทศกาลและงานวัด', date: 'มี.ค. 2569', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=500', lat: 14.9735, lng: 102.0967 },

  // กีฬาและเอาท์ดอร์ 5
  { id: '42', title: 'Amazing Thailand Marathon', category: 'กีฬาและเอาท์ดอร์', date: 'ก.พ. 2569', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500', lat: 13.7563, lng: 100.5018 },
  { id: '43', title: 'ลากูน่า ภูเก็ต ไตรกีฬา', category: 'กีฬาและเอาท์ดอร์', date: 'พ.ย. 2569', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500', lat: 7.9944, lng: 98.3009 },
  { id: '44', title: 'บุรีรัมย์ มาราธอน', category: 'กีฬาและเอาท์ดอร์', date: 'ม.ค. 2569', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500', lat: 14.9660, lng: 103.0945 },
  { id: '45', title: 'ปั่นจักรยานรอบเกาะรัตนโกสินทร์', category: 'กีฬาและเอาท์ดอร์', date: 'ทุกวันอาทิตย์', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500', lat: 13.7525, lng: 100.5003 },
  { id: '46', title: 'เทศกาลว่าววิ่งนานาชาติ', category: 'กีฬาและเอาท์ดอร์', date: 'มี.ค. 2569', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500', lat: 12.5684, lng: 99.9577 },

  // ศิลปะและนิทรรศการ 5
  { id: '47', title: 'Bangkok Design Week', category: 'ศิลปะและนิทรรศการ', date: 'ก.พ. 2569', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500', lat: 13.7275, lng: 100.5152 },
  { id: '48', title: 'Thailand Biennale', category: 'ศิลปะและนิทรรศการ', date: 'ธ.ค. 2569', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500', lat: 19.9105, lng: 99.8406 },
  { id: '49', title: 'นิทรรศการ Van Gogh Alive', category: 'ศิลปะและนิทรรศการ', date: 'เปิดทุกวัน', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500', lat: 13.7265, lng: 100.5105 },
  { id: '50', title: 'เทศกาลหนังสือแห่งชาติ', category: 'ศิลปะและนิทรรศการ', date: 'ต.ค. 2569', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500', lat: 13.7265, lng: 100.5588 },
  { id: '51', title: 'Hotel Art Fair', category: 'ศิลปะและนิทรรศการ', date: 'ก.ย. 2569', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500', lat: 13.7230, lng: 100.5110 },

  // สัตว์เลี้ยง 3
  { id: '52', title: 'Thailand International Dog Show', category: 'สัตว์เลี้ยง', date: 'ก.ค. 2569', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500', lat: 13.9113, lng: 100.5484 },
  { id: '53', title: 'Cat T-Shirt & Cat Fest', category: 'สัตว์เลี้ยง', date: 'พ.ค. 2569', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500', lat: 13.7516, lng: 100.5615 },
  { id: '54', title: 'Pet Healthcare Fair', category: 'สัตว์เลี้ยง', date: 'ส.ค. 2569', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=500', lat: 13.6702, lng: 100.6111 },

  // ท่องเที่ยวธรรมชาติ 6
  { id: '55', title: 'ทุ่งดอกทานตะวัน พัฒนานิคม', category: 'ท่องเที่ยวธรรมชาติ', date: 'ธ.ค. - ม.ค.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 14.8519, lng: 100.9996 },
  { id: '56', title: 'ชมดอกนางพญาเสือโคร่ง', category: 'ท่องเที่ยวธรรมชาติ', date: 'ม.ค. - ก.พ.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 18.5880, lng: 98.4862 },
  { id: '57', title: 'งานประเพณีขึ้นเขาคิชฌกูฏ', category: 'ท่องเที่ยวธรรมชาติ', date: 'ก.พ. - เม.ย.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 12.8394, lng: 102.1384 },
  { id: '58', title: 'เทศกาลชมทะเลบัวแดง', category: 'ท่องเที่ยวธรรมชาติ', date: 'ธ.ค. - ก.พ.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 17.1856, lng: 103.0401 },
  { id: '59', title: 'เทศกาลบอลลูนนานาชาติ', category: 'ท่องเที่ยวธรรมชาติ', date: 'ก.พ. 2569', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 19.8530, lng: 99.7431 },
  { id: '60', title: 'ดูดาวอาบป่า (Stargazing)', category: 'ท่องเที่ยวธรรมชาติ', date: 'พ.ย. - ก.พ.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', lat: 19.3995, lng: 98.8781 }
];

const FILTERS = [
  'ทั้งหมด', 'อาหารและเครื่องดื่ม', 'ตลาดและช้อปปิ้ง', 'ดนตรีและคอนเสิร์ต', 
  'เทศกาลและงานวัด', 'กีฬาและเอาท์ดอร์', 'ศิลปะและนิทรรศการ', 'สัตว์เลี้ยง', 'ท่องเที่ยวธรรมชาติ'
];

// 🌟 ฟังก์ชันคำนวณระยะทาง (สูตร Haversine) ให้ผลลัพธ์เป็นกิโลเมตร
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // รัศมีของโลก (กม.)
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
  
  // 🌟 State เก็บพิกัด GPS ของผู้ใช้
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 🌟 ดึง GPS ของผู้ใช้เมื่อเข้ามาในหน้านี้
  useEffect(() => {
    const getUserLocation = async () => {
      // ถ้ารับพิกัดมาจากหน้า Home (กดปุ่ม "กิจกรรมใกล้ฉัน")
      if (params.lat && params.lon) {
        setUserLocation({ lat: Number(params.lat), lng: Number(params.lon) });
        return;
      }
      
      // ถ้าไม่มีพิกัดส่งมา ให้แอปร้องขอสิทธิ์ GPS และดึงพิกัดปัจจุบัน
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
          // 1. ดึงคะแนนดาว
          let ratingsMap: any = {};
          try {
            const res = await fetch('http://192.168.174.35:3000/all-ratings');
            const data = await res.json();
            if (data.status === 'success') {
              data.data.forEach((r: any) => {
                ratingsMap[r.event_id.toString()] = { avg: r.avg_rating, count: r.total_reviews };
              });
            }
          } catch (e) {
            console.error('ไม่สามารถดึงคะแนนดาวได้', e);
          }

          // 2. คำนวณระยะทางจริงจาก GPS
          let result = [...MOCK_EVENTS].map(e => {
            let distanceKm = 999999; // ตั้งค่าเริ่มต้นให้ไกลมากๆ ไว้ก่อน
            let distanceText = 'ไม่ทราบระยะทาง'; 

            // ถ้ามีพิกัด GPS ผู้ใช้ และงานนั้นมีพิกัด
            if (userLocation && e.lat && e.lng) {
              distanceKm = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, e.lat, e.lng);
              // ถ้าใกล้กว่า 1 กม. ให้โชว์เป็น 'เมตร' ถ้าไกลกว่าให้โชว์ 'กม.'
              distanceText = distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} ม.` : `${distanceKm.toFixed(1)} กม.`;
            }

            return {
              ...e,
              rating: ratingsMap[e.id] ? ratingsMap[e.id].avg : '0.0',
              reviewsCount: ratingsMap[e.id] ? ratingsMap[e.id].count : '0',
              distanceKm: distanceKm, // เก็บตัวเลขไว้เรียงลำดับ
              realDistanceText: distanceText // ข้อความระยะทางที่จะโชว์บนหน้าจอ
            };
          });
          
          // 3. กรองตามหมวดหมู่และคำค้นหา
          if (activeFilter !== 'ทั้งหมด') result = result.filter(e => e.category === activeFilter);
          if (searchQuery.trim() !== '') result = result.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
          
          // 🌟 4. ถ้ามี GPS หรือกดมาจากโหมด near_me ให้เรียงลำดับจาก "ใกล้สุดไปไกลสุด"
          if (userLocation || params.mode === 'near_me') {
            result.sort((a, b) => a.distanceKm - b.distanceKm);
          }

          setEvents(result);
        } catch (error) {
          console.error(error);
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
                    {/* 🌟 แสดงระยะทางจริงที่คำนวณได้ */}
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