import React, { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';
import { 
  Bike, 
  Car, 
  MapPin, 
  PhoneCall, 
  Navigation, 
  AlertTriangle, 
  Radar 
} from 'lucide-react';

export const RideBooking: React.FC = () => {
  const [pickup, setPickup] = useState('Traffic Chowk, Butwal');
  const [dropoff, setDropoff] = useState('Gautam Buddha Airport, Bhairahawa');
  const [vehicle, setVehicle] = useState<'Bike' | 'Auto' | 'Jeep'>('Bike');
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched' | 'offline_alert'>('idle');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const rates = { Bike: 18, Auto: 30, Jeep: 55 };
  const estimatedKm = 21.5;
  const totalFare = Math.round(estimatedKm * rates[vehicle]);

  const matchedDriver = {
    name: 'Bishal Thapa',
    phone: '+9779811522480',
    vehiclePlate: 'Lu 2 Pa 4590',
    rating: '4.9 ⭐',
  };

  const handleRequestRide = () => {
    setStatus('searching');
    setTimeout(() => {
      setStatus('matched');
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-5">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-red-600" />
            Pathao-स्टाइल राइड बुकिंग
          </h2>
          <span className="text-xs bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold px-2.5 py-0.5 rounded-full">
            नेपाल GPS रडार
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="w-full">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">पिकअप लोकेशन (कहाँ से)</p>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <MapPin className="w-5 h-5 text-red-600 shrink-0" />
            <div className="w-full">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">ड्रॉप लोकेशन (कहाँ तक)</p>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['Bike', 'Auto', 'Jeep'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVehicle(type)}
              className={`p-3 rounded-xl border text-center transition-all ${
                vehicle === type
                  ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 ring-2 ring-red-500'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {type === 'Bike' && <Bike className="w-6 h-6 mx-auto mb-1 text-zinc-800 dark:text-zinc-200" />}
              {type === 'Auto' && <Car className="w-6 h-6 mx-auto mb-1 text-zinc-800 dark:text-zinc-200" />}
              {type === 'Jeep' && <Car className="w-6 h-6 mx-auto mb-1 text-zinc-800 dark:text-zinc-200" />}
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{type}</p>
              <p className="text-[11px] text-zinc-500">Rs. {Math.round(estimatedKm * rates[type])} NPR</p>
            </button>
          ))}
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-500">दूरी: </span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{estimatedKm} km</span>
          </div>
          <div>
            <span className="text-zinc-500">किराया: </span>
            <span className="font-extrabold text-red-600 text-sm">Rs. {totalFare} NPR</span>
          </div>
        </div>

        {status === 'idle' && (
          <button
            onClick={handleRequestRide}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md"
          >
            तुरंत {vehicle} बुक करें
          </button>
        )}

        {status === 'searching' && (
          <div className="py-6 text-center space-y-2">
            <Radar className="w-8 h-8 text-red-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              आसपास के उपलब्ध {vehicle} ड्राइवरों से संपर्क हो रहा है...
            </p>
          </div>
        )}

        {status === 'matched' && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  ड्राइवर कन्फर्म हो गया
                </span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {matchedDriver.name} ({matchedDriver.vehiclePlate})
                </h4>
                <p className="text-xs text-zinc-500">{matchedDriver.rating} • 3 मिनट में पहुंचेगा</p>
              </div>
              <a
                href={`tel:${matchedDriver.phone}`}
                className="p-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition-transform active:scale-95"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg"
              >
                डिजिटल पे (eSewa / Khalti)
              </button>
              <button
                onClick={() => setStatus('offline_alert')}
                className="px-3 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-lg"
              >
                ऑफलाइन / कैश
              </button>
            </div>
          </div>
        )}

        {status === 'offline_alert' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-bold">GPS ऑटो-डिडक्शन अलर्ट</h4>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              यह ट्रिप ({pickup} से {dropoff}) ऑफलाइन संपन्न हुई पाई गई है। सिस्टम ने सुरक्षा नियम के तहत 5% कमीशन (Rs. {(totalFare * 0.05).toFixed(2)} NPR) ड्राइवर के वॉलेट से काट लिया है। खाता ब्लॉक नहीं किया गया है।
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-xs font-bold text-amber-900 dark:text-amber-100 underline"
            >
              समझ गया (बंद करें)
            </button>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        title={`किराया: ${pickup} से ${dropoff}`}
        amount={totalFare}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setStatus('idle');
        }}
      />
    </div>
  );
};
