import React, { useState } from 'react';
import { PaymentMethod, PaymentReceipt } from '../types';
import { PaymentService } from '../services/paymentService';
import { QrCode, Lock, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  amount: number;
  driverQrUrl?: string;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  title,
  amount,
  driverQrUrl,
  onClose,
  onSuccess,
}) => {
  const [gateway, setGateway] = useState<PaymentMethod>('esewa');
  const [phone, setPhone] = useState('9811522480');
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await PaymentService.executePayment({
        amount,
        gateway,
        phone,
        mpin,
        targetRecipientPhone: '9811522480',
        description: `Payment for ${title}`,
      });
      setReceipt(res);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'पेमेंट प्रक्रिया में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">तुरंत डिजिटल भुगतान</h3>
            <p className="text-xs text-zinc-500">{title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {receipt ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
              भुगतान सफल रहा!
            </h4>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-left text-xs space-y-2 border border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-500">ट्रांजैक्शन आईडी:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">कुल भुगतान:</span>
                <span className="font-bold text-emerald-600">Rs. {receipt.amount} NPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">प्लेटफ़ॉर्म 5% अनुशासन कट:</span>
                <span className="text-red-500 font-semibold">Rs. {receipt.adminCut} NPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ड्राइवर/दुकानदार को मिला:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Rs. {receipt.vendorOrDriverNet} NPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">समय (नेपाल):</span>
                <span className="text-zinc-600 dark:text-zinc-400">{receipt.timestamp}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md"
            >
              पूर्ण (वापस जाएं)
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">भुगतान का माध्यम चुनें</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'esewa', label: 'eSewa', color: 'border-emerald-500' },
                  { id: 'khalti', label: 'Khalti', color: 'border-purple-500' },
                  { id: 'imepay', label: 'IME Pay', color: 'border-red-500' },
                  { id: 'driver_qr', label: 'Peer QR', color: 'border-amber-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGateway(item.id as PaymentMethod)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                      gateway === item.id
                        ? `${item.color} bg-zinc-100 dark:bg-zinc-800 ring-2 ring-red-500`
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {gateway === 'driver_qr' ? (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-center space-y-2 border border-dashed border-zinc-300 dark:border-zinc-700">
                <QrCode className="w-12 h-12 text-zinc-700 dark:text-zinc-300 mx-auto" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  ड्राइवर का eSewa / Khalti QR कोड स्कैन करें
                </p>
                <div className="text-[11px] text-zinc-500">
                  {driverQrUrl ? 'ड्राइवर का QR कोड लोड हो चुका है' : 'Hello Nepal सेंट्रल QR सक्रिय है'}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {gateway.toUpperCase()} मोबाइल नंबर
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 4-अंकों का MPIN / वॉलेट पिन
              </label>
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                className="w-full px-3 py-2 tracking-widest text-center text-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••"
                required
              />
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>कुल देय राशि:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Rs. {amount} NPR</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>5% सुरक्षित प्लेटफ़ॉर्म अनुशासन कट:</span>
                <span>Rs. {(amount * 0.05).toFixed(2)} NPR</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.98]"
            >
              {loading ? 'गेटवे से कनेक्ट हो रहा है...' : `तुरंत Rs. ${amount} NPR भुगतान करें`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
