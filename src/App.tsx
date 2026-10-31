import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// तेरा Mapbox Access Token यहाँ सेट कर दिया है भाई
mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [pickup, setPickup] = useState('भैरहवा, नेपाल');
  const [dropoff, setDropoff] = useState('सुनौली, नेपाल');
  const [routeInfo, setRouteInfo] = useState('दूरी: 4.0 किमी | समय: 12 मिनट');

  useEffect(() => {
    if (map.current) return;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // यहाँ से काली स्क्रीन हट जाएगी और साफ रास्ता दिखेगा
        center: [83.4772, 27.5042], // भैरहवा, नेपाल का सटीक कोऑर्डिनेट
        zoom: 13
      });

      // मैप पर पिन जोड़ें
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([83.4772, 27.5042])
        .addTo(map.current);
    }
  }, []);

  const handleFindRoute = () => {
    setRouteInfo(`रूट अपडेटेड: ${pickup} से ${dropoff}`);
    if (map.current) {
      map.current.flyTo({
        center: [83.4772, 27.5042],
        zoom: 14
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* मैप दिखने वाली स्क्रीन (ऊपर का हिस्सा) */}
      <div 
        ref={mapContainer} 
        style={{ 
          position: 'absolute', 
          top: '0', 
          left: '0', 
          width: '100%', 
          height: '55vh', 
          zIndex: 1 
        }} 
      />

      {/* नीचे इनड्राइव (InDrive) जैसा शानदार बुकिंग पैनल */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '45vh',
        background: '#ffffff',
        padding: '20px 15px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -4px 25px rgba(0,0,0,0.15)',
        zIndex: 10,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 15px auto' }} />
        
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1e293b', textAlign: 'center' }}>🚗 अपनी राइड बुक करें</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>कहाँ से (Pickup):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>कहाँ जाना है (Dropoff):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          onClick={handleFindRoute}
          style={{
            width: '100%',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          रास्ता खोजें (Find Route)
        </button>

        {routeInfo && (
          <div style={{ marginTop: '12px', padding: '10px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
            📍 {routeInfo}
          </div>
        )}
      </div>

    </div>
  );
}
