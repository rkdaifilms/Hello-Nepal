import React, { useState } from 'react';
import { CONFIG } from '../config/env';
import { Wallet, ShieldAlert, ArrowUpRight, Upload, QrCode, CheckCircle2, Lock } from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const [balance, setBalance] = useState(550.0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('9811522480');
  const [mpin, setMpin] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minRequiredBalance = CONFIG.rules.driverMinimumBalanceNPR; // 200 NPR

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
    setWithdrawMsg(`Rs. ${amt} NPR तुरंत आपके खाते (${destinationAccount}) में ट्रांसफर कर दिए गए हैं।`);
    setWithdrawAmount('');
    setMpin('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
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
          <p className="text-xs text-zinc-400">उपलब्ध विथड्रॉएबल बैलेंस</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Rs. {balance.toFixed(2)} NPR</h2>
          <p className="text-[11px] text-zinc-400 mt-1">
            सुरक्षित न्यूनतम जमा: <span className="text-amber-400">Rs. {minRequiredBalance} NPR</span> (निकासी योग्य नहीं)
          </p>
        </div>

        {balance < minRequiredBalance && (
          <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <span>अकाउंट लॉक: बैलेंस Rs. 200 से कम हो गया है। नई राइड्स लेने के लिए तुरंत eSewa से रिचार्ज करें।</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
