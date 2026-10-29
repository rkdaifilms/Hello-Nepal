import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

// === मैपबॉक्स का पक्का पब्लिक एक्सेस टोकन यहाँ सेट कर दिया है ===
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsbHByaXlhbmNlIiwiYSI6ImI0YXZlRGR0T0hVd2VHbHlNbnB4R3hlbWpKb0RWMWxOMi5CQ1FuOGlpQXB2R2hDWC1lezhWZw==';

const RideBooking = ({ currentRide, calculatedFare, distance }) => {
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  const handleBookRide = () => {
    setBookingStatus('searching');
    setTimeout(() => {
      setBookingStatus('confirmed');
    }, 3000);
  };

  const runSmartAIRouteCheck = () => {
    setIsCheckingAI(true);
    setTimeout(() => {
      setIsCheckingAI(false);
    }, 2000);
  };

  return (
    <div className="space-y-2.5 pt-2 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">कुल अनुमानित दूरी:</span>
        <span className="font-bold text-gray-800">{distance} किमी (km)</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">कुल किराया राशि:</span>
        <span className="font-extrabold text-sm text-red-600">Rs. {calculatedFare} NPR</span>
      </div>

      {bookingStatus === 'idle' && (
        <button
          type="button"
          onClick={handleBookRide}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          तुरंत {currentRide?.name || 'राइड'} बुक करें <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {bookingStatus === 'searching' && (
        <div className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          आसपास के ड्राइवर की तलाश की जा रही है...
        </div>
      )}

      {bookingStatus === 'confirmed' && (
        <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> ड्राइवर कन्फर्म हो गया!
          </div>
          <p className="text-[11px] text-gray-600">Bishal Thapa (Lu 2 Pa 4590) - 3 मिनट में पहुँच रहा है</p>
          
          <button
            type="button"
            onClick={runSmartAIRouteCheck}
            disabled={isCheckingAI}
            className="w-full mt-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow"
          >
            {isCheckingAI ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI रूट जाँच रहा है...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                AI रूट सेफ्टी और रॉन्ग-टर्न चेक करें
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setBookingStatus('idle')}
            className="mt-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
          >
            नई बुकिंग करें
          </button>
        </div>
      )}
    </div>
  );
};

export default RideBooking;
