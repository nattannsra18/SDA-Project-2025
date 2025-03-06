import axios from 'axios';

// ใช้ environment variable สำหรับ API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

// ระยะเวลาในการจองคีย์ (10 นาที = 600,000 มิลลิวินาที)
const RESERVATION_TIMEOUT = 600000;

class KeyReservationService {
  // จองคีย์เกมเมื่อผู้ใช้กดปุ่ม Purchase Now
// จองคีย์เกมเมื่อผู้ใช้กดปุ่ม Purchase Now
static async reserveKeys(cartItems) {
    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      
      if (!userId || !token) {
        throw new Error("User not authenticated");
      }
      
      const reservations = [];
      const unavailableItems = [];
      
      // วนลูปสำหรับแต่ละเกมในตะกร้า
      for (const item of cartItems) {
        // ดึงข้อมูลคีย์ที่ว่างของเกม
        const productResponse = await axios.get(
          `${API_URL}/api/products?filters[documentId][$eq]=${item.documentId}&populate=product_keys`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const product = productResponse.data.data[0];
        
        // ตรวจสอบว่ามีคีย์ที่ว่างหรือไม่
        const availableKeys = product.product_keys.filter(key => key.is_used === false && key.is_reserved === false);
        if (availableKeys.length === 0) {
          // เก็บข้อมูลเกมที่ไม่มีคีย์ว่าง
          const reservedKeys = product.product_keys.filter(key => key.is_used === false && key.is_reserved === true);
          unavailableItems.push({
            id: item.id,
            name: item.name,
            documentId: product.documentId,
            isOutOfStock: reservedKeys.length === 0 // true ถ้าไม่มีคีย์เลย (คีย์ถูกใช้ไปหมด)
          });
          continue;
        }
        
        // เลือกคีย์แรกที่ว่าง
        const selectedKey = availableKeys[0];
        
        // สร้างข้อมูลการจอง
        const reservation = {
          productId: product.documentId,
          keyId: selectedKey.documentId,
          productName: item.name,
          timestamp: Date.now(),
          expiresAt: Date.now() + RESERVATION_TIMEOUT
        };
        
        reservations.push(reservation);
        
        // ตั้งค่า is_reserved เป็น true ที่ backend (Strapi v5)
        await axios.put(
          `${API_URL}/api/product-keys/${selectedKey.documentId}`,
          {
            data: {
              is_reserved: true,
              reserved_by: userId,
              reservation_expires: new Date(reservation.expiresAt).toISOString()
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      // บันทึกข้อมูลการจองลงใน localStorage
      localStorage.setItem(`reserved_keys_${userId}`, JSON.stringify(reservations));
      
      // ตั้งเวลาปลดล็อคอัตโนมัติ
      this.setAutoReleaseTimeout(userId);
      
      // ถ้ามีเกมที่ไม่สามารถจองได้ ส่งกลับเป็น error
      if (unavailableItems.length > 0) {
        return { success: false, unavailableItems };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error reserving keys:", error);
      return { success: false, error: error.message };
    }
  }
  
  // ปลดล็อคคีย์ที่จองไว้
  static async releaseKeys(userId = null) {
    try {
      // ถ้าไม่ระบุ userId ให้ใช้จาก session
      if (!userId) {
        userId = sessionStorage.getItem("userId");
      }
      
      const token = sessionStorage.getItem("token");
      
      if (!userId || !token) {
        throw new Error("User not authenticated");
      }
      
      // ดึงข้อมูลการจองจาก localStorage
      const reservationsJSON = localStorage.getItem(`reserved_keys_${userId}`);
      if (!reservationsJSON) {
        return true; // ไม่มีการจอง
      }
      
      const reservations = JSON.parse(reservationsJSON);
      
      // วนลูปปลดล็อคแต่ละคีย์
      for (const reservation of reservations) {
        // ตั้งค่า is_reserved เป็น false ที่ backend (Strapi v5)
        await axios.put(
          `${API_URL}/api/product-keys/${reservation.keyId}`,
          {
            data: {
              is_reserved: false,
              reserved_by: null,
              reservation_expires: null
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      // ลบข้อมูลการจองจาก localStorage
      localStorage.removeItem(`reserved_keys_${userId}`);
      
      // ยกเลิกการตั้งเวลาปลดล็อคอัตโนมัติ 
      if (window.keyReleaseTimeout) {
        clearTimeout(window.keyReleaseTimeout);
      }
      
      return true;
    } catch (error) {
      console.error("Error releasing keys:", error);
      return false;
    }
  }
  
  // ตั้งเวลาปลดล็อคอัตโนมัติ
  static setAutoReleaseTimeout(userId) {
    // ยกเลิกการตั้งเวลาเดิม 
    if (window.keyReleaseTimeout) {
      clearTimeout(window.keyReleaseTimeout);
    }
    
    // ตั้งเวลาใหม่
    window.keyReleaseTimeout = setTimeout(() => {
      this.releaseKeys(userId);
    }, RESERVATION_TIMEOUT);
  }
  
  // ตรวจสอบว่ามีการจองคีย์หรือไม่
  static hasReservation(userId = null) {
    if (!userId) {
      userId = sessionStorage.getItem("userId");
    }
    
    const reservationsJSON = localStorage.getItem(`reserved_keys_${userId}`);
    return !!reservationsJSON;
  }
  
  // ตรวจสอบเวลาที่เหลือของการจอง
  static getRemainingTime(userId = null) {
    if (!userId) {
      userId = sessionStorage.getItem("userId");
    }
    
    const reservationsJSON = localStorage.getItem(`reserved_keys_${userId}`);
    if (!reservationsJSON) {
      return 0;
    }
    
    const reservations = JSON.parse(reservationsJSON);
    if (reservations.length === 0) {
      return 0;
    }
    
    // หาเวลาหมดอายุที่น้อยที่สุด
    const earliestExpiry = Math.min(...reservations.map(r => r.expiresAt));
    const remaining = earliestExpiry - Date.now();
    
    return Math.max(0, remaining);
  }
}

export default KeyReservationService;