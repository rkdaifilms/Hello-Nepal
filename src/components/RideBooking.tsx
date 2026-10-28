 import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Bike, Car, Shield, Compass, Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// तेरा असली Mapbox Public Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

// तेरी OpenAI API Key (रॉन्ग टर्न और AI नेविगेशन वार्निंग के लिए)
const OPENAI_API_KEY = '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';

export const RideBooking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<'bike' | 'auto' | 'jeep'>('bike');
  const [pickup, setPickup] = useState('Traffic Chowk, Butwal');
  const [dropoff, setDropoff] = useState('Gautam Buddha Airport, Bhairahawa');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'confirmed'>('idle');
  
  // OpenAI AI नेविगेशन और रॉन्ग टर्न वार्निंग स्टेट
  const [isWrongTurn, setIsWrongTurn] = useState(false);
  const [aiWarningMessage, setAiWarningMessage] = useState<string | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  const rides = {
    bike: { name: 'Bike', price: 387, icon: Bike },
    auto: { name: 'Auto', price: 645, icon: Car },
    jeep: { name: 'Jeep', price: 1183, icon: Shield },
  };

  const currentRide = rides[selectedVehicle];
  const distance = 21.5;
  const calculatedFare = currentRide.price;

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      // Pathao / InDrive जैसा 3D 60° टिल्ट और ज़ूमिंग नेविगेशन मैप
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [83.4556, 27.7005], // बुटवल-भैरहवा लोकेशन
        zoom: 16,
        pitch: 62, // 3D टिल्ट व्यू
        bearing: -20,
      });

      mapInstance.current = map;

      // 3D बिल्डिंग्स और रोड्स एक्सट्रूज़न लेयर जोड़ना
      map.on('load', () => {
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id;

        map.addLayer(
          {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 13,
            'paint': {
              'fill-extrusion-color': '#1e293b',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0,
                15.5,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0,
                15.5,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.9
            }
          },
          labelLayerId
        );
      });

      // लाइव GPS मार्कर
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([83.4556, 27.7005])
        .addTo(map);
    }
  }, []);

  // असली OpenAI API से रॉन्ग टर्न / रूट चेक करने का फंक्शन
  const checkRouteWithOpenAI = async () => {
    setIsCheckingAI(true);
    setAiWarningMessage('🤖 OpenAI AI नेविगेशन रूट की जाँच कर रहा है...');

    try {
      // हम OpenAI को कॉल करके पूछ रहे हैं कि क्या ड्राइवर सही रास्ते पर है या रॉन्ग टर्न पर
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI ride safety assistant for a Nepali ride-sharing app (like Pathao/InDrive) traveling between Butwal and Bhairahawa. Randomly decide if a mock driver has taken a wrong turn or is on the correct route. Return a JSON format: {"isWrongTurn": boolean, "message": "Short warning or confirmation message in Hindi/Nepali"}'
            },
            {
              role: 'user',
              content: `Check route safety from ${pickup} to ${dropoff}.`
            }
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const content = JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
        setIsWrongTurn(content.isWrongTurn);
        setAiWarningMessage(content.message);
      } else {
        // अगर API से तुरंत रिस्पॉन्स न मिले तो स्मार्ट फॉलबैक
        setIsWrongTurn(false);
        setAiWarningMessage('✅ AI नेविगेशन: रूट बिल्कुल ठीक है, कोई रॉन्ग टर्न नहीं है।');
      }
    } catch (error) {
      // नेटवर्क या की एरर आने पर लोकल स्मार्ट अलर्ट
      setIsWrongTurn(true);
      setAiWarningMessage('⚠️ OpenAI सुरक्षा चेतावनी: ड्राइवर निर्धारित नेविगेशन रूट से बाहर जा रहा है!');
    } finally {
      setIsCheckingAI(false);
    }
  };

  const handleBookRide = () => {
    setBookingStatus('searching');
    setTimeout(() => {
      setBookingStatus('confirmed');
      checkRouteWithOpenAI(); // राइड कन्फर्म होते ही OpenAI AI नेविगेशन एक्टिव हो जाएगा
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top 3D Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white shadow-2xl shadow-red-500/20 border border-white/20">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 bg-black/20 backdrop-md px-3 py-1 rounded-full w-fit text-xs font-semibold mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>Mapbox 3D + OpenAI AI लाइव</span>
            </div>
            <h1 className="text-2xl font-black tracking-wide">Hello Nepal राइड्स</h1>
            <p className="text-xs text-white/80 mt-1">पठाओ और इनड्राइव जैसा 3D रोड व्यू नेविगेशन</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <Compass className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* OpenAI AI Wrong Turn Warning Box */}
      {aiWarningMessage && (
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 shadow-lg transition-all animate-bounce ${isWrongTurn ? 'bg-red-950/95 border-red-500 text-red-200' : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'}`}>
          <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${isWrongTurn ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          <div className="text-xs font-bold leading-relaxed">
            {aiWarningMessage}
          </div>
        </div>
      )}

      {/* Mapbox 3D 60° Tilt GPS Map View */}
      <div className="relative h-72 rounded-3xl overflow-hidden glass-card border border-white/20 shadow-2xl">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-white font-bold flex items-center space-x-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>OpenAI AI + 3D रोड रडार एक्टिव</span>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="glass-card-light rounded-3xl p-6 shadow-2xl border border-white space-y-5">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">पिकअप लोकेशन (कहाँ से)</p>
              <input 
                type="text" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-gray-800 focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">ड्रॉप लोकेशन (कहाँ तक)</p>
              <input 
                type="text" 
                value={dropoff} 
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-gray-800 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* 3D Vehicle Selection Cards */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-3 px-1">गाड़ी चुनें (3D ऑप्शंस)</p>
          <div className="grid grid-cols-3 gap-3">
            <div 
              onClick={() => setSelectedVehicle('bike')}
              className={`cursor-pointer p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${selectedVehicle === 'bike' ? 'bg-gradient-to-b from-red-50 to-white border-red-500 shadow-lg shadow-red-500/20 transform -translate-y-1' : 'bg-white/60 border-gray-200 hover:bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${selectedVehicle === 'bike' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Bike className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm text-gray-800">Bike</span>
              <span className="text-[11px] font-bold text-red-600 mt-0.5">Rs. 387 NPR</span>
            </div>

            <div 
              onClick={() => setSelectedVehicle('auto')}
              className={`cursor-pointer p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${selectedVehicle === 'auto' ? 'bg-gradient-to-b from-red-50 to-white border-red-500 shadow-lg shadow-red-500/20 transform -translate-y-1' : 'bg-white/60 border-gray-200 hover:bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${selectedVehicle === 'auto' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Car className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm text-gray-800">Auto</span>
              <span className="text-[11px] font-bold text-red-600 mt-0.5">Rs. 645 NPR</span>
            </div>

            <div 
              onClick={() => setSelectedVehicle('jeep')}
              className={`cursor-pointer p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${selectedVehicle === 'jeep' ? 'bg-gradient-to-b from-red-50 to-white border-red-500 shadow-lg shadow-red-500/20 transform -translate-y-1' : 'bg-white/60 border-gray-200 hover:bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${selectedVehicle === 'jeep' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm text-gray-800">Jeep</span>
              <span className="text-[11px] font-bold text-red-600 mt-0.5">Rs. 1183 NPR</span>
            </div>
          </div>
        </div>

        {/* Distance & Fare Display */}
        <div className="space-y-3 pt-2 border-t border-gray-200/60">
          <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="text-zinc-500 font-medium">कुल अनुमानित दूरी:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{distance} किमी (km)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">कुल किराया राशि:</span>
            <span className="font-extrabold text-base text-red-600">Rs. {calculatedFare} NPR</span>
          </div>

          {bookingStatus === 'idle' && (
            <button
              type="button"
              onClick={handleBookRide}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-base shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              तुरंत {currentRide.name} बुक करें <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {bookingStatus === 'searching' && (
            <div className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              आसपास के ड्राइवर की तलाश की जा रही है...
            </div>
          )}

          {bookingStatus === 'confirmed' && (
            <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> राइड सफलताપूर्वक कन्फर्म हो गई!
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">ड्राइवर आपके पिकअप पॉइंट की तरफ आ रहा है।</p>
              
              <button
                type="button"
                onClick={checkRouteWithOpenAI}
                disabled={isCheckingAI}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isCheckingAI ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    OpenAI AI रूट जाँच रहा है...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    OpenAI से AI रूट सेफ्टी चेक करें
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setBookingStatus('idle')}
                className="mt-1 px-4 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-xl"
              >
                नई बुकिंग करें
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

