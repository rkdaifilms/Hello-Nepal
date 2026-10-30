import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// आपका वेरीफाइड Mapbox Public Token यहाँ सेट है
mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // नेपाल सिद्धार्थनगर (भैरहवा) का डिफ़ॉल्ट सेंटर कोऑर्डिनेट
  const [lng, setLng] = useState(83.4481);
  const [lat, setLat] = useState(27.5042);
  const [zoom, setZoom] = useState(14);

  const [pickup, setPickup] = useState('भैरहवा, नेपाल');
  const [dropoff, setDropoff] = useState('भुजौली, नेपाल');
  const [routeInfo, setRouteInfo] = useState<string | null>(null);

  useEffect(() => {
    if (map.current) return; // मैप पहले से है तो दोबारा इनिशियलाइज न हो

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // एकदम क्लियर 3D पक्की सड़क वाला स्टाइल
        center: [lng, lat],
        zoom: zoom,
        pitch: 45, // 3D बिल्डिंग्स और व्यू के लिए टिल्ट
        bearing: -17.6,
      });

      // नेविगेशन ज़ूम कंट्रोल्स जोड़ें
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // यूजर की लोकेशन पर पिन लगाने के लिए
      new mapboxgl.Marker({ color: '#ff0000' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>आप यहाँ हैं</h3>'))
        .addTo(map.current);
    }
  }, [lng, lat, zoom]);

  // रूट खोजने का फंक्शन (Mapbox Directions API)
  const handleFindRoute = async () => {
    setRouteInfo('रास्ता खोजा जा रहा है...');
    
    // उदाहरण के लिए भैरहवा से भुजौली का कोऑर्डिनेट रूट
    const startLngLat = [83.4481, 27.5042];
    const endLngLat = [83.4700, 27.5200];

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const data = await query.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        setRouteInfo(`दूरी: ${distanceKm} किमी | समय: ${durationMin} मिनट`);

        // अगर मैप में पहले से रूट लेयर है तो हटा दें, वरना नई लाइन बनाएं
        if (map.current) {
          if (map.current.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            });
          } else {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
              },
            });
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6', // नीली चमकदार सड़क लाइन
                'line-width': 6,
              },
            });
          }

          // कैमरा फिट करें
          map.current.flyTo({
            center: [startLngLat[0], startLngLat[1]],
            zoom: 13,
          });
        }
      } else {
        setRouteInfo('रूट नहीं मिला।');
      }
    } catch (error) {
      setRouteInfo('कनेक्शन एरर आया है।');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* ऊपर सर्च और बुकिंग पैनल */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: '#ffffff',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', textAlign: 'center' }}>🚀 राइड नेविगेशन (Mapbox)</h3>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>कहाँ से (Pickup):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '3px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>कहाँ जाना है (Dropoff):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '3px' }}
          />
        </div>

        <button 
          onClick={handleFindRoute}
          style={{
            width: '100%',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          रास्ता खोजें (Find Route)
        </button>

        {routeInfo && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>
            {routeInfo}
          </div>
        )}
      </div>

      {/* मैप दिखने वाली स्क्रीन */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
