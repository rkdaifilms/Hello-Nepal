export type UserRole = 'customer' | 'driver' | 'delivery' | 'seller' | 'admin';
export type PaymentMethod = 'esewa' | 'khalti' | 'imepay' | 'bank_card' | 'driver_qr';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  walletBalance: number;
  isLocked: boolean;
  lockReason?: string;
  referredBy?: string;
  referralCode: string;
  driverQrUrl?: string;
}

export interface ProductItem {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  category: 'Medicines' | 'Food' | 'Clothing' | 'Cars' | 'Electronics';
  description: string;
  basePrice: number;
  markupPrice: number; // 5% मार्कअप के साथ कस्टमर प्राइस
  imageUrl: string;
  stockCount: number;
}

export interface PaymentReceipt {
  transactionId: string;
  gateway: PaymentMethod;
  amount: number;
  adminCut: number;
  vendorOrDriverNet: number;
  timestamp: string;
  recipientPhone: string;
  status: 'SUCCESS' | 'FAILED';
}
