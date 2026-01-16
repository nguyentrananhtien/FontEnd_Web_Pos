import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/auth-provider';
import useVNPayPayment from '@/hooks/useVNPayPayment';
import paymentService from '@/services/paymentService';

/**
 * VNPay Test Panel - Component để test VNPay payment
 * Có thể thêm vào trang profile hoặc settings để test
 */
export default function VNPayTestPanel() {
  const { user } = useAuth();
  const { loading, createPayment, createPaymentFromInvoice } = useVNPayPayment();

  const [testAmount, setTestAmount] = useState('100000');
  const [testOrderId, setTestOrderId] = useState('');
  const [testInvoiceId, setTestInvoiceId] = useState('');

  const handleTestPayment = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để test thanh toán');
      return;
    }

    const amount = parseInt(testAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Số tiền không hợp lệ');
      return;
    }

    await createPayment({
      userId: user.id,
      amount: amount,
      description: `Test payment - ${amount.toLocaleString('vi-VN')} VNĐ`,
      orderId: testOrderId ? parseInt(testOrderId) : undefined,
      bankCode: 'NCB',
    });
  };

  const handleTestPaymentFromInvoice = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập');
      return;
    }

    const invoiceId = parseInt(testInvoiceId);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      Alert.alert('Lỗi', 'Invoice ID không hợp lệ');
      return;
    }

    await createPaymentFromInvoice(invoiceId, user.id);
  };

  const handleCheckPaymentHistory = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập');
      return;
    }

    try {
      const payments = await paymentService.getPaymentsByUserId(user.id);
      Alert.alert(
        'Payment History',
        `Bạn có ${payments.length} giao dịch\n\n` +
        payments.slice(0, 3).map(p =>
          `#${p.id}: ${p.amount.toLocaleString('vi-VN')} VNĐ - ${p.status}`
        ).join('\n')
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy lịch sử thanh toán');
    }
  };

  const TestButton = ({
    onPress,
    title,
    icon,
    color = '#f97316',
    disabled = false
  }: {
    onPress: () => void;
    title: string;
    icon: string;
    color?: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-lg p-4 mb-3 flex-row items-center border ${
        disabled ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <View
        style={{ backgroundColor: disabled ? '#9ca3af' : color }}
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
      >
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <Text className={`font-medium flex-1 ${
        disabled ? 'text-gray-400' : 'text-gray-800'
      }`}>
        {title}
      </Text>
      {loading && <View className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />}
      {!loading && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="bg-orange-600 rounded-lg p-4 mb-4">
        <Text className="text-white text-lg font-bold mb-1">
          💳 VNPay Test Panel
        </Text>
        <Text className="text-orange-100 text-sm">
          Test VNPay payment integration
        </Text>
      </View>

      {/* User Info */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-gray-600 text-sm mb-1">Logged in as:</Text>
        <Text className="text-gray-900 font-semibold">
          {user?.email || 'Not logged in'}
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          User ID: {user?.id || 'N/A'}
        </Text>
      </View>

      {/* Test Payment Form */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-gray-900 font-bold text-base mb-3">
          Test Payment
        </Text>

        <Text className="text-gray-700 text-sm mb-2">Số tiền (VNĐ):</Text>
        <TextInput
          value={testAmount}
          onChangeText={setTestAmount}
          keyboardType="numeric"
          placeholder="100000"
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
        />

        <Text className="text-gray-700 text-sm mb-2">Order ID (Optional):</Text>
        <TextInput
          value={testOrderId}
          onChangeText={setTestOrderId}
          keyboardType="numeric"
          placeholder="Leave empty for test"
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <TestButton
          onPress={handleTestPayment}
          title="Test Payment"
          icon="card"
          color="#10b981"
          disabled={loading}
        />
      </View>

      {/* Test Payment from Invoice */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-gray-900 font-bold text-base mb-3">
          Test Payment from Invoice
        </Text>

        <Text className="text-gray-700 text-sm mb-2">Invoice ID:</Text>
        <TextInput
          value={testInvoiceId}
          onChangeText={setTestInvoiceId}
          keyboardType="numeric"
          placeholder="Enter invoice ID"
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <TestButton
          onPress={handleTestPaymentFromInvoice}
          title="Pay Invoice"
          icon="receipt"
          color="#3b82f6"
          disabled={loading}
        />
      </View>

      {/* Payment History */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-gray-900 font-bold text-base mb-3">
          Payment History
        </Text>

        <TestButton
          onPress={handleCheckPaymentHistory}
          title="View Payment History"
          icon="time"
          color="#8b5cf6"
          disabled={loading}
        />
      </View>

      {/* VNPay Test Card Info */}
      <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <View className="flex-1 ml-2">
            <Text className="text-blue-900 font-semibold mb-2">
              VNPay Sandbox Test Card:
            </Text>
            <Text className="text-blue-700 text-sm font-mono">
              Card: 9704198526191432198{'\n'}
              Name: NGUYEN VAN A{'\n'}
              Date: 07/15{'\n'}
              OTP: 123456
            </Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <View className="flex-row items-start">
          <Ionicons name="bulb" size={20} color="#f59e0b" />
          <View className="flex-1 ml-2">
            <Text className="text-yellow-900 font-semibold mb-1">
              How to test:
            </Text>
            <Text className="text-yellow-700 text-sm">
              • Enter amount and click "Test Payment"{'\n'}
              • Browser will open VNPay payment page{'\n'}
              • Use test card info above{'\n'}
              • After payment, app will show result{'\n'}
              • Check payment history to verify
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
