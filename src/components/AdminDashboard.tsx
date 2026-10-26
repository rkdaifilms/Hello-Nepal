import React, { useState } from 'react';
import { DollarSign, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [adminBal, setAdminBal] = useState(14580.50);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawnDone, setWithdrawnDone] = useState(false);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawnDone(true);
      setAdminBal(0.00);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-4">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-5 h-5 text-red-600" />
        <h3 className="font-black text-gray-900 text-lg">एडमिन तथा डेभलपर मास्टर वालेट</h3>
      </div>

      <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl text-white mb-4">
        <span className="text-xs font-semibold opacity-90">जम्मा भएको ५% प्लेटफर्म कमिसन</span>
        <div className="text-3xl font-black mt-1">रु. {adminBal.toLocaleString('ne-NP', { minimumFractionDigits: 2 })}</div>
      </div>

      {withdrawnDone ? (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>रकम सफलतापूर्वक eSewa/बैंक खातामा ट्रान्सफर गरियो!</span>
        </div>
      ) : (
        <button
          onClick={handleWithdraw}
          disabled={withdrawing || adminBal <= 0}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-black transition flex items-center justify-center space-x-1 disabled:opacity-50"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>{withdrawing ? 'विथड्रल हुँदैछ...' : 'eSewa / बैंकमा सिधै निकाल्नुहोस्'}</span>
        </button>
      )}
    </div>
  );
};
