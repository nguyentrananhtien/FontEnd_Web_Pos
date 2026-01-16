import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { orderApi } from '@/services/api';
import { OrderDTO } from '@/services/types';
import { WaterDropLoader } from '@/components/WaterDropLoader';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    ready: '#10b981',
    served: '#22c55e',
    cancelled: '#ef4444',
  };
  return statusColors[status.toLowerCase()] || '#6b7280';
};

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    unpaid: '#f59e0b',
    paid: '#10b981',
    refunded: '#6b7280',
  };
  return colors[status.toLowerCase()] || '#6b7280';
};

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID is missing');
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      const orderData = await orderApi.getById(Number(orderId));
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayWithVNPay = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        orderId: order.id!,
        amount: order.totalAmount,
        orderInfo: `Payment for Order #${order.id}`,
        returnUrl: 'yourapp://payment-callback',
      };

      const response = await orderApi.createVNPayPayment(paymentData);

      if (response.paymentUrl) {
        const supported = await Linking.canOpenURL(response.paymentUrl);
        if (supported) {
          await Linking.openURL(response.paymentUrl);
        } else {
          Alert.alert('Error', 'Cannot open payment URL');
        }
      }
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      Alert.alert('Error', 'Failed to create payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await orderApi.updateStatus(order.id!, 'cancelled');
              Alert.alert('Success', 'Order has been cancelled');
              loadOrderDetail();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <WaterDropLoader size={60} color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canPay = order.paymentStatus?.toLowerCase() === 'unpaid' &&
                 order.status?.toLowerCase() !== 'cancelled';
  const canCancel = order.status?.toLowerCase() === 'pending' ||
                    order.status?.toLowerCase() === 'confirmed';

  return (
    <SafeAreaView style={styles.container}>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <WaterDropLoader size={60} color="#ffffff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity
          onPress={loadOrderDetail}
          style={styles.headerButton}
        >
          <Ionicons name="refresh" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <LinearGradient
          colors={['#f97316', '#ec4899']}
          style={styles.orderHeader}
        >
          <Text style={styles.orderNumber}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Order Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status || 'pending') },
                ]}
              >
                <Text style={styles.statusText}>
                  {(order.status || 'PENDING').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Payment Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getPaymentStatusColor(order.paymentStatus || 'unpaid') },
                ]}
              >
                <Text style={styles.statusText}>
                  {(order.paymentStatus || 'UNPAID').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.dishName}</Text>
                {item.specialRequests && (
                  <Text style={styles.itemNote}>Note: {item.specialRequests}</Text>
                )}
              </View>
              <View style={styles.itemPricing}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.unitPrice * item.quantity)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        {order.reservationId && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reservation ID:</Text>
              <Text style={styles.infoValue}>#{order.reservationId}</Text>
            </View>
            {order.customerId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer ID:</Text>
                <Text style={styles.infoValue}>#{order.customerId}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {canCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelOrder}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {canPay && (
          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={handlePayWithVNPay}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={['#f97316', '#ec4899']}
              style={styles.payButtonGradient}
            >
              <Ionicons name="card-outline" size={20} color="#fff" />
              <Text style={styles.payButtonText}>Pay with VNPay</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!canPay && !canCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.backToMenuButton]}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={styles.backToMenuText}>Back to Orders</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    padding: 24,
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f97316',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    overflow: 'hidden',
  },
  payButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToMenuButton: {
    backgroundColor: '#f97316',
  },
  backToMenuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

