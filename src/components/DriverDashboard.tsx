import React, { useState } from 'react';
import { CONFIG } from '../config/env';
import { Wallet, ShieldAlert, ArrowUpRight, CheckCircle2, AlertCircle, Lock, Smartphone, Banknote } from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(550.0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [destinationAccount, setDestinationAccount] = useState<string>('9811522480');
  const [mpin, setMpin] = useState<string>('');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minRequiredBalance = CONFIG.rules.driverMinimumBalanceNPR; // 200 NPR
  const withdrawableBalance = Math.max(0, balance - minRequiredBalance);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    setErrorMsg(null);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('कृपया सही रकम दर्ज करें।');
      return;
    }

    if (balance - amt < minRequiredBalance) {
      setErrorMsg(
        `विथड्रॉल अस्वीकृत: ड्राइवरों को अपने वॉलेट में अनिवार्य रूप से कम से कम Rs. ${minRequiredBalance} NPR सिक्योरिटी बैलेंस रखना जरूरी है।`
      );
      return;
    }

    if (mpin.length !== 4) {
      setErrorMsg('कृपया अपना सही 4-अंकों का MPIN दर्ज करें।');
      return;
    }

    setBalance((prev) => prev - amt);
    setWithdrawMsg(`Rs. ${amt.toFixed(2)} NPR तुरंत आपके खाते (${destinationAccount}) में ट्रांसफर कर दिए गए हैं।`);
    setWithdrawAmount('');
    setMpin('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* वॉलेट कार्ड */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-red-500" />
            <span className="text-xs font-semibold text-zinc-400">ड्राइवर अर्निंग वॉलेट</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            KYC वेरिफाइड
          </span>
        </div>

        <div>
          <p className="text-xs text-zinc-400">कुल वॉलेट बैलेंस</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Rs. {balance.toFixed(2)} NPR</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 mt-2">
            <span>
              सुरक्षित न्यूनतम जमा: <strong className="text-amber-400">Rs. {minRequiredBalance} NPR</strong> (निकासी योग्य नहीं)
            </span>
            <span>•</span>
            <span>
              निकासी योग्य: <strong className="text-emerald-400">Rs. {withdrawableBalance.toFixed(2)} NPR</strong>
            </span>
          </div>
        </div>

        {balance < minRequiredBalance && (
          <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <span>अकाउंट लॉक: बैलेंस Rs. {minRequiredBalance} से कम हो गया है। नई राइड्स लेने के लिए तुरंत eSewa से रिचार्ज करें।</span>
          </div>
        )}
      </div>

      {/* विथड्रॉल फॉर्म कार्ड */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-indigo-500" />
          कमाई तुरंत बैंक या eSewa में ट्रांसफर करें
        </h3>

        {/* सफलता संदेश */}
        {withdrawMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{withdrawMsg}</span>
          </div>
        )}

        {/* त्रुटि संदेश */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* निकासी रकम */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" />
                निकासी रकम (NPR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="उदा. 200"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {withdrawableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(withdrawableBalance.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-200 transition"
                  >
                    पूरा निकालें
                  </button>
                )}
              </div>
            </div>

            {/* गंतव्य खाता */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                eSewa ID / मोबाइल नंबर
              </label>
              <input
                type="text"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                placeholder="उदा. 98XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* MPIN और सबमिट बटन */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                4-अंकों का MPIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full tracking-widest text-center px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={withdrawableBalance <= 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                withdrawableBalance <= 0
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              रकम ट्रांसफर करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
