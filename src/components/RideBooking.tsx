import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RideBooking() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [pickup, setPickup] = useState<string>('Bairahawa');
  const [dropoff, setDropoff] = useState<string>('Butwal');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, car
  const [routeInfo, setRouteInfo] = useState<string>('रूट खोजा जा रहा है...');
  const [distanceKm, setDistanceKm] = useState<number>(22.5);
  const [totalFare, setTotalFare] = useState<number>(650);
  const [loading, setLoading] = useState<boolean>(false);

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
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

    const map = L.map(mapContainer.current).setView([27.5042, 83.4485], 11);
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
    setRouteInfo('🛣️ सड़क का रूट लोड हो रहा है...');
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
        setRouteInfo(`📍 दूरी: ${distKmVal} किमी | ⏱️ समय: ${durMin} मिनट`);

        const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        const polyline = L.polyline(coords, { color: '#dc2626', weight: 5, opacity: 0.8 });

        currentLayer.addLayer(polyline);
        currentMap.fitBounds(polyline.getBounds(), { padding: [30, 30] });

        updateFare(distKmVal);
      } else {
        drawRealisticHighwayRoute(startCoords, endCoords, currentMap, currentLayer);
      }
    } catch (e) {
      drawRealisticHighwayRoute(startCoords, endCoords, currentMap, currentLayer);
    }

    setLoading(false);
  };

  const drawRealisticHighwayRoute = (start: [number, number], end: [number, number], map: L.Map, layer: L.LayerGroup) => {
    const highwayLatLon: [number, number][] = [
      [start[1], start[0]],
      [27.5250, 83.4500],
      [27.5800, 83.4650],
      [end[1], end[0]]
    ];
    const polyline = L.polyline(highwayLatLon, { color: '#dc2626', weight: 5, opacity: 0.8 });
    layer.addLayer(polyline);
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    
    setDistanceKm(22.5);
    setRouteInfo(`📍 दूरी: 22.5 किमी (सिद्धार्थ हाइवे) | ⏱️ समय: 35 मिनट`);
    updateFare(22.5);
  };

  const updateFare = (dist: number) => {
    let baseFare = 60;
    let perKm = 25;
    if (vehicle === 'auto') {
      baseFare = 120;
      perKm = 45;
    } else if (vehicle === 'car') {
      baseFare = 250;
      perKm = 80;
    }
    setTotalFare(Math.round(baseFare + (dist * perKm)));
  };

  const handleConfirmBooking = () => {
    setShowPaymentModal(false);
    setBookingConfirmed(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* ऊपर पिकअप और ड्रॉपऑफ सर्च बॉक्स */}
      <div style={{ background: '#ffffff', padding: '10px 12px', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>🟢 पिकअप स्थान (Pickup):</label>
            <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>🔴 ड्रॉपऑफ स्थान (Drop):</label>
            <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button onClick={handleFindRoute} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'रूट खोजा जा रहा है...' : '🔄 राउट और किराया खोजें (Search Route)'}
        </button>
      </div>

      {/* छोटा मैप ताकि पूरा इंटरफेस और जीपीएस रोड साफ दिखे */}
      <div ref={mapContainer} style={{ width: '100%', height: '170px', flexShrink: 0, zIndex: 1, borderBottom: '1px solid #e2e8f0' }} />

      {/* नीचे वाहन चयन, दूरी, किराया और बुकिंग पैनल */}
      <div style={{ padding: '12px', background: '#ffffff', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* वाहन के विकल्प (बाइक, ऑटो, जीप) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div 
            onClick={() => { setVehicle('bike'); updateFare(distanceKm); }} 
            style={{ flex: 1, padding: '8px 4px', background: vehicle === 'bike' ? '#fef2f2' : '#f8fafc', border: vehicle === 'bike' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '16px' }}>🏍️</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Hello Bike</div>
          </div>

          <div 
            onClick={() => { setVehicle('auto'); updateFare(distanceKm); }} 
            style={{ flex: 1, padding: '8px 4px', background: vehicle === 'auto' ? '#fef2f2' : '#f8fafc', border: vehicle === 'auto' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '16px' }}>🛺</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Hello Auto</div>
          </div>

          <div 
            onClick={() => { setVehicle('car'); updateFare(distanceKm); }} 
            style={{ flex: 1, padding: '8px 4px', background: vehicle === 'car' ? '#fef2f2' : '#f8fafc', border: vehicle === 'car' ? '2px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '16px' }}>🚙</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Hello Jeep</div>
          </div>
        </div>

        {/* रूट की जानकारी और कुल किराया */}
        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
          <div style={{ color: '#334155', marginBottom: '2px' }}>{routeInfo}</div>
          <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>कुल किराया ({vehicle.toUpperCase()}):</span>
            <span>Rs. {totalFare} NPR</span>
          </div>
        </div>

        {/* बुकिंग बटन */}
        {!bookingConfirmed ? (
          <button onClick={() => setShowPaymentModal(true)} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
            🚗 {vehicle === 'bike' ? 'Hello Bike' : vehicle === 'auto' ? 'Hello Auto' : 'Hello Jeep'} बुक करें →
          </button>
        ) : (
          <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ color: '#15803d', fontWeight: 'bold', marginBottom: '2px' }}>✅ राइड बुक हो गई! ड्राइवर आ रहा है।</div>
            <div style={{ color: '#1e293b', marginBottom: '4px' }}><b>{assignedDriver.name}</b> ({assignedDriver.vehicleNo}) - मो: {assignedDriver.phone}</div>
            <button onClick={() => setBookingConfirmed(false)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              नयी बुकिंग करें
            </button>
          </div>
        )}

      </div>

      {/* पेमेंट और पेआउट सिस्टम मॉडल */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '15px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>भुगतान (Payment) का तरीका चुनें</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>कुल राशि:</span>
              <span style={{ color: '#16a34a' }}>Rs. {totalFare} NPR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'cash' ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span style={{ fontWeight: 'bold' }}>💵 नकद भुगतान (Cash on Ride)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'esewa' ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                <span style={{ fontWeight: 'bold' }}>🟢 eSewa (डिजिटल वालेट पेआउट)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'khalti' ? '2px solid #5d2e8c' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                <span style={{ fontWeight: 'bold' }}>🟣 Khalti Wallet</span>
              </label>
            </div>

            <button onClick={handleConfirmBooking} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              राइड कन्फर्म करें
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
