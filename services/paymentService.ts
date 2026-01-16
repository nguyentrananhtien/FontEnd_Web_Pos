import api from './api';

/**
 * Payment Service for VNPay Integration
 * Handles payment creation, verification, and status checking
 */

export interface CreatePaymentRequest {
  orderId?: number;
  userId: number;
  amount: number;
  description: string;
  bankCode?: string;
}

export interface CreatePaymentResponse {
  id: number;
  orderId?: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  vnpayTxnRef: string;
  paymentUrl: string;
  createdAt: string;
}

export interface PaymentDetail {
  id: number;
  orderId?: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  vnpayTxnRef: string;
  vnpayTransactionNo?: string;
  bankCode?: string;
  cardType?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentResultParams {
  success: string;
  status?: string;
  orderId?: string;
  amount?: string;
  txnRef?: string;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  /**
   * Create VNPay payment
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.instance.post('/api/payment/create', data);
    return response.data;
  }

  /**
   * Create VNPay payment from invoice
   */
  async createPaymentFromInvoice(
    invoiceId: number,
    userId?: number
  ): Promise<CreatePaymentResponse> {
    const url = userId
      ? `/api/payment/create-from-invoice/${invoiceId}?userId=${userId}`
      : `/api/payment/create-from-invoice/${invoiceId}`;

    const response = await api.instance.post(url);
    return response.data;
  }

  /**
   * Get payment by transaction reference
   */
  async getPaymentByTxnRef(txnRef: string): Promise<PaymentDetail> {
    const response = await api.instance.get(`/api/payment/txn/${txnRef}`);
    return response.data;
  }

  /**
   * Get all payments for an order
   */
  async getPaymentsByOrderId(orderId: number): Promise<PaymentDetail[]> {
    const response = await api.instance.get(`/api/payment/order/${orderId}`);
    return response.data;
  }

  /**
   * Get all payments for a user
   */
  async getPaymentsByUserId(userId: number): Promise<PaymentDetail[]> {
    const response = await api.instance.get(`/api/payment/user/${userId}`);
    return response.data;
  }

  /**
   * Parse payment result params from deep link
   */
  parsePaymentResult(params: Record<string, any>): PaymentResultParams {
    return {
      success: params.success,
      status: params.status,
      orderId: params.orderId,
      amount: params.amount,
      txnRef: params.txnRef,
      transactionId: params.transactionId,
      error: params.error,
    };
  }

  /**
   * Check if payment was successful
   */
  isPaymentSuccessful(params: PaymentResultParams): boolean {
    return params.success === 'true' && params.status === 'success';
  }
}

export const paymentService = new PaymentService();
export default paymentService;
