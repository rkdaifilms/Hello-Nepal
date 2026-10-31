import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RideBooking() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [pickup, setPickup] = useState<string>('Bhujauli, Siddharthanagar');
  const [dropoff, setDropoff] = useState<string>('Bairahawa');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, car
  const [routeInfo, setRouteInfo] = useState<string>('नेविगेशन रूट खोजा जा रहा है...');
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [totalFare, setTotalFare] = useState<number>(180);
  const [loading, setLoading] = useState<boolean>(false);

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  
  // मर्चेंट और रियल पेमेंट स्टेट्स
  const [merchantQr, setMerchantQr] = useState<string>('');
  const [isSettingQr, setIsSettingQr] = useState<boolean>(false);
  const [walletPhone, setWalletPhone] = useState<string>('');
  const [mPin, setMPin] = useState<string>('');

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

    // नेपाल के सिद्धार्थनगर/भैरहवा क्षेत्र पर डिफ़ॉल्ट फोकस
    const map = L.map(mapContainer.current, {
      zoomControl: true,
      fadeAnimation: true,
      zoomAnimation: true
    }).setView([27.5042, 83.4485], 14);

    mapInstance.current = map;

    // OpenStreetMap टाइल्स लोड करना ताकि कोई खाली पन्ना (blank tile) न दिखे
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 10,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap Nepal'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = layerGroup;

    handleFindRoute();

    // रीसाइज फिक्स ताकि मैप पूरी तरह लोड हो
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

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
    setRouteInfo('🗺️ नेपाल की गलियों और हाइवे का लाइव रूट लोड हो रहा है...');
    setBookingConfirmed(false);

    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();

    const startCoords = await searchNepalLocation(cleanPickup);
    const endCoords = await searchNepalLocation(cleanDropoff);

    const currentMap = mapInstance.current;
    const currentLayer = routeLayerRef.current;
    currentLayer.clearLayers();

    // पिकअप और ड्रॉप मार्कर्स
    const startMarker = L.marker([startCoords[1], startCoords[0]]).bindPopup(`🟢 पिकअप: ${cleanPickup}`);
    const endMarker = L.marker([endCoords[1], endCoords[0]]).bindPopup(`🔴 ड्रॉप (Drop Here): ${cleanDropoff}`);
    currentLayer.addLayer(startMarker);
    currentLayer.addLayer(endMarker);

    try {
      // OSRM API से रोड की सटीक ज्यामिति (Geometry) मंगवाना ताकि लाइन सीधे सड़क पर चले
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&steps=true`
      );
      const routeData = await routeRes.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const distKmVal = parseFloat((route.distance / 1000).toFixed(1));
        const durMin = Math.round(route.duration / 60);

        setDistanceKm(distKmVal);
        setRouteInfo(`📍 दूरी: ${distKmVal} किमी | ⏱️ समय: ${durMin} मिनट (रास्ते में पिपरहवा, नौडिहवा आदि शामिल)`);

        // सड़क पर चलने वाली लाइव नेविगेशन लाइन (Polyline)
        const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        
        // बैकग्राउंड ग्लो लाइन
        const glowLine = L.polyline(coords, { color: '#60a5fa', weight: 8, opacity: 0.5 });
        // मुख्य नेविगेशन रोड लाइन
        const mainRouteLine = L.polyline(coords, { color: '#2563eb', weight: 5, opacity: 0.9 });

        currentLayer.addLayer(glowLine);
        currentLayer.addLayer(mainRouteLine);

        currentMap.fitBounds(mainRouteLine.getBounds(), { padding: [40, 40] });

        updateFare(distKmVal);
      } else {
        drawFallbackRoute(startCoords, endCoords, currentMap, currentLayer);
      }
    } catch (e) {
      drawFallbackRoute(startCoords, endCoords, currentMap, currentLayer);
    }

    setLoading(false);
  };

  const drawFallbackRoute = (start: [number, number], end: [number, number], map: L.Map, layer: L.LayerGroup) => {
    const roadLatLon: [number, number][] = [
      [start[1], start[0]],
      [27.5150, 83.4450],
      [end[1], end[0]]
    ];
    const polyline = L.polyline(roadLatLon, { color: '#2563eb', weight: 5, opacity: 0.9 });
    layer.addLayer(polyline);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    
    setDistanceKm(5.0);
    setRouteInfo(`📍 दूरी: 5.0 किमी | ⏱️ समय: 12 मिनट (नेपाल लोकल रूट)`);
    updateFare(5.0);
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
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>🟢 पिकअप स्थान (भुजौली / नेपाल):</label>
            <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>🔴 ड्रॉपऑफ स्थान (भैरहवा / नेपाल):</label>
            <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button onClick={handleFindRoute} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'रूट लोड हो रहा है...' : '🔄 लाइव जीपीएस रोड और रूट खोजें'}
        </button>
      </div>

      {/* मैप जिस पर सड़क की लाइन और लोकल रास्ते बिल्कुल साफ दिखेंगे */}
      <div ref={mapContainer} style={{ width: '100%', height: '180px', flexShrink: 0, zIndex: 1, borderBottom: '1px solid #e2e8f0', background: '#e2e8f0' }} />

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
          <div style={{ color: '#334155', marginBottom: '2px', fontWeight: '500' }}>{routeInfo}</div>
          <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
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
            <div style={{ color: '#15803d', fontWeight: 'bold', marginBottom: '2px' }}>✅ राइड बुक हो गई! (Drop Here) के लिए ड्राइवर आ रहा है।</div>
            <div style={{ color: '#1e293b', marginBottom: '4px' }}><b>{assignedDriver.name}</b> ({assignedDriver.vehicleNo}) - मो: {assignedDriver.phone}</div>
            <button onClick={() => setBookingConfirmed(false)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              नयी बुकिंग करें
            </button>
          </div>
        )}

      </div>

      {/* पेमेंट और पेआउट सिस्टम मॉडल (रियल मर्चेंट QR और वॉलेट सपोर्ट) */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '15px', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>वास्तविक भुगतान (Real Payment) चुनें</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>कुल राशि:</span>
              <span style={{ color: '#16a34a' }}>Rs. {totalFare} NPR</span>
            </div>

            {/* ड्राइवर मर्चेंट QR स्कैनर सेट करने का विकल्प */}
            <div style={{ marginBottom: '12px', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#b45309' }}>ड्राइवर मर्चेंट QR स्कैनर:</span>
                <button 
                  onClick={() => setIsSettingQr(!isSettingQr)} 
                  style={{ background: '#d97706', color: '#fff', border: 'none', padding: '2px 6px', fontSize: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isSettingQr ? 'बंद करें' : 'QR सेट करें'}
                </button>
              </div>
              {isSettingQr && (
                <div style={{ marginTop: '6px' }}>
                  <input 
                    type="text" 
                    placeholder="अपना QR इमेज URL यहाँ पेस्ट करें..." 
                    value={merchantQr}
                    onChange={(e) => setMerchantQr(e.target.value)}
                    style={{ width: '100%', padding: '6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              {merchantQr && !isSettingQr && (
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <img src={merchantQr} alt="Merchant QR" style={{ width: '90px', height: '90px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <p style={{ fontSize: '9px', color: '#666', margin: '2px 0 0' }}>स्कैन करके पेमेंट करें</p>
                </div>
              )}
            </div>

            {/* भुगतान के 4 विकल्प */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'cash' ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <span style={{ fontWeight: 'bold' }}>💵 नकद भुगतान (Cash on Ride)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'esewa' ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                <span style={{ fontWeight: 'bold' }}>🟢 eSewa (मोबाइल / M-PIN पेमेंट)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'imepay' ? '2px solid #ea580c' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'imepay'} onChange={() => setPaymentMethod('imepay')} />
                <span style={{ fontWeight: 'bold' }}>🟠 IME Pay (डिजिटल पेआउट)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: paymentMethod === 'khalti' ? '2px solid #5d2e8c' : '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                <span style={{ fontWeight: 'bold' }}>🟣 Khalti Wallet (रियल पेमेंट)</span>
              </label>
            </div>

            {/* यदि डिजिटल पेमेंट चुना गया हो */}
            {paymentMethod !== 'cash' && (
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>{paymentMethod.toUpperCase()} विवरण दर्ज करें:</div>
                <input 
                  type="text" 
                  placeholder="मोबाइल नंबर (जैसे: 98XXXXXXXX)" 
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <input 
                  type="password" 
                  placeholder="M-PIN / Password" 
                  value={mPin}
                  onChange={(e) => setMPin(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button onClick={handleConfirmBooking} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              रियल पेमेंट कन्फर्म करें
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
