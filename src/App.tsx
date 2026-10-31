import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [pickup, setPickup] = useState('भैरहवा, नेपाल');
  const [dropoff, setDropoff] = useState('सुनौली, नेपाल');
  const [routeInfo, setRouteInfo] = useState('रूट देखने के लिए नीचे बटन दबाएं');

  useEffect(() => {
    if (map.current) return;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [83.4772, 27.5042],
        zoom: 13
      });

      map.current.on('load', () => {
        drawRoute([83.4772, 27.5042], [83.4550, 27.4710]);
      });
    }
  }, []);

  const drawRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      
      if (!json.routes || json.routes.length === 0) return;

      const data = json.routes[0];
      const routeGeoJSON = data.geometry;

      const distanceKm = (data.distance / 1000).toFixed(1);
      const durationMin = Math.round(data.duration / 60);
      setRouteInfo(`दूरी: ${distanceKm} किमी | समय: ${durationMin} मिनट`);

      if (map.current.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: routeGeoJSON
        });
      } else {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeoJSON
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2563eb',
            'line-width': 5
          }
        });
      }

      new mapboxgl.Marker({ color: '#10b981' }).setLngLat(start).addTo(map.current);
      new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(end).addTo(map.current);

    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleFindRoute = () => {
    drawRoute([83.4772, 27.5042], [83.4550, 27.4710]);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
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
        
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1e293b', textAlign: 'center' }}>🚗 लाइव नेविगेशन और रूट</h3>
        
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
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          रास्ता खोजें (Find Route)
        </button>

        {routeInfo && (
          <div style={{ marginTop: '12px', padding: '10px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
            📍 {routeInfo}
          </div>
        )}
      </div>

    </div>
  );
}
