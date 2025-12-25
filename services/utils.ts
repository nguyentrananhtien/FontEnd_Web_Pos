import { API_CONFIG } from './config';

export const formatPrice = (price: number): string => {
  return `₫${price}`;
};

export const formatOrderNumber = (orderNumber: number): string => {
  return `#${orderNumber.toString().padStart(4, '0')}`;
};

export const getRandomOrderNumber = (): number => {
  return Math.floor(Math.random() * 10000) + 1000;
};

export const getRandomEstimatedTime = (): number => {
  return Math.floor(Math.random() * 20) + 15;
};

export const debugApiConnection = async (): Promise<boolean> => {
  console.log('=== API Configuration Debug ===');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Timeout:', API_CONFIG.TIMEOUT);
  console.log('Available endpoints:', Object.keys(API_CONFIG.ENDPOINTS));

  try {
    console.log('🔍 Testing API health check...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    if (response.ok) {
      console.log('✅ API Health Check - SUCCESS');
      return true;
    } else {
      console.log('❌ API Health Check - FAILED');
      console.log('💡 Make sure your backend server is running on:', API_CONFIG.BASE_URL);
      return false;
    }
  } catch (error) {
    console.log('❌ API Health Check - ERROR:', error);
    console.log('💡 Make sure your backend server is running on:', API_CONFIG.BASE_URL);
    return false;
  }
};
