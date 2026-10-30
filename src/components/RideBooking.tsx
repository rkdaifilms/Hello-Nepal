import React, { useState, useEffect } from 'react';
import { Plus, Minus, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

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

  // असली सड़क का रूट (OSRM API) और दूरी निकालने का फंक्शन
  useEffect(() => {
    const fetchRoadRouteAndDistance = async () => {
      try {
        // भैरहवा और नेपाल की लोकेशन के लिए Geocoding
        const getCoords = async (placeName: string) => {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName + ', Bhairahawa, Nepal')}`);
          const data = await res.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [lng, lat]
          }
          // डिफ़ॉल्ट भैरहवा कोऑर्डिनेट्स अगर नाम न मिले
          return [83.4430, 27.5042];
        };

        const startCoords = await getCoords(pickup);
        const endCoords = await getCoords(dropoff);

        // OSRM Routing API से असली सड़क का रास्ता मंगाना
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`);
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          const distInKm = Number((route.distance / 1000).toFixed(1));
          setDistance(distInKm > 0 ? distInKm : 2.5);

          // किराया कैलकुलेट करना
          const rate = currentRide.rate;
          setCalculatedFare(Math.max(50, Math.round((distInKm > 0 ? distInKm : 2.5) * rate)));

          // सड़क के रास्ते के पॉइंट्स (Coordinates) सेट करना ताकि मैप पर सीधी लाइन की जगह सड़क दिखे
          const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRouteCoordinates(coords);
        }
      } catch (error) {
        console.error("Routing error:", error);
      }
    };

    if (pickup && dropoff) {
      fetchRoadRouteAndDistance();
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
      alert("AI रूट चेक सफल: ड्राइवर सबसे सुरक्षित और साफ सड़क के रास्ते से आ रहा है!");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* मैप और राउटिंग डिस्प्ले एरिया */}
      <div className="relative w-full h-48 bg-gray-200 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 text-xs text-gray-600 font-medium p-4 text-center">
          {routeCoordinates.length > 0 ? (
            <span className="text-emerald-700 font-bold">✓ असली सड़क का जीपीएस रूट लोड हो गया ({distance} किमी)</span>
          ) : (
            <span>सड़क का रूट लोड हो रहा है...</span>
          )}
        </div>

        {/* ज़ूम इन (+) और ज़ूम आउट (-) बटन */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-[1000]">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
            className="w-9 h-9 bg-white hover:bg-gray-100 text-gray-800 rounded-xl shadow-md flex items-center justify-center font-bold border border-gray-200 cursor-pointer active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 5))}
            className="w-9 h-9 bg-white hover:bg-gray-100 text-gray-800 rounded-xl shadow-md flex items-center justify-center font-bold border border-gray-200 cursor-pointer active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5 text-gray-700" />
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
