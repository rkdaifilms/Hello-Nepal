import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [pickup, setPickup] = useState<string>('भुजौली, रूपन्देही');
  const [dropoff, setDropoff] = useState<string>('जनकपुरधाम');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, car
  const [routeInfo, setRouteInfo] = useState<string>('नेपाल का कोई भी गांव या जिला लिखकर 'रास्ता खोजें' दबाएं');
  const [fareInfo, setFareInfo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // नेपाल के सेंटर (भैरहवा/लुम्बिनी) से मैप शुरू करें
    const map = L.map(mapContainer.current).setView([27.5042, 83.4485], 13);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = layerGroup;

    handleFindRoute();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // नेपाल के किसी भी गांव, वार्ड या जिले का सटीक कोऑर्डिनेट ढूंढने के लिए लाइव API फंक्शन
  const searchNepalLocation = async (placeName: string): Promise<[number, number]> => {
    try {
      // Nominatim API को सिर्फ नेपाल (countrycodes=np) के लिए सेट किया गया है ताकि हर गांव/जिला मिले
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName + ', Nepal')}&countrycodes=np&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }
    } catch (error) {
      console.error("Location search error:", error);
    }

    // अगर नाम न मिले तो डिफ़ॉल्ट रूपन्देही/भैरहवा लें
    return [83.4485, 27.5042];
  };

  const handleFindRoute = async () => {
    if (!mapInstance.current || !routeLayerRef.current) return;

    setLoading(setLoading(true));
    setRouteInfo('📍 नेपाल के डेटाबेस से सटीक लोकेशन खोजी जा रही है...');

    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();

    // नेपाल के किसी भी कोने का लाइव डेटा फेच करें
    const startCoords = await searchNepalLocation(cleanPickup);
    const endCoords = await searchNepalLocation(cleanDropoff);

    const currentMap = mapInstance.current;
    const currentLayer = routeLayerRef.current;

    currentLayer.clearLayers();

    const startMarker = L.marker([startCoords[1], startCoords[0]]).bindPopup(`पिकअप: ${cleanPickup}`);
    const endMarker = L.marker([endCoords[1], endCoords[0]]).bindPopup(`ड्रॉप: ${cleanDropoff}`);
    currentLayer.addLayer(startMarker);
    currentLayer.addLayer(endMarker);

    const polyline = L.polyline([
      [startCoords[1], startCoords[0]],
      [endCoords[1], endCoords[0]]
    ], { color: '#2563eb', weight: 6, opacity: 0.8 });
    
    currentLayer.addLayer(polyline);
    currentMap.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    const distKm = calculateDistance(startCoords[1], startCoords[0], endCoords[1], endCoords[0]);
    const actualRoadDist = (distKm * 1.3).toFixed(1);
    const durationMin = Math.round(parseFloat(actualRoadDist) * 2.5);

    setRouteInfo(`📍 कुल दूरी: ${actualRoadDist} किमी | ⏱️ समय: ${durationMin} मिनट`);

    let baseFare = 50;
    let perKm = 25;
    let vName = 'बाइक (Bike)';

    if (vehicle === 'auto') {
      baseFare = 100;
      perKm = 45;
      vName = 'ऑटो / रिक्शा (Auto)';
    } else if (vehicle === 'car') {
      baseFare = 200;
      perKm = 75;
      vName = 'कार / जीप (Car/Jeep)';
    }

    const totalFare = Math.round(baseFare + (parseFloat(actualRoadDist) * perKm));
    setFareInfo(`🛺 वाहन: ${vName} | 💵 कुल किराया: Rs. ${totalFare} NPR`);
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden', background: '#f8fafc' }}>
      
      <div style={{ background: '#dc2626', color: '#fff', padding: '12px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', zIndex: 1000, position: 'relative' }}>
        🇳🇵 Hello Nepal - 77 जिला & सभी गांव GPS
      </div>

      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '42vh', 
          zIndex: 1 
        }} 
      />

      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '52vh',
        background: '#ffffff',
        padding: '15px',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 10px auto' }} />
        
        {/* वाहन चयन बटन */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button 
            onClick={() => setVehicle('bike')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'bike' ? '#dc2626' : '#f1f5f9', color: vehicle === 'bike' ? '#fff' : '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🏍️ बाइक
          </button>
          <button 
            onClick={() => setVehicle('auto')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'auto' ? '#dc2626' : '#f1f5f9', color: vehicle === 'auto' ? '#fff' : '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🛺 ऑटो / रिक्शा
          </button>
          <button 
            onClick={() => setVehicle('car')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'car' ? '#dc2626' : '#f1f5f9', color: vehicle === 'car' ? '#fff' : '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🚙 कार / जीप
          </button>
        </div>

        {/* पिकअप इनपुट */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ से (Pickup - नेपाल का कोई भी गांव/जिला):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            placeholder="जैसे: भुजौली, वार्ड ११, इटहरी, विराटनगर..."
            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* ड्रॉपऑफ इनपुट */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ जाना है (Dropoff - नेपाल का कोई भी गांव/जिला):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            placeholder="जैसे: जनकपुरधाम, काठमांडौ, पोखरा..."
            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* सर्च बटन */}
        <button 
          onClick={handleFindRoute}
          style={{
            width: '100%',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            padding: '11px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
          }}
        >
          रास्ता और किराया खोजें (Find Route)
        </button>

        {/* रिजल्ट डिस्प्ले */}
        {routeInfo && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            {routeInfo}
          </div>
        )}

        {fareInfo && (
          <div style={{ marginTop: '6px', padding: '8px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
            {fareInfo}
          </div>
        )}
      </div>
    </div>
  );
}
