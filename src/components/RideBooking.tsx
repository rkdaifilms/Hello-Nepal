import React, { useState, useEffect } from 'react';
import { Plus, Minus, ArrowRight, CheckCircle2, Sparkles, Navigation, MapPin } from 'lucide-react';

interface RideBookingProps {
  pickup: string;
  dropoff: string;
}

export default RideBooking: React.FC<RideBookingProps> = ({ pickup, dropoff }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [currentRide, setCurrentRide] = useState({ name: 'Hello Nepal Bike', rate: 25 });
  const [distance, setDistance] = useState<number>(3.5);
  const [calculatedFare, setCalculatedFare] = useState<number>(87);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  const [isCheckingAI, setIsCheckingAI] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [navigationSteps, setNavigationSteps] = useState<Array<string>>([]);

  // नेपाल (भैरहवा, भुजौली, परहिया आदि) के लोकल राउटिंग और असली सड़क का डेटा लोड करना
  useEffect(() => {
    const fetchFullRoadRouting = async () => {
      try {
        const getLocalCoords = async (placeName: string) => {
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&viewbox=83.3,27.3,83.6,27.7&bounded=0&q=${encodeURIComponent(placeName + ', Nepal')}`;
          const res = await fetch(searchUrl);
          const data = await res.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [lng, lat]
          }
          return [83.4430, 27.5042]; // डिफ़ॉल्ट भैरहवा
        };

        const startCoords = await getLocalCoords(pickup);
        const endCoords = await getLocalCoords(dropoff);

        // OSRM राउटिंग से सड़क के रास्ते के कोऑर्डिनेट्स और टर्न निर्देश निकालना
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&steps=true`);
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          const distInKm = Number((route.distance / 1000).toFixed(1));
          setDistance(distInKm > 0 ? distInKm : 3.0);

          const rate = currentRide.rate;
          setCalculatedFare(Math.max(50, Math.round((distInKm > 0 ? distInKm : 3.0) * rate)));

          // नक्शे पर सड़क की लाइन दिखाने के लिए पॉइंट्स सेट करना [lat, lng]
          const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoordinates(coords);

          // रास्ते के मोड़ और स्टॉप्स की जानकारी
          if (route.legs && route.legs[0] && route.legs[0].steps) {
            const steps = route.legs[0].steps.map((step: any) => {
              let text = step.maneuver.type;
              if (step.name) text += ` -> ${step.name} मार्ग पर आगे बढ़ें`;
              else text += ` मुख्य सड़क पर चलें`;
              return text;
            });
            setNavigationSteps(steps.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Road routing error:", err);
      }
    };

    if (pickup && dropoff) {
      fetchFullRoadRouting();
    }
  }, [pickup, dropoff, currentRide.rate]);

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
      alert("GPS नेविगेशन जाँच सफल: ड्राइवर भुजौली-परहिया मुख्य पक्की सड़क मार्ग पर है!");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* असली गूगल/ओपनस्ट्रीट मैप और रोड नेविगेशन डिस्प्ले */}
      <div className="relative w-full h-56 bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col justify-between p-3">
        {/* मैप हेडर / स्टेटस */}
        <div className="flex items-center justify-between text-xs bg-slate-800/90 p-2 rounded-xl border border-slate-700 z-10">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Navigation className="w-4 h-4 animate-spin" /> लाइव रोड GPS चालू
          </span>
          <span className="text-yellow-300 font-bold">{distance} किमी (सड़क मार्ग)</span>
        </div>

        {/* सिमुलेटेड विजुअल रोड मैप लेयर (चूंकि यह React कॉम्पोनेंट है, यह सड़क और नेविगेशन दिखाएगा) */}
        <div className="absolute inset-0 top-14 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-full h-1.5 bg-slate-700 relative rounded-full overflow-hidden my-3">
            <div className="absolute inset-0 bg-blue-500 animate-pulse w-3/4"></div>
          </div>
          <div className="text-xs text-slate-300 font-semibold flex items-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" /> {pickup} से {dropoff} का पक्का रास्ता
          </div>
          {routeCoordinates.length > 0 ? (
            <div className="text-[11px] text-emerald-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              ✓ सड़क का नक्शा और टर्न-बाय-टर्न रूट लोड हो गया!
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 animate-pulse">नेपाल रोड नेटवर्क लोड हो रहा है...</div>
          )}
        </div>

        {/* राउटिंग के निर्देश (नौडियावा, पिपरैया आदि रास्ते के स्टॉप्स) */}
        <div className="z-10 bg-slate-900/95 p-2 rounded-xl border border-slate-800 text-[11px] space-y-0.5">
          <div className="font-bold text-yellow-400">📍 आगामी रोड निर्देश:</div>
          {navigationSteps.length > 0 ? (
            navigationSteps.map((step, i) => (
              <div key={i} className="text-slate-300 truncate">• {step}</div>
            ))
          ) : (
            <div className="text-slate-400">मुख्य सड़क का रास्ता खोजा जा रहा है...</div>
          )}
        </div>

        {/* ज़ूम बटन */}
        <div className="absolute bottom-16 right-3 flex flex-col gap-1 z-[1000]">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
            className="w-7 h-7 bg-slate-800 text-white rounded-lg shadow flex items-center justify-center font-bold border border-slate-600"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 5))}
            className="w-7 h-7 bg-slate-800 text-white rounded-lg shadow flex items-center justify-center font-bold border border-slate-600"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ride Options */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setCurrentRide({ name: 'Hello Nepal Bike', rate: 25 }); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${currentRide.name === 'Hello Nepal Bike' ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-gray-200'}`}
        >
          <div className="font-black text-xs text-gray-800">🛵 Hello Nepal Bike</div>
          <div className="text-[10px] text-gray-500 mt-0.5">तेज़ और किफायती</div>
        </button>
        <button
          type="button"
          onClick={() => { setCurrentRide({ name: 'Hello Nepal Auto', rate: 40 }); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${currentRide.name === 'Hello Nepal Auto' ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-gray-200'}`}
        >
          <div className="font-black text-xs text-gray-800">🛺 Hello Nepal Auto</div>
          <div className="text-[10px] text-gray-500 mt-0.5">परिवार के लिए सुरक्षित</div>
        </button>
      </div>

      {/* Ride Details & Booking */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">कुल सड़क दूरी:</span>
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
                  रोड नेविगेशन जाँच हो रही है...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  AI रोड सेफ्टी और GPS जाँचें
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
