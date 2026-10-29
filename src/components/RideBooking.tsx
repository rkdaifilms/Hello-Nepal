import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowRight, CheckCircle2, Sparkles, Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export const RideBooking: React.FC = () => {
  const [pickup, setPickup] = useState('भैरहवा (Bhairahawa)');
  const [dropoff, setDropoff] = useState('बुटवल (Butwal)');
  const [currentRide, setCurrentRide] = useState({ name: 'Hello Nepal Bike', rate: 25 });
  const [distance, setDistance] = useState(22.5); // किमी (भैरहवा से बुटवल)
  const [calculatedFare, setCalculatedFare] = useState(550);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  // भैरहवा, नेपाल के कोऑर्डिनेट्स
  const position: [number, number] = [27.5015, 83.4556];

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
    <div className="space-y-4 bg-white p-4 rounded-3xl shadow-md border border-gray-100">
      {/* Location Input Section (कहाँ से और कहाँ जाना है) */}
      <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="कहाँ से जाना है? (जैसे: भैरहवा)"
            className="w-full text-xs font-bold text-gray-800 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Navigation className="w-4 h-4 text-red-600 flex-shrink-0" />
          <input
            type="text"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="कहाँ जाना है? (जैसे: बुटवल, काठमांडू)"
            className="w-full text-xs font-bold text-gray-800 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Map View Section (Leaflet) */}
      <div className="relative w-full h-[240px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false} 
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              {pickup} से {dropoff} 🛵
            </Popup>
          </Marker>
        </MapContainer>
        
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow text-xs font-bold text-gray-700 flex items-center gap-1.5 z-[1000]">
          <Navigation className="w-3.5 h-3.5 text-red-600 animate-pulse" /> लाइव जीपीएस रूट
        </div>
      </div>

      {/* Ride Options Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setCurrentRide({ name: 'Hello Nepal Bike', rate: 25 }); setCalculatedFare(550); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${currentRide.name === 'Hello Nepal Bike' ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-gray-200'}`}
        >
          <div className="font-black text-xs text-gray-800">🛵 Hello Nepal Bike</div>
          <div className="text-[10px] text-gray-500 mt-0.5">तेज़ और किफायती</div>
        </button>
        <button
          type="button"
          onClick={() => { setCurrentRide({ name: 'Hello Nepal Auto', rate: 40 }); setCalculatedFare(850); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${currentRide.name === 'Hello Nepal Auto' ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-gray-200'}`}
        >
          <div className="font-black text-xs text-gray-800">🛺 Hello Nepal Auto</div>
          <div className="text-[10px] text-gray-500 mt-0.5">परिवार के लिए सुरक्षित</div>
        </button>
      </div>

      {/* Ride Details & Booking Actions */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">कुल अनुमानित दूरी ({pickup} से {dropoff}):</span>
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
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            तुरंत {currentRide.name} बुक करें <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {bookingStatus === 'searching' && (
          <div className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-2 animate-pulse">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            {pickup} से ड्राइवर की तलाश की जा रही है...
          </div>
        )}

        {bookingStatus === 'confirmed' && (
          <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" /> ड्राइवर कन्फर्म हो गया!
            </div>
            <p className="text-[11px] text-gray-600">Bishal Thapa (Lu 2 Pa 4590) - {dropoff} जाने के लिए 3 मिनट में आ रहा है</p>
            
            <button
              type="button"
              onClick={runSmartAIRouteCheck}
              disabled={isCheckingAI}
              className="w-full mt-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer"
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
              className="mt-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
            >
              नई बुकिंग करें
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideBooking;
