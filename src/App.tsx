import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [pickup, setPickup] = useState<string>('Bairahawa');
  const [dropoff, setDropoff] = useState<string>('Butwal');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, car
  const [routeInfo, setRouteInfo] = useState<string>('सड़क का सटीक रूट खोजा जा रहा है...');
  const [distanceKm, setDistanceKm] = useState<number>(21.1);
  const [totalFare, setTotalFare] = useState<number>(628);
  const [loading, setLoading] = useState<boolean>(false);

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash'); // डिफ़ॉल्ट कैश ऑन राइड
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [assignedDriver] = useState({
    name: 'Bishal Thapa',
    phone: '+977-9847000000',
    vehicleNo: 'Lu 2 Pa 4590',
    eta: '3 मिनट'
  });

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
    return [83.4485, 27.5042];
  };

  const handleFindRoute = async () => {
    if (!mapInstance.current || !routeLayerRef.current) return;

    setLoading(true);
    setRouteInfo('🛣️ सड़क के मोड़ के अनुसार रूट लोड हो रहा है...');
    setBookingConfirmed(false);

    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();

    const startCoords = await searchNepalLocation(cleanPickup);
    const endCoords = await searchNepalLocation(cleanDropoff);

    const currentMap = mapInstance.current;
    const currentLayer = routeLayerRef.current;
    currentLayer.clearLayers();

    const startMarker = L.marker([startCoords[1], startCoords[0]]).bindPopup(`पिकअप: ${cleanPickup}`);
    const endMarker = L.marker([endCoords[1], endCoords[0]]).bindPopup(`ड्रॉप: ${cleanDropoff}`);
    currentLayer.addLayer(startMarker);
    currentLayer.addLayer(endMarker);

    try {
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
      );
      const routeData = await routeRes.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const distKmVal = parseFloat((route.distance / 1000).toFixed(1));
        const durMin = Math.round(route.duration / 60);

        setDistanceKm(distKmVal);
        setRouteInfo(`📍 कुल दूरी: ${distKmVal} किमी | ⏱️ समय: ${durMin} मिनट`);

        const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        const polyline = L.polyline(coords, { color: '#16a34a', weight: 6, opacity: 0.8 });

        currentLayer.addLayer(polyline);
        currentMap.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // वाहन के अनुसार किराया कैलकुलेशन
        let baseFare = 60;
        let perKm = 25;
        if (vehicle === 'auto') {
          baseFare = 120;
          perKm = 45;
        } else if (vehicle === 'car') {
          baseFare = 250;
          perKm = 80;
        }

        setTotalFare(Math.round(baseFare + (distKmVal * perKm)));
      } else {
        drawFallbackRoute(startCoords, endCoords, currentMap, currentLayer);
      }
    } catch (e) {
      drawFallbackRoute(startCoords, endCoords, currentMap, currentLayer);
    }

    setLoading(false);
  };

  const drawFallbackRoute = (start: [number, number], end: [number, number], map: L.Map, layer: L.LayerGroup) => {
    const latlngs: [number, number][] = [
      [start[1], start[0]],
      [(start[1] + end[1]) / 2 + 0.01, (start[0] + end[0]) / 2 + 0.01],
      [end[1], end[0]]
    ];
    const polyline = L.polyline(latlngs, { color: '#16a34a', weight: 6, opacity: 0.8 });
    layer.addLayer(polyline);
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    setDistanceKm(21.1);
    setRouteInfo(`📍 कुल दूरी: 21.1 किमी | ⏱️ समय: 35 मिनट`);
    
    let baseFare = 60;
    let perKm = 25;
    if (vehicle === 'auto') { baseFare = 120; perKm = 45; }
    else if (vehicle === 'car') { baseFare = 250; perKm = 80; }
    setTotalFare(Math.round(baseFare + (21.1 * perKm)));
  };

  const handleConfirmBooking = () => {
    setShowPaymentModal(false);
    setBookingConfirmed(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflowY: 'auto', background: '#f8fafc', boxSizing: 'border-box' }}>
      
      {/* टॉप हेडर */}
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
      <div style={{ background: '#fff', padding: '8px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>
        <span>📍 रूट: {pickup} ➔ {dropoff}</span>
      </div>

      {/* मैप */}
      <div ref={mapContainer} style={{ width: '100%', height: '32vh', zIndex: 1 }} />

      {/* कंट्रोल पैनल */}
      <div style={{ padding: '15px', background: '#ffffff', borderTopLeftRadius: '22px', borderTopRightRadius: '22px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', boxSizing: 'border-box', paddingBottom: '40px' }}>
        
        {/* वाहन चयन के 3 स्पष्ट विकल्प: बाइक, ऑटो और जीप/कार */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div 
            onClick={() => { setVehicle('bike'); handleFindRoute(); }} 
            style={{ flex: 1, padding: '10px 4px', background: vehicle === 'bike' ? '#fef2f2' : '#f8fafc', border: vehicle === 'bike' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '18px' }}>🏍️</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>Hello Bike</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>किफायती</div>
          </div>

          <div 
            onClick={() => { setVehicle('auto'); handleFindRoute(); }} 
            style={{ flex: 1, padding: '10px 4px', background: vehicle === 'auto' ? '#fef2f2' : '#f8fafc', border: vehicle === 'auto' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '18px' }}>🛺</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>Hello Auto</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>सुरक्षित</div>
          </div>

          <div 
            onClick={() => { setVehicle('car'); handleFindRoute(); }} 
            style={{ flex: 1, padding: '10px 4px', background: vehicle === 'car' ? '#fef2f2' : '#f8fafc', border: vehicle === 'car' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '18px' }}>🚙</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>Hello Jeep</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>आरामदायक</div>
          </div>
        </div>

        {/* पिकअप इनपुट */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>🟢 कहाँ से (Pickup):</label>
          <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Bairahawa..." style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        {/* ड्रॉपऑफ इनपुट */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>🔴 कहाँ जाना है (Dropoff):</label>
          <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Butwal..." style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleFindRoute} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
          {loading ? 'रूट खोजा जा रहा है...' : '🔄 सड़क रूट और किराया रीफ्रेश करें'}
        </button>

        {/* दूरी और किराया */}
        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#334155' }}>
            <span>{routeInfo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a', fontWeight: 'bold' }}>
            <span>कुल किराया राशि ({vehicle.toUpperCase()}):</span>
            <span>Rs. {totalFare} NPR</span>
          </div>
        </div>

        {/* बुकिंग बटन */}
        {!bookingConfirmed ? (
          <button onClick={() => setShowPaymentModal(true)} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            🚗 {vehicle === 'bike' ? 'Hello Bike' : vehicle === 'auto' ? 'Hello Auto' : 'Hello Jeep'} बुक करें →
          </button>
        ) : (
          <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
            <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>✅ राइड बुक हो गई! ड्राइवर आ रहा है।</div>
            <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px' }}>
              <b>{assignedDriver.name}</b> ({assignedDriver.vehicleNo}) - मो: {assignedDriver.phone}<br/>
              {dropoff} जाने के लिए {assignedDriver.eta} में आपके पास पहुंच रहा है।
            </div>
            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold', marginBottom: '8px' }}>
              💰 भुगतान का तरीका: {paymentMethod === 'cash' ? 'यात्रा के बाद ड्राइवर को नकद (Cash) दें' : paymentMethod.toUpperCase() + ' (ऑनलाइन)'}
            </div>
            <button onClick={() => setBookingConfirmed(false)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              रद्द करें / नयी बुकिंग करें
            </button>
          </div>
        )}
      </div>

      {/* पेमेंट और बुकिंग पॉपअप */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b' }}>भुगतान का तरीका चुनें (Payment Option)</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
              <span>कुल देय किराया ({vehicle.toUpperCase()}):</span>
              <span style={{ color: '#16a34a' }}>Rs. {totalFare} NPR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'cash' ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>💵 यात्रा के बाद ड्राइवर को नकद दें (Cash on Ride)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'esewa' ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🟢 eSewa (डिजिटल वालेट)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'khalti' ? '2px solid #5d2e8c' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🟣 Khalti Digital Wallet</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: paymentMethod === 'nabil' ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'nabil'} onChange={() => setPaymentMethod('nabil')} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🔴 Nabil Bank / Mobile Banking</span>
              </label>
            </div>

            <button onClick={handleConfirmBooking} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              राइड कन्फर्म करें और ड्राइवर को बुलाएं
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
