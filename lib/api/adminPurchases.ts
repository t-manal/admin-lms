import apiClient from '@/lib/api-client';

export interface PendingPurchase {
  id: string; // Enrollment ID
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  course: {
    id: string;
    title: string;
    price: string;
    university: {
      id: string;
      name: string;
    };
  };
  paymentRecords: {
    id: string;
    amount: string;
    status: string;
    createdAt: string;
    provider: string;
  }[];
  ledger: {
    price: number;
    paidAmount: number;
    remaining: number;
    paymentState: 'UNPAID' | 'PARTIALLY_PAID' | 'FULLY_PAID';
  };
  enrolledAt: string;
}

export const adminPurchasesApi = {
  getPending: async () => {
    return apiClient.get<PendingPurchase[]>('/admin/purchases/pending');
  },

  markPaid: async (enrollmentId: string, amount?: number) => {
    return apiClient.post(`/admin/purchases/${enrollmentId}/mark-paid`, { amount });
  },

  updatePayment: async (paymentId: string, amount: number) => {
    return apiClient.put(`/admin/purchases/payments/${paymentId}`, { amount });
  },

  exportHistory: async () => {
    return apiClient.get<Blob>('/admin/purchases/history/export', {
      responseType: 'blob', // Important for CSV download
    });
  },

  getLedger: async () => {
    return apiClient.get<PendingPurchase[]>('/admin/purchases/ledger');
  },

  getRevenueSummary: async () => {
    return apiClient.get<{ total: number; outstanding: number; byCourse: any[] }>('/admin/revenue/summary');
  }
};
