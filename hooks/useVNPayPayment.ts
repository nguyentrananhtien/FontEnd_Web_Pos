import { useState } from 'react';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import paymentService, { CreatePaymentRequest, PaymentResultParams } from '@/services/paymentService';

/**
 * Custom hook for VNPay payment integration
 */
export function useVNPayPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create payment and open VNPay URL
   */
  const createPayment = async (paymentData: CreatePaymentRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Create payment request
      const response = await paymentService.createPayment(paymentData);

      if (!response.paymentUrl) {
        throw new Error('No payment URL received from server');
      }

      // Check if URL can be opened
      const canOpen = await Linking.canOpenURL(response.paymentUrl);
      if (!canOpen) {
        throw new Error('Cannot open payment URL');
      }

      // Open VNPay payment page in browser
      await Linking.openURL(response.paymentUrl);

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create payment';
      setError(errorMessage);

      Alert.alert(
        'Lỗi thanh toán',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create payment from invoice and open VNPay URL
   */
  const createPaymentFromInvoice = async (
    invoiceId: number,
    userId?: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentService.createPaymentFromInvoice(invoiceId, userId);

      if (!response.paymentUrl) {
        throw new Error('No payment URL received from server');
      }

      const canOpen = await Linking.canOpenURL(response.paymentUrl);
      if (!canOpen) {
        throw new Error('Cannot open payment URL');
      }

      await Linking.openURL(response.paymentUrl);

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create payment';
      setError(errorMessage);

      Alert.alert(
        'Lỗi thanh toán',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle payment result from deep link
   */
  const handlePaymentResult = (
    params: PaymentResultParams,
    onSuccess?: (params: PaymentResultParams) => void,
    onFailure?: (params: PaymentResultParams) => void
  ) => {
    if (paymentService.isPaymentSuccessful(params)) {
      // Payment successful
      if (onSuccess) {
        onSuccess(params);
      } else {
        // Default success handler
        Alert.alert(
          '✅ Thanh toán thành công',
          `${params.orderId ? `Đơn hàng #${params.orderId}\n` : ''}Số tiền: ${Number(params.amount || 0).toLocaleString('vi-VN')} VNĐ\nMã giao dịch: ${params.txnRef}`,
          [{ text: 'OK' }]
        );
      }
    } else {
      // Payment failed
      if (onFailure) {
        onFailure(params);
      } else {
        // Default failure handler
        Alert.alert(
          '❌ Thanh toán thất bại',
          params.error || 'Đã có lỗi xảy ra trong quá trình thanh toán',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return {
    loading,
    error,
    createPayment,
    createPaymentFromInvoice,
    handlePaymentResult,
  };
}

export default useVNPayPayment;
