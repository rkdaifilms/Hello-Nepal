import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { ArrowRight, CheckCircle2, Sparkles, Navigation, MapPin, Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// लीफलेट मार्कर आइकन फिक्स
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// मैप को ऑटो-मूव करने वाला कंट्रोलर
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const RideBooking: React.FC = () => {
  const [pickup, setPickup] = useState('Bhairahawa');
  const [dropoff, setDropoff] = useState('Butwal');
  
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([27.5015, 83.4556]); // भैरहवा
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([27.7000, 83.4167]); // बुटवल
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([
    [27.5015, 83.4556],
    [27.7000, 83.4167]
  ]);

  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [currentRide, setCurrentRide] = useState({ name: 'Hello Nepal Bike', rate: 25 });
  const [distance, setDistance] = useState<number>(22.5);
  const [calculatedFare, setCalculatedFare] = useState<number>(550);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // लाइव जीपीएस लोकेशन सर्च करने का फंक्शन (Nominatim API)
  const searchLocation = async (query: string, isPickup: boolean) => {
    if (!query.trim()) return;
    setIsSearchingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Nepal')}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newCoords: [number, number] = [lat, lon];

        if (isPickup) {
          setPickupCoords(newCoords);
        } else {
          setDropoffCoords(newCoords);
        }
      }
    } catch (error) {
      console.error("Location search failed", error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // जैसे ही पिकअप या ड्रॉपऑफ का नाम बदला, ऑटोमैटिक GPS सर्च ट्रिगर होगा
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(pickup, true);
    }, 700);
    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(dropoff, false);
    }, 700);
    return () => clearTimeout(timer);
  }, [dropoff]);

  // दूरी और रूट लाइन कैलकुलेट करना
  useEffect(() => {
    setRouteCoords([pickupCoords, dropoffCoords]);
    
    // दूरी निकालने का फॉर्मूला (Haversine formula)
    const R = 6371; 
    const dLat = (dropoffCoords[0] - pickupCoords[0]) * (Math.PI / 180);
    const dLon = (dropoffCoords[1] - pickupCoords[1]) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickupCoords[0] * (Math.PI / 180)) * Math.cos(dropoffCoords[0] * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.max(2, parseFloat((R * c).toFixed(1)));
    
    setDistance(dist);
    setCalculatedFare(Math.round(dist * currentRide.rate + 100));
  }, [pickupCoords, dropoffCoords, currentRide]);

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
      {/* Location Input Section */}
      <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="कहाँ से जाना है? (जैसे: Bhairahawa, Hatibangai)"
            className="w-full text-xs font-bold text-gray-800 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Navigation className="w-4 h-4 text-red-600 flex-shrink-0" />
          <input
            type="text"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="कहाँ जाना है? (जैसे: Butwal)"
            className="w-full text-xs font-bold text-gray-800 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Map View Section with Live GPS Route & Zoom Buttons */}
      <div className="relative w-full h-[260px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
        <MapContainer 
          center={pickupCoords} 
          zoom={zoomLevel} 
          scrollWheelZoom={true} 
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={pickupCoords} zoom={zoomLevel} />
          
          {/* पिकअप मार्कर */}
          <Marker position={pickupCoords}>
            <Popup>पिकअप: {pickup}</Popup>
          </Marker>

          {/* ड्रॉपऑफ मार्कर */}
          <Marker position={dropoffCoords}>
            <Popup>ड्रॉपऑफ: {dropoff}</Popup>
          </Marker>

          {/* लाइव रूट पॉलीलाइन (नीला रास्ता) */}
          <Polyline positions={routeCoords} color="#2563eb" weight={5} opacity={0.7} />
        </MapContainer>
        
        {/* लाइव जीपीएस स्टेटस बार */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow text-xs font-bold text-gray-700 flex items-center gap-1.5 z-[1000]">
          <Navigation className="w-3.5 h-3.5 text-red-600 animate-pulse" /> 
          {isSearchingLocation ? 'जीपीएस रूट लोड हो रहा है...' : `रूट: ${pickup} ➔ ${dropoff}`}
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

export default RideBooking;
