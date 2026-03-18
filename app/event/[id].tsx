import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// 🌟 Mockup โดนลบ reviews ออกแล้ว เพื่อรอรับจาก DB ล้วนๆ
const MOCK_EVENTS: any = {
  // --- 12 งานเดิม ---
  '1': { dbId: 1, title: 'งานวัดภูเขาทอง 2569', date: '15 - 20 ก.พ. 2569 • 16:00 - 23:00 น.', location: 'วัดสระเกศราชวรมหาวิหาร', distance: '0.5 กม.', price: 'เข้าฟรี', description: 'กลับมาอีกครั้งกับงานวัดที่ยิ่งใหญ่ที่สุดในกรุงเทพฯ...', image: 'https://cms.dmpcdn.com/travel/2024/10/22/bf86a330-9050-11ef-9ac9-8bc58bd3f671_webp_original.webp', tags: ['เทศกาล', 'ของกิน'], lat: 13.7538, lng: 100.5066 },
  '2': { dbId: 2, title: 'ตลาดนัดคลองถม (Night Market)', date: 'ทุกวันศุกร์ - อาทิตย์ • 18:00 - 01:00 น.', location: 'ย่านคลองถม กรุงเทพฯ', distance: '1.2 กม.', price: 'เข้าฟรี', description: 'สวรรค์ของนักช้อปปิ้งของมือสอง...', image: 'https://shopee.co.th/blog/wp-content/uploads/2023/08/Shopee-Blog-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%81%E0%B9%88%E0%B8%B2-%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%B1%E0%B8%94.jpg', tags: ['ช้อปปิ้ง', 'สตรีทฟู้ด'], lat: 13.7465, lng: 100.5061 },
  '3': { dbId: 3, title: 'เทศกาลดนตรีกลางคืน (Night Vibe Fest)', date: '28 ก.พ. 2569 • 18:00 - 24:00 น.', location: 'ลานคนเมือง', distance: '3.5 กม.', price: '599.-', description: 'ปลดปล่อยความสนุกไปกับเสียงดนตรีจากศิลปินอินดี้ชั้นนำ', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop', tags: ['คอนเสิร์ต', 'ดนตรีสด'], lat: 13.7525, lng: 100.5003 },
  '4': { dbId: 4, title: 'เทศกาลอาหารไทย', date: '10 มี.ค. 2569 • 10:00 - 21:00 น.', location: 'ศูนย์สิริกิติ์', distance: '2.0 กม.', price: 'เข้าฟรี', description: 'รวมร้านอาหารระดับมิชลินสตาร์และสตรีทฟู้ดชื่อดังจากทั่วประเทศไทยมาไว้ในที่เดียว', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800', tags: ['อาหาร', 'สตรีทฟู้ด'], lat: 13.7265, lng: 100.5588 },
  '5': { dbId: 5, title: 'นิทรรศการศิลปะดิจิทัล', date: '1-30 พ.ค. 2569 • 10:00 - 19:00 น.', location: 'BACC หอศิลป์ฯ', distance: '4.5 กม.', price: '200.-', description: 'นิทรรศการศิลปะแบบ Immersive Art ที่จะพาคุณดำดิ่งไปในโลกแห่งแสงสี', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=800', tags: ['ศิลปะ', 'นิทรรศการ'], lat: 13.7466, lng: 100.5300 },
  '6': { dbId: 6, title: 'Pet Lover Fair 2026', date: '15-18 พ.ค. 2569 • 10:00 - 20:00 น.', location: 'อิมแพ็ค เมืองทองธานี', distance: '6.0 กม.', price: '100.-', description: 'งานแฟร์สำหรับคนรักสัตว์เลี้ยง พบกับสินค้าลดราคา คลินิกตรวจสุขภาพฟรี', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800', tags: ['สัตว์เลี้ยง', 'ช้อปปิ้ง'], lat: 13.9113, lng: 100.5484 },
  '7': { dbId: 7, title: 'เวิร์กชอปปั้นเซรามิกมินิมอล', date: 'ทุกเสาร์-อาทิตย์ • 13:00 - 16:00 น.', location: 'สตูดิโอ อารีย์', distance: '2.8 กม.', price: '1,200.-', description: 'เรียนรู้พื้นฐานการปั้นเซรามิกด้วยมือแบบง่ายๆ ได้ผลงานกลับบ้าน 2 ชิ้น', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800', tags: ['เวิร์กชอป', 'งานคราฟต์'], lat: 13.7797, lng: 100.5446 },
  '8': { dbId: 8, title: 'วิ่งมาราธอน ซิตี้รัน', date: '12 เม.ย. 2569 • 04:00 - 10:00 น.', location: 'สวนลุมพินี', distance: '5.0 กม.', price: '850.-', description: 'งานวิ่งมาราธอนใจกลางเมืองหลวง สัมผัสอากาศยามเช้าและวิวตึกระฟ้า', image: 'https://plus.unsplash.com/premium_photo-1663134254080-a3e9f79ae748?q=80&w=1708&auto=format&fit=crop', tags: ['กีฬา', 'วิ่ง'], lat: 13.7314, lng: 100.5415 },
  '9': { dbId: 9, title: 'อาสาปลูกป่าชายเลน บางปู', date: '20 ส.ค. 2569 • 08:00 - 12:00 น.', location: 'สถานตากอากาศบางปู', distance: '25 กม.', price: 'ฟรี', description: 'ร่วมเป็นส่วนหนึ่งในการอนุรักษ์ธรรมชาติ ปลูกต้นโกงกางและทำความสะอาดป่าชายเลน', image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=774&auto=format&fit=crop', tags: ['จิตอาสา', 'ธรรมชาติ'], lat: 13.5186, lng: 100.6542 },
  '10': { dbId: 10, title: 'แคมป์ปิ้งดูดาว เขาใหญ่', date: '5-7 ธ.ค. 2569', location: 'อุทยานแห่งชาติเขาใหญ่', distance: '120 กม.', price: '1,500.-', description: 'ทริปแคมป์ปิ้งหน้าหนาว นอนดูดาวท่ามกลางธรรมชาติที่สมบูรณ์ที่สุด', image: 'https://images.unsplash.com/flagged/photo-1562307294-4060df701fa3?q=80&w=1016&auto=format&fit=crop', tags: ['ท่องเที่ยว', 'แคมป์ปิ้ง'], lat: 14.4392, lng: 101.3723 },
  '11': { dbId: 11, title: 'งานเซลล์แบรนด์เนมประจำปี', date: '1-5 ก.ค. 2569 • 10:00 - 22:00 น.', location: 'Siam Paragon', distance: '1.5 กม.', price: 'เข้าฟรี', description: 'ลดล้างสต๊อกสินค้าแบรนด์เนมระดับไฮเอนด์สูงสุด 80%', image: 'https://images.unsplash.com/photo-1768775036854-75341e3a022b?q=80&w=1768&auto=format&fit=crop', tags: ['ช้อปปิ้ง', 'แบรนด์เนม'], lat: 13.7468, lng: 100.5346 },
  '12': { dbId: 12, title: 'คอนเสิร์ตอินดี้ในสวน', date: '5 เม.ย. 2569 • 16:00 - 22:00 น.', location: 'สวนเบญจกิติ', distance: '2.5 กม.', price: '300.-', description: 'ฟังเพลงอินดี้ฟังสบายท่ามกลางธรรมชาติในสวนสาธารณะใจกลางเมือง', image: 'https://images.unsplash.com/photo-1749544292533-65b0ec299191?q=80&w=1750&auto=format&fit=crop', tags: ['ดนตรี', 'ปิกนิก'], lat: 13.7292, lng: 100.5594 },
  
  // --- 48 งานใหม่ที่เพิ่มเข้ามา ---
  // หมวด: อาหารและเครื่องดื่ม
  '13': { dbId: 13, title: 'Wongnai Food Fest 2026', date: 'ก.พ. 2569', location: 'ลานหน้าเซ็นทรัลเวิลด์', distance: '1 กม.', price: 'ฟรี', description: 'รวมร้านเด็ดร้านดังทั่วไทยมาไว้ที่เดียว', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['อาหาร'], lat: 13.7468, lng: 100.5393 },
  '14': { dbId: 14, title: 'เทศกาลอาหารเจ เยาวราช', date: 'ต.ค. 2569', location: 'ถนนเยาวราช', distance: '3 กม.', price: 'ฟรี', description: 'เทศกาลถือศีลกินผักสุดยิ่งใหญ่แห่งปี', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['อาหาร', 'วัฒนธรรม'], lat: 13.7408, lng: 100.5097 },
  '15': { dbId: 15, title: 'Thailand Coffee Fest', date: 'มี.ค. 2569', location: 'อิมแพ็ค เมืองทองธานี', distance: '15 กม.', price: 'ฟรี', description: 'สวรรค์ของคนรักกาแฟ', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['เครื่องดื่ม', 'กาแฟ'], lat: 13.9113, lng: 100.5484 },
  '16': { dbId: 16, title: 'Bangkok Beer Festival', date: 'ธ.ค. 2569', location: 'โชว์ดีซี (Show DC)', distance: '5 กม.', price: '300.-', description: 'เทศกาลคราฟต์เบียร์ที่ดีที่สุด', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['เครื่องดื่ม'], lat: 13.7508, lng: 100.5732 },
  '17': { dbId: 17, title: 'งานเทศกาลทุเรียนนนท์', date: 'พ.ค. 2569', location: 'เซ็นทรัลพลาซา รัตนาธิเบศร์', distance: '12 กม.', price: 'ฟรี', description: 'ชิมทุเรียนเกรดพรีเมียมจากสวนนนทบุรี', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['ผลไม้', 'อาหาร'], lat: 13.8643, lng: 100.4950 },
  '18': { dbId: 18, title: 'เทศกาลกินกุ้ง กินปู', date: 'เม.ย. 2569', location: 'ตลาดตะพง ชลบุรี', distance: '80 กม.', price: 'ฟรี', description: 'อาหารทะเลสดๆ ส่งตรงจากเรือประมง', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['ซีฟู้ด'], lat: 13.3512, lng: 100.9856 },
  '19': { dbId: 19, title: 'Artbox Food Street', date: 'ทุกเสาร์-อาทิตย์', location: 'สวนจตุจักร', distance: '6 กม.', price: 'ฟรี', description: 'สตรีทฟู้ดสุดฮิปและอาหารฟิวชั่น', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['สตรีทฟู้ด'], lat: 13.8000, lng: 100.5510 },
  '20': { dbId: 20, title: 'เทศกาลอาหารอีสานแซ่บ', date: 'พ.ย. 2569', location: 'สวนลุมพินี', distance: '2.5 กม.', price: 'ฟรี', description: 'รวมร้านส้มตำและอาหารอีสานรสเด็ด', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['อาหารท้องถิ่น'], lat: 13.7314, lng: 100.5415 },
  '21': { dbId: 21, title: 'แบงค็อก ซีฟู้ด เฟสติวัล', date: 'ส.ค. 2569', location: 'เอเชียทีค', distance: '8 กม.', price: 'ฟรี', description: 'ปาร์ตี้ซีฟู้ดริมแม่น้ำเจ้าพระยา', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['ซีฟู้ด', 'อาหาร'], lat: 13.7042, lng: 100.5034 },
  '22': { dbId: 22, title: 'มหกรรมขนมหวานนานาชาติ', date: 'ก.ย. 2569', location: 'สยามพารากอน', distance: '1.5 กม.', price: 'ฟรี', description: 'เอาใจสายหวานกับของหวานจากทั่วโลก', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', tags: ['ขนมหวาน'], lat: 13.7468, lng: 100.5346 },

  // หมวด: ตลาดและช้อปปิ้ง
  '23': { dbId: 23, title: 'จ๊อดแฟร์ แดนเนรมิต', date: 'เปิดทุกวัน', location: 'พระราม 9', distance: '7 กม.', price: 'ฟรี', description: 'ไนท์มาร์เก็ตสุดปังใจกลางเมือง', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800', tags: ['ช้อปปิ้ง', 'ไนท์มาร์เก็ต'], lat: 13.7580, lng: 100.5658 },
  '24': { dbId: 24, title: 'ถนนคนเดินท่าแพ', date: 'ทุกวันอาทิตย์', location: 'เมืองเชียงใหม่', distance: '700 กม.', price: 'ฟรี', description: 'ตลาดของทำมือและสินค้าพื้นเมือง', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800', tags: ['ช้อปปิ้ง', 'พื้นเมือง'], lat: 18.7877, lng: 98.9931 },
  '25': { dbId: 25, title: 'ตลาดชิคาด้า', date: 'ทุกศุกร์-อาทิตย์', location: 'หัวหิน', distance: '190 กม.', price: 'ฟรี', description: 'ตลาดงานคราฟต์และศิลปะร่วมสมัย', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800', tags: ['งานคราฟต์', 'ช้อปปิ้ง'], lat: 12.5341, lng: 99.9658 },
  '26': { dbId: 26, title: 'ตลาดน้ำอัมพวา', date: 'ทุกศุกร์-อาทิตย์', location: 'สมุทรสงคราม', distance: '80 กม.', price: 'ฟรี', description: 'ช้อปปิ้งและหาของกินริมคลอง', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800', tags: ['ตลาดน้ำ', 'ช้อปปิ้ง'], lat: 13.4259, lng: 99.9550 },
  '27': { dbId: 27, title: 'Siam Square Walking Street', date: 'ทุกศุกร์-อาทิตย์', location: 'สยามสแควร์', distance: '1.5 กม.', price: 'ฟรี', description: 'แหล่งช้อปปิ้งแฟชั่นวัยรุ่น', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800', tags: ['ช้อปปิ้ง', 'แฟชั่น'], lat: 13.7445, lng: 100.5305 },

  // หมวด: ดนตรีและคอนเสิร์ต
  '28': { dbId: 28, title: 'Big Mountain Music Festival', date: 'ธ.ค. 2569', location: 'เขาใหญ่ นครราชสีมา', distance: '180 กม.', price: '2,500.-', description: 'เทศกาลดนตรีที่ใหญ่ที่สุดในไทย', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800', tags: ['ดนตรี', 'เทศกาล'], lat: 14.4392, lng: 101.3723 },
  '29': { dbId: 29, title: 'Cat Expo', date: 'พ.ย. 2569', location: 'สวนสนุกวันเดอร์เวิลด์', distance: '15 กม.', price: '1,200.-', description: 'เทศกาลดนตรีอินดี้แห่งปี', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800', tags: ['อินดี้', 'คอนเสิร์ต'], lat: 13.8242, lng: 100.6781 },
  '30': { dbId: 30, title: 'Pattaya Music Festival', date: 'มี.ค. 2569', location: 'ชายหาดพัทยา', distance: '140 กม.', price: 'ฟรี', description: 'คอนเสิร์ตริมหาดพัทยา', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800', tags: ['ดนตรี', 'ริมหาด'], lat: 12.9430, lng: 100.8841 },
  '31': { dbId: 31, title: 'Wonderfruit Festival', date: 'ธ.ค. 2569', location: 'พัทยา ชลบุรี', distance: '150 กม.', price: '5,000.-', description: 'เทศกาลดนตรีและศิลปะรักษ์โลก', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800', tags: ['ดนตรี', 'ศิลปะ'], lat: 12.8711, lng: 100.9922 },
  '32': { dbId: 32, title: 'Chiang Mai Jazz Festival', date: 'ก.พ. 2569', location: 'นิมมานเหมินท์ เชียงใหม่', distance: '700 กม.', price: '800.-', description: 'ฟังเพลงแจ๊สชิลๆ ในบรรยากาศหน้าหนาว', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800', tags: ['ดนตรีแจ๊ส'], lat: 18.7961, lng: 98.9666 },

  // หมวด: เทศกาลและงานวัด
  '33': { dbId: 33, title: 'งานกาชาดประจำปี', date: 'ธ.ค. 2569', location: 'สวนลุมพินี', distance: '3 กม.', price: 'ฟรี', description: 'ช้อปปิ้งและสอยดาวการกุศล', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['งานวัด', 'การกุศล'], lat: 13.7314, lng: 100.5415 },
  '34': { dbId: 34, title: 'ประเพณีสงกรานต์ ถนนข้าวสาร', date: '13-15 เม.ย.', location: 'ถนนข้าวสาร', distance: '1 กม.', price: 'ฟรี', description: 'เล่นน้ำสงกรานต์ที่ฮิตที่สุดในกรุงเทพฯ', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['สงกรานต์', 'เทศกาล'], lat: 13.7590, lng: 100.4974 },
  '35': { dbId: 35, title: 'ประเพณีลอยกระทง สุโขทัย', date: 'พ.ย. 2569', location: 'อุทยานประวัติศาสตร์สุโขทัย', distance: '400 กม.', price: 'ฟรี', description: 'ลอยกระทงเผาเทียนเล่นไฟอันงดงาม', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['ลอยกระทง', 'วัฒนธรรม'], lat: 17.0187, lng: 99.7042 },
  '36': { dbId: 36, title: 'งานสมโภชองค์พระปฐมเจดีย์', date: 'พ.ย. 2569', location: 'นครปฐม', distance: '60 กม.', price: 'ฟรี', description: 'งานวัดที่ใหญ่และยาวนานที่สุดในนครปฐม', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['งานวัด', 'ทำบุญ'], lat: 13.8197, lng: 100.0601 },
  '37': { dbId: 37, title: 'งานแห่เทียนพรรษา', date: 'ก.ค. 2569', location: 'ทุ่งศรีเมือง อุบลราชธานี', distance: '600 กม.', price: 'ฟรี', description: 'ชมขบวนแห่เทียนแกะสลักสุดตระการตา', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['เทศกาล', 'ประเพณี'], lat: 15.2287, lng: 104.8569 },
  '38': { dbId: 38, title: 'ประเพณีผีตาโขน', date: 'มิ.ย. 2569', location: 'ด่านซ้าย เลย', distance: '450 กม.', price: 'ฟรี', description: 'เทศกาลหน้ากากผีตาโขนสีสันสดใส', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['เทศกาล', 'ศิลปะท้องถิ่น'], lat: 17.2764, lng: 101.1466 },
  '39': { dbId: 39, title: 'งานนมัสการหลวงพ่อโสธร', date: 'พ.ย. 2569', location: 'ฉะเชิงเทรา', distance: '80 กม.', price: 'ฟรี', description: 'งานประจำปีนมัสการพระพุทธรูปศักดิ์สิทธิ์', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['ทำบุญ', 'งานวัด'], lat: 13.6738, lng: 101.0673 },
  '40': { dbId: 40, title: 'งานไหลเรือไฟ', date: 'ต.ค. 2569', location: 'แม่น้ำโขง นครพนม', distance: '700 กม.', price: 'ฟรี', description: 'ชมความงามของเรือไฟสว่างไสวกลางแม่น้ำโขง', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['เทศกาล', 'วัฒนธรรม'], lat: 17.3995, lng: 104.7865 },
  '41': { dbId: 41, title: 'งานฉลองย่าโม', date: 'มี.ค. 2569', location: 'นครราชสีมา', distance: '250 กม.', price: 'ฟรี', description: 'งานฉลองวันแห่งชัยชนะของท้าวสุรนารี', image: 'https://images.unsplash.com/photo-1583214554868-b7cf6bc25a3a?q=80&w=800', tags: ['เทศกาล', 'ประเพณี'], lat: 14.9735, lng: 102.0967 },

  // หมวด: กีฬาและเอาท์ดอร์
  '42': { dbId: 42, title: 'Amazing Thailand Marathon', date: 'ก.พ. 2569', location: 'กรุงเทพมหานคร', distance: '0 กม.', price: '1,200.-', description: 'งานวิ่งมาราธอนระดับโลกในกรุงเทพฯ', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', tags: ['วิ่ง', 'กีฬา'], lat: 13.7563, lng: 100.5018 },
  '43': { dbId: 43, title: 'ลากูน่า ภูเก็ต ไตรกีฬา', date: 'พ.ย. 2569', location: 'ภูเก็ต', distance: '800 กม.', price: '4,000.-', description: 'การแข่งขันไตรกีฬาระดับนานาชาติ', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', tags: ['ไตรกีฬา', 'กีฬา'], lat: 7.9944, lng: 98.3009 },
  '44': { dbId: 44, title: 'บุรีรัมย์ มาราธอน', date: 'ม.ค. 2569', location: 'สนามช้างอารีนา', distance: '400 กม.', price: '1,000.-', description: 'งานวิ่งมาตรฐาน Gold Label', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', tags: ['วิ่ง', 'มาราธอน'], lat: 14.9660, lng: 103.0945 },
  '45': { dbId: 45, title: 'ปั่นจักรยานรอบเกาะรัตนโกสินทร์', date: 'ทุกวันอาทิตย์', location: 'ลานคนเมือง', distance: '2 กม.', price: 'ฟรี', description: 'กิจกรรมปั่นจักรยานชมเมืองเก่า', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', tags: ['จักรยาน', 'ออกกำลังกาย'], lat: 13.7525, lng: 100.5003 },
  '46': { dbId: 46, title: 'เทศกาลว่าววิ่งนานาชาติ', date: 'มี.ค. 2569', location: 'หัวหิน', distance: '190 กม.', price: 'ฟรี', description: 'ชมว่าวแฟนซีจากทั่วโลก', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', tags: ['กิจกรรมกลางแจ้ง', 'ชายหาด'], lat: 12.5684, lng: 99.9577 },

  // หมวด: ศิลปะและนิทรรศการ
  '47': { dbId: 47, title: 'Bangkok Design Week', date: 'ก.พ. 2569', location: 'เจริญกรุง-ตลาดน้อย', distance: '3 กม.', price: 'ฟรี', description: 'เทศกาลงานออกแบบกรุงเทพฯ', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', tags: ['ศิลปะ', 'ดีไซน์'], lat: 13.7275, lng: 100.5152 },
  '48': { dbId: 48, title: 'Thailand Biennale', date: 'ธ.ค. 2569', location: 'เชียงราย', distance: '800 กม.', price: 'ฟรี', description: 'มหกรรมศิลปะร่วมสมัยนานาชาติ', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', tags: ['ศิลปะร่วมสมัย', 'นิทรรศการ'], lat: 19.9105, lng: 99.8406 },
  '49': { dbId: 49, title: 'นิทรรศการ Van Gogh Alive', date: 'เปิดทุกวัน', location: 'ICONSIAM', distance: '5 กม.', price: '500.-', description: 'สัมผัสศิลปะระดับโลกในรูปแบบดิจิทัล', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', tags: ['ศิลปะ', 'ดิจิทัลอาร์ต'], lat: 13.7265, lng: 100.5105 },
  '50': { dbId: 50, title: 'เทศกาลหนังสือแห่งชาติ (Book Expo)', date: 'ต.ค. 2569', location: 'ศูนย์สิริกิติ์', distance: '4 กม.', price: 'ฟรี', description: 'งานสัปดาห์หนังสือแห่งชาติสุดยิ่งใหญ่', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', tags: ['หนังสือ', 'นิทรรศการ'], lat: 13.7265, lng: 100.5588 },
  '51': { dbId: 51, title: 'Hotel Art Fair', date: 'ก.ย. 2569', location: 'โรงแรมเพนนินซูล่า', distance: '5 กม.', price: 'ฟรี', description: 'ชมงานศิลปะตามห้องพักโรงแรมหรู', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', tags: ['ศิลปะ', 'นิทรรศการ'], lat: 13.7230, lng: 100.5110 },

  // หมวด: สัตว์เลี้ยง
  '52': { dbId: 52, title: 'Thailand International Dog Show', date: 'ก.ค. 2569', location: 'อิมแพ็ค เมืองทองธานี', distance: '15 กม.', price: '20.-', description: 'งานแสดงสินค้าเพื่อสุนัขที่ใหญ่ที่สุด', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800', tags: ['สุนัข', 'สัตว์เลี้ยง'], lat: 13.9113, lng: 100.5484 },
  '53': { dbId: 53, title: 'Cat T-Shirt & Cat Fest', date: 'พ.ค. 2569', location: 'แอร์พอร์ตลิงก์ มักกะสัน', distance: '6 กม.', price: '100.-', description: 'เทศกาลเสื้อยืดและงานแฟร์สำหรับทาสแมว', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800', tags: ['แมว', 'แฟชั่น'], lat: 13.7516, lng: 100.5615 },
  '54': { dbId: 54, title: 'Pet Healthcare Fair', date: 'ส.ค. 2569', location: 'ไบเทค บางนา', distance: '12 กม.', price: 'ฟรี', description: 'มหกรรมสุขภาพและสินค้าสัตว์เลี้ยง', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800', tags: ['สัตว์เลี้ยง', 'ช้อปปิ้ง'], lat: 13.6702, lng: 100.6111 },

  // หมวด: ท่องเที่ยวธรรมชาติ
  '55': { dbId: 55, title: 'ทุ่งดอกทานตะวัน พัฒนานิคม', date: 'ธ.ค. - ม.ค.', location: 'ลพบุรี', distance: '150 กม.', price: 'ฟรี', description: 'ชมทุ่งดอกทานตะวันบานสะพรั่งเต็มท้องทุ่ง', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ธรรมชาติ', 'ถ่ายรูป'], lat: 14.8519, lng: 100.9996 },
  '56': { dbId: 56, title: 'ชมดอกนางพญาเสือโคร่ง', date: 'ม.ค. - ก.พ.', location: 'ดอยอินทนนท์ เชียงใหม่', distance: '700 กม.', price: 'ฟรี', description: 'ชมซากุระเมืองไทยเบ่งบานบนยอดดอย', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ธรรมชาติ', 'ภูเขา'], lat: 18.5880, lng: 98.4862 },
  '57': { dbId: 57, title: 'งานประเพณีขึ้นเขาคิชฌกูฏ', date: 'ก.พ. - เม.ย.', location: 'จันทบุรี', distance: '250 กม.', price: 'ฟรี', description: 'นมัสการรอยพระพุทธบาทบนยอดเขา', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ทำบุญ', 'เดินป่า'], lat: 12.8394, lng: 102.1384 },
  '58': { dbId: 58, title: 'เทศกาลชมทะเลบัวแดง', date: 'ธ.ค. - ก.พ.', location: 'หนองหาน อุดรธานี', distance: '550 กม.', price: '150.-', description: 'ล่องเรือชมความงามของดอกบัวแดงบานสะพรั่ง', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ธรรมชาติ', 'ล่องเรือ'], lat: 17.1856, lng: 103.0401 },
  '59': { dbId: 59, title: 'เทศกาลบอลลูนนานาชาติ', date: 'ก.พ. 2569', location: 'สิงห์ปาร์ค เชียงราย', distance: '800 กม.', price: '100.-', description: 'ชมกองทัพบอลลูนยักษ์พร้อมคอนเสิร์ต', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ธรรมชาติ', 'เทศกาล'], lat: 19.8530, lng: 99.7431 },
  '60': { dbId: 60, title: 'ดูดาวอาบป่า (Stargazing)', date: 'พ.ย. - ก.พ.', location: 'ดอยหลวงเชียงดาว', distance: '750 กม.', price: 'ฟรี', description: 'กางเต็นท์นอนดูดาวท่ามกลางความหนาวเย็น', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['ดูดาว', 'แคมป์ปิ้ง'], lat: 19.3995, lng: 98.8781 }
};

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

  const fetchReviews = async (dbId: number) => {
    try {
      const res = await fetch(`http://192.168.174.35:3000/events/${dbId}/reviews`);
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
    const fetchEventAndCheckFavorite = async () => {
      const storedUser = await AsyncStorage.getItem('user_data');
      let currentUser = null;

      if (storedUser) {
        setIsLoggedIn(true);
        currentUser = JSON.parse(storedUser);
        setUserData(currentUser);
      }

      const dataId = id ? (id as string) : '1';
      const data = MOCK_EVENTS[dataId] || { title: 'กิจกรรมนี้ถูกลบแล้ว', date: '-', location: '-', tags: [] };
      setEventData(data);

      if (data.dbId) {
        fetchReviews(data.dbId);
        
        if (currentUser) {
          try {
            const response = await fetch(`http://192.168.174.35:3000/saved-events/${currentUser.id}`);
            const result = await response.json();
            if (result.status === 'success') {
              const isSaved = result.data.some((savedEvent: any) => savedEvent.id === data.dbId);
              setIsFavorite(isSaved);
            }
          } catch (error) {}
        }
      }
    };
    fetchEventAndCheckFavorite();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn || !userData) {
      Alert.alert('ต้องเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อน จึงจะสามารถบันทึกกิจกรรมได้', [{ text: 'ไปหน้า Login', onPress: () => router.push('/') }]);
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

  // 🌟 ฟังก์ชันนำทางที่ได้รับการแก้ไขให้เปิด Google Maps ได้อย่างถูกต้อง
  const handleNavigate = () => {
    if (!eventData?.lat || !eventData?.lng) {
      Alert.alert('ขออภัย', 'ไม่พบพิกัดสำหรับกิจกรรมนี้');
      return;
    }

    const latLng = `${eventData.lat},${eventData.lng}`;
    
    // ใช้รูปแบบ Universal Link ของ Google Maps ซึ่งจะเปิดแอปให้อัตโนมัติถ้ามี หรือเปิดหน้าเว็บถ้าไม่มีแอป
    const url = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดแผนที่ได้ในขณะนี้');
      }
    }).catch(err => console.error('An error occurred', err));
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn || !userData) {
      Alert.alert('ต้องเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อน จึงจะสามารถให้คะแนนและคอมเมนต์ได้', [{ text: 'ไปหน้า Login', onPress: () => router.push('/') }]);
      return;
    }
    if (userRating === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณากดให้คะแนนดาวก่อนส่งรีวิวครับ ⭐');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณาพิมพ์ความคิดเห็นของคุณก่อนส่ง');
      return;
    }

    try {
      const response = await fetch('http://192.168.174.35:3000/add-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.id, event_id: eventData.dbId, rating: userRating, comment: reviewText })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUserRating(0); 
        setReviewText(''); 
        fetchReviews(eventData.dbId); 
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งรีวิวได้ในขณะนี้');
    }
  };

  if (!eventData) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#FF385C" /></View>;

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
              {(eventData?.tags || []).map((tag: string, index: number) => (
                <View key={index} style={styles.tagBadge}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>วันและเวลา</Text>
              <Text style={styles.infoDetail}>{eventData?.date}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}><Ionicons name="location" size={20} color="#FF385C" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>สถานที่จัดงาน</Text>
              <Text style={styles.infoDetail}>{eventData?.location}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>เกี่ยวกับกิจกรรม</Text>
          <Text style={styles.descriptionText}>{eventData?.description}</Text>

          <View style={styles.divider} />

          <View style={{ marginBottom: 30 }}>
            <Text style={styles.sectionTitle}>ความคิดเห็นจากผู้ใช้</Text>
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormTitle}>คุณคิดอย่างไรกับงานนี้?</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setUserRating(star)} activeOpacity={0.7}>
                    <Ionicons name={star <= userRating ? "star" : "star-outline"} size={32} color={star <= userRating ? "#FBBF24" : "#D1D5DB"} style={{ marginRight: 8 }} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.reviewInput} placeholder="แบ่งปันประสบการณ์ของคุณ..." multiline value={reviewText} onChangeText={setReviewText} />
              <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                <Text style={styles.submitReviewText}>ส่งรีวิว</Text>
              </TouchableOpacity>
            </View>

            {reviewsList.length === 0 ? (
              <Text style={{ fontFamily: 'Prompt_400Regular', color: '#94A3B8', textAlign: 'center', marginTop: 10 }}>ยังไม่มีรีวิว เป็นคนแรกที่รีวิวกิจกรรมนี้สิ!</Text>
            ) : (
              reviewsList.map((rev: any) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={{ fontFamily: 'Prompt_700Bold', color: '#FFF' }}>{rev.username ? rev.username.charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.reviewUser}>{rev.username}</Text>
                      <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text style={styles.ratingText}>{rev.rating}</Text>
                    </View>
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
  adminPickCard: { width: width * 0.6, backgroundColor: '#FFF', borderRadius: 16, marginRight: 15, elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden', marginBottom: 10 },
  adminPickImage: { width: '100%', height: 120 },
  adminPickInfo: { padding: 12 },
  adminPickTitle: { fontFamily: 'Prompt_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 4 },
  adminPickDesc: { fontFamily: 'Prompt_400Regular', fontSize: 12, color: '#64748B', lineHeight: 18 },
  reviewForm: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  reviewFormTitle: { fontFamily: 'Prompt_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 10 },
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