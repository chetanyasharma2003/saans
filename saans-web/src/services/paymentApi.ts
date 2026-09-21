import apiClient from './apiClient';

export interface PaymentInitRequest {
  bookingId: string;
  therapistId: string;
  amount: number;
  sessionType: 'video' | 'inperson' | 'phone';
  date: string;
  time: string;
}

export interface PaymentVerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string; // Razorpay key for frontend
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  therapistId: string;
  userId: string;
  date: string;
}

class PaymentApi {
  /**
   * Initiate payment for booking
   */
  async initiatePayment(data: PaymentInitRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post('/api/payments/initiate', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to initiate payment');
    }
  }

  /**
   * Verify payment after Razorpay completes
   */
  async verifyPayment(data: PaymentVerifyRequest): Promise<{ success: boolean; bookingId: string }> {
    try {
      const response = await apiClient.post('/api/payments/verify', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Payment verification failed');
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(page: number = 1, limit: number = 10) {
    try {
      const response = await apiClient.get(`/api/payments/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch payment history');
    }
  }

  /**
   * Get payment details by ID
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Refund a payment
   */
  async requestRefund(paymentId: string, reason: string) {
    try {
      const response = await apiClient.post(`/api/payments/${paymentId}/refund`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Refund request failed');
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const response = await apiClient.get('/api/payments/wallet/balance');
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Add funds to wallet
   */
  async addWalletFunds(amount: number): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post('/api/payments/wallet/add', { amount });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to add wallet funds');
    }
  }
}

export default new PaymentApi();
