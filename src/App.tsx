import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [pickup, setPickup] = useState<string>('Bairahawa');
  const [dropoff, setDropoff] = useState<string>('Kathmandu');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, car
  const [routeInfo, setRouteInfo] = useState<string>('सड़क का सटीक रूट खोजा जा रहा है...');
  const [fareInfo, setFareInfo] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [totalFare, setTotalFare] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // पेमेंट और बुकिंग स्टेट
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('esewa');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

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

  // जियोकोडिंग फंक्शन (नेपाल के भीतर लोकेशन ढूंढने के लिए)
  const searchNepalLocation = async (placeName: string): Promise<[number, number]> => {
    try {
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
    return [83.4485, 27.5042]; // डिफ़ॉल्ट भैरहवा
  };

  // असली सड़क मार्ग (OSRM API) दिखाने का फंक्शन ताकि सीधी लाइन न आए
  const handleFindRoute = async () => {
    if (!mapInstance.current || !routeLayerRef.current) return;

    setLoading(true);
    setRouteInfo('🛣️ नेपाल के राजमार्ग और सड़कों का रूट लोड हो रहा है...');
    setBookingConfirmed(false);

    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();

    const startCoords = await searchNepalLocation(cleanPickup);
    const endCoords = await searchNepalLocation(cleanDropoff);

    const currentMap = mapInstance.current;
    const currentLayer = routeLayerRef.current;
    currentLayer.clearLayers();

    // पिन जोड़ें
    const startMarker = L.marker([startCoords[1], startCoords[0]]).bindPopup(`पिकअप: ${cleanPickup}`);
    const endMarker = L.marker([endCoords[1], endCoords[0]]).bindPopup(`ड्रॉप: ${cleanDropoff}`);
    currentLayer.addLayer(startMarker);
    currentLayer.addLayer(endMarker);

    try {
      // OSRM राउटिंग API से असली सड़क का रास्ता मंगवाएं
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
      );
      const routeData = await routeRes.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const distMeters = route.distance; // मीटर में
        const durSeconds = route.duration; // सेकंड में

        const distKmVal = parseFloat((distMeters / 1000).toFixed(1));
        const durMin = Math.round(durSeconds / 60);

        setDistanceKm(distKmVal);
        setRouteInfo(`📍 कुल दूरी: ${distKmVal} किमी | ⏱️ समय: ${durMin} मिनट`);

        // जियोjson कोर्डिनेट्स को Leaflet पॉलीलाइन में बदलें ताकि गाड़ी सड़क पर घूमी हुई नजर आए
        const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        const polyline = L.polyline(coords, { color: '#2563eb', weight: 6, opacity: 0.8 });

        currentLayer.addLayer(polyline);
        currentMap.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // किराया कैलकुलेशन
        let baseFare = 60;
        let perKm = 25;
        if (vehicle === 'auto') {
          baseFare = 120;
          perKm = 45;
        } else if (vehicle === 'car') {
          baseFare = 250;
          perKm = 80;
        }

        const calculatedFare = Math.round(baseFare + (distKmVal * perKm));
        setTotalFare(calculatedFare);
        setFareInfo(`💵 कुल अनुमानित किराया: Rs. ${calculatedFare} NPR`);
      } else {
        fallbackDirectLine(startCoords, endCoords, cleanPickup, cleanDropoff);
      }
    } catch (e) {
      fallbackDirectLine(startCoords, endCoords, cleanPickup, cleanDropoff);
    }

    setLoading(false);
  };

  const fallbackDirectLine = (start: [number, number], end: [number, number], pName: string, dName: string) => {
    const polyline = L.polyline([[start[1], start[0]], [end[1], end[0]]], { color: '#2563eb', weight: 6, opacity: 0.8 });
    routeLayerRef.current?.addLayer(polyline);
    mapInstance.current?.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    setDistanceKm(150);
    setRouteInfo(`📍 कुल दूरी: 150 किमी | ⏱️ समय: 3 घंटे`);
    setTotalFare(4500);
    setFareInfo(`💵 कुल अनुमानित किराया: Rs. 4500 NPR`);
  };

  const handleConfirmPaymentAndBooking = () => {
    setShowPaymentModal(false);
    setBookingConfirmed(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflowY: 'auto', background: '#f8fafc', boxSizing: 'border-box' }}>
      
      {/* टॉप हेडर बार */}
      <div style={{ background: '#dc2626', color: '#fff', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#fff', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>HN</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Hello Nepal</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', fontSize: '14px', fontWeight: 'bold' }}>
          <span style={{ borderBottom: '2px solid #fff', paddingBottom: '2px' }}>राइड</span>
          <span>मार्केट</span>
          <span>केवाईसी</span>
          <span>एडमिन</span>
        </div>
      </div>

      {/* रूट स्टेटस बार */}
      <div style={{ background: '#fff', padding: '8px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>
        <span>📍 रूट: {pickup} ➔ {dropoff}</span>
      </div>

      {/* मैप कंटेनर */}
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '36vh', 
          zIndex: 1 
        }} 
      />

      {/* कंट्रोल पैनल */}
      <div style={{
        padding: '15px',
        background: '#ffffff',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        paddingBottom: '40px'
      }}>
        
        {/* वाहन चयन के 3 शानदार कार्ड (बाइक, ऑटो, कार/जीप) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div 
            onClick={() => { setVehicle('bike'); handleFindRoute(); }}
            style={{ flex: 1, padding: '10px 8px', background: vehicle === 'bike' ? '#fef2f2' : '#f8fafc', border: vehicle === 'bike' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '20px' }}>🏍️</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Hello Bike</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>तेज़ और किफायती</div>
          </div>

          <div 
            onClick={() => { setVehicle('auto'); handleFindRoute(); }}
            style={{ flex: 1, padding: '10px 8px', background: vehicle === 'auto' ? '#fef2f2' : '#f8fafc', border: vehicle === 'auto' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '20px' }}>🛺</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Hello Auto</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>परिवार के लिए सुरक्षित</div>
          </div>

          <div 
            onClick={() => { setVehicle('car'); handleFindRoute(); }}
            style={{ flex: 1, padding: '10px 8px', background: vehicle === 'car' ? '#fef2f2' : '#f8fafc', border: vehicle === 'car' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '20px' }}>🚙</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Hello Jeep/Car</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>आरामदायक सफर</div>
          </div>
        </div>

        {/* पिकअप इनपुट */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ से (Pickup):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            placeholder="जैसे: Bhairahawa, Butwal, Kathmandu..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* ड्रॉपऑफ इनपुट */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ जाना है (Dropoff):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            placeholder="जैसे: Kathmandu, Pokhara, Janakpur..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          onClick={handleFindRoute}
          style={{
            width: '100%',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '11px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          {loading ? 'सड़क रूट खोजा जा रहा है...' : '🔄 नया रूट और किराया रीफ्रेश करें'}
        </button>

        {/* दूरी और किराया डिटेल्स */}
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#334155' }}>
            <span>कुल अनुमानित दूरी:</span>
            <span style={{ fontWeight: 'bold' }}>{distanceKm} किमी</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#16a34a', fontWeight: 'bold' }}>
            <span>कुल किराया राशि:</span>
            <span>Rs. {totalFare} NPR</span>
          </div>
        </div>

        {/* बुकिंग / पेमेंट बटन */}
        {!bookingConfirmed ? (
          <button 
            onClick={() => setShowPaymentModal(true)}
            style={{
              width: '100%',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
            }}
          >
            💳 भुगतान करें और राइड बुक करें (Book Ride)
          </button>
        ) : (
          <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>✅ ड्राइवर कन्फर्म हो गया!</div>
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px' }}>Bishal Thapa (Lu 2 Pa 4590) - {dropoff} जाने के लिए 3 मिनट में आ रहा है।</div>
            <button 
              onClick={() => setBookingConfirmed(false)}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              नयी बुकिंग करें
            </button>
          </div>
        )}
      </div>

      {/* पेमेंट मॉडल / पॉपअप स्क्रीन */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>सुरक्षित भुगतान चुनें (Select Payment)</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>कुल देय राशि:</span>
              <span style={{ color: '#16a34a' }}>Rs. {totalFare} NPR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'esewa' ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                <span style={{ fontWeight: 'bold' }}>🟢 eSewa (डिजिटल वालेट)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'khalti' ? '2px solid #5d2e8c' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                <span style={{ fontWeight: 'bold' }}>🟣 Khalti Digital Wallet</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'nabil' ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'nabil'} onChange={() => setPaymentMethod('nabil')} />
                <span style={{ fontWeight: 'bold' }}>🔴 Nabil Bank / Mobile Banking</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'cash' ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span style={{ fontWeight: 'bold' }}>💵 Cash on Ride (ड्राइवर को नकद दें)</span>
              </label>
            </div>

            <button 
              onClick={handleConfirmPaymentAndBooking}
              style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              भुगतान पुष्टि करें और बुक करें
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
