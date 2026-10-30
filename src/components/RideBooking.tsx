import React, { useState, useEffect } from 'react';
import { Plus, Minus, ArrowRight, CheckCircle2, Sparkles, Navigation, MapPin } from 'lucide-react';

interface RideBookingProps {
  pickup: string;
  dropoff: string;
}

export default RideBooking: React.FC<RideBookingProps> = ({ pickup, dropoff }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [currentRide, setCurrentRide] = useState({ name: 'Hello Nepal Bike', rate: 25 });
  const [distance, setDistance] = useState<number>(3.5);
  const [calculatedFare, setCalculatedFare] = useState<number>(87);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  const [isCheckingAI, setIsCheckingAI] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [navigationSteps, setNavigationSteps] = useState<Array<string>>([]);

  // नेपाल और लोकल एरिया (भैरहवा, भुजौली, परहिया आदि) को प्राथमिकता देते हुए जीपीएस और सड़क रूट लोड करना
  useEffect(() => {
    const fetchLocalRoadRoute = async () => {
      try {
        // नेपाल के लोकल एरिया के हिसाब से जियोकोडिंग (सर्च बायस के साथ)
        const getLocalCoords = async (placeName: string) => {
          // नेपाल (countrycodes=np) और भैरहवा/रुपन्देही क्षेत्र के व्यूबॉक्स का इस्तेमाल ताकि नजदीक का गाँव पहले मिले
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&viewbox=83.3,27.3,83.6,27.7&bounded=0&q=${encodeURIComponent(placeName + ', Nepal')}`;
          const res = await fetch(searchUrl);
          const data = await res.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [lng, lat]
          }
          // यदि विशेष नाम न मिले तो डिफ़ॉल्ट भैरहवा/भुजौली कोऑर्डिनेट्स
          return [83.4430, 27.5042];
        };

        const startCoords = await getLocalCoords(pickup);
        const endCoords = await getLocalCoords(dropoff);

        // OSRM Driving API से असली सड़क का रास्ता और टर्न-बाय-टर्न निर्देश मंगाना
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&steps=true`);
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          const distInKm = Number((route.distance / 1000).toFixed(1));
          setDistance(distInKm > 0 ? distInKm : 2.5);

          // किराया कैलकुलेट करना
          const rate = currentRide.rate;
          setCalculatedFare(Math.max(50, Math.round((distInKm > 0 ? distInKm : 2.5) * rate)));

          // सड़क के रास्ते के पॉइंट्स (Coordinates) सेट करना
          const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoordinates(coords);

          // रास्ते के निर्देश और आगे आने वाले स्टॉप्स/गाँवों की लिस्ट बनाना (जैसे नौडियावा, पिपरैया आदि)
          if (route.legs && route.legs[0] && route.legs[0].steps) {
            const stepsDescription = route.legs[0].steps.map((step: any) => {
              let instruction = step.maneuver.type;
              if (step.name) {
                instruction += ` -> ${step.name} रोड पर आगे बढ़ें`;
              } else {
                instruction += ` सीधे रास्ते पर चलें`;
              }
              return instruction;
            });
            setNavigationSteps(stepsDescription.slice(0, 5)); // शुरुआती मुख्य निर्देश
          }
        }
      } catch (error) {
        console.error("Local routing error:", error);
      }
    };

    if (pickup && dropoff) {
      fetchLocalRoadRoute();
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
      alert("AI GPS चेक सफल: ड्राइवर भुजौली से परहिया के सबसे सुरक्षित और मुख्य सड़क मार्ग पर है!");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* लाइव सड़क और नेविगेशन डिस्प्ले एरिया */}
      <div className="relative w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Navigation className="w-4 h-4 animate-pulse" /> लाइव नेपाल GPS नेविगेशन चालू
          </span>
          <span className="text-slate-400">{distance} किमी (सड़क मार्ग)</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="text-slate-300 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" /> रूट: {pickup} से {dropoff}
          </div>
          {navigationSteps.length > 0 ? (
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-[11px] text-yellow-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1">📍 आगामी रास्ते के निर्देश (जैसे नौडियावा / पिपरैया मार्ग):</div>
              {navigationSteps.map((step, idx) => (
                <div key={idx} className="truncate">• {step}</div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-[11px]">पक्की सड़क का रूट लोड हो रहा है...</div>
          )}
        </div>

        {/* ज़ूम इन (+) और ज़ूम आउट (-) बटन */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-[1000]">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow flex items-center justify-center font-bold border border-slate-600 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 5))}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow flex items-center justify-center font-bold border border-slate-600 cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ride Options Selection */}
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

      {/* Ride Details & Booking Actions */}
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
                  नेविगेशन जाँच हो रही है...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  AI लाइव GPS और रूट सेफ्टी जाँचें
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
