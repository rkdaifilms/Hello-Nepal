import { PaymentMethod, PaymentReceipt } from '../types';
import { CONFIG } from '../config/env';

export interface PaymentPayload {
  amount: number;
  gateway: PaymentMethod;
  phone: string;
  mpin: string;
  targetRecipientPhone?: string;
  description: string;
}

export class PaymentService {
  static async executePayment(payload: PaymentPayload): Promise<PaymentReceipt> {
    // १. 4-अंकों का MPIN अनिवार्य जाँच
    if (!/^\d{4}$/.test(payload.mpin)) {
      throw new Error('भुगतान अस्वीकृत: कृपया अपना सही 4-अंकों का MPIN दर्ज करें।');
    }

    // २. 10-अंकों का नेपाली मोबाइल नंबर जाँच
    if (!payload.phone || payload.phone.length < 10) {
      throw new Error('कृपया सही 10-अंकों का नेपाली मोबाइल नंबर दर्ज करें।');
    }

    // ३. गेटवे रिस्पॉन्स सिमुलेशन
    await new Promise((resolve) => setTimeout(resolve, 800));

    // ४. 5% अनिवार्य एडमिन/डेवलपर कमीशन कट
    const adminCut = Math.round(payload.amount * (CONFIG.rules.adminCommissionPercent / 100) * 100) / 100;
    const vendorOrDriverNet = payload.amount - adminCut;
    const txnId = `HN-${payload.gateway.toUpperCase()}-${Date.now().toString().slice(-7)}`;

    return {
      transactionId: txnId,
      gateway: payload.gateway,
      amount: payload.amount,
      adminCut,
      vendorOrDriverNet,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }),
      recipientPhone: payload.targetRecipientPhone || payload.phone,
      status: 'SUCCESS',
    };
  }
}
