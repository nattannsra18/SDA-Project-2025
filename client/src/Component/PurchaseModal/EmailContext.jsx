import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// สร้าง Context
const EmailContext = createContext();

// URL ของ Google Cloud Function ที่จะใช้ส่งอีเมล
const CLOUD_FUNCTION_URL = 'https://email-561248274776.asia-southeast1.run.app';

// สร้าง Provider Component
export const EmailProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับส่งอีเมลคีย์เกม
  const sendGameKeyEmail = async (userEmail, gameDetails) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(CLOUD_FUNCTION_URL, {
        email: userEmail,
        subject: 'Your Game Purchase from GameStore',
        gameDetails: gameDetails
      });
      
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to send email');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };
  
  // ค่าที่จะส่งไปยัง Context
  const value = {
    isLoading,
    error,
    sendGameKeyEmail
  };

  return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
};

// Custom hook สำหรับการใช้งาน Context
export const useEmail = () => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};

export default EmailContext;