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