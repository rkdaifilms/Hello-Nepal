import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [pickup, setPickup] = useState('भैरहवा, नेपाल');
  const [dropoff, setDropoff] = useState('Lumbini, Nepal');
  const [routeInfo, setRouteInfo] = useState('जगह लिखकर रास्ता खोजें दबाएं');

  useEffect(() => {
    if (map.current) return;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [83.4772, 27.5042],
        zoom: 12
      });

      map.current.on('load', () => {
        handleFindRoute();
      });
    }
  }, []);

  const handleFindRoute = async () => {
    if (!map.current) return;

    try {
      setRouteInfo('रास्ता खोजा जा रहा है...');

      const pickupQuery = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickup)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const pickupJson = await pickupQuery.json();
      if (!pickupJson.features || pickupJson.features.length === 0) {
        setRouteInfo('पिकअप लोकेशन नहीं मिली!');
        return;
      }
      const startCoord = pickupJson.features[0].center;

      const dropoffQuery = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoff)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const dropoffJson = await dropoffQuery.json();
      if (!dropoffJson.features || dropoffJson.features.length === 0) {
        setRouteInfo('ड्रॉपऑफ लोकेशन नहीं मिली!');
        return;
      }
      const endCoord = dropoffJson.features[0].center;

      const routeQuery = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const routeJson = await routeQuery.json();

      if (!routeJson.routes || routeJson.routes.length === 0) {
        setRouteInfo('रूट नहीं मिला!');
        return;
      }

      const data = routeJson.routes[0];
      const routeGeoJSON = data.geometry;

      const distanceKm = (data.distance / 1000).toFixed(1);
      const durationMin = Math.round(data.duration / 60);
      setRouteInfo(`दूरी: ${distanceKm} किमी | समय: ${durationMin} मिनट`);

      if (map.current.getSource('route')) {
        map.current.getSource('route').setData({
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
            'line-width': 6
          }
        });
      }

      new mapboxgl.Marker({ color: '#10b981' }).setLngLat(startCoord).addTo(map.current);
      new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(endCoord).addTo(map.current);

      const coordinates = routeGeoJSON.coordinates;
      const bounds = coordinates.reduce((b, coord) => {
        return b.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 60 });

    } catch (error) {
      console.error('Error:', error);
      setRouteInfo('कनेक्शन एरर आया है!');
    }
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
          height: '52vh', 
          zIndex: 1 
        }} 
      />

      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '48vh',
        background: '#ffffff',
        padding: '18px 15px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -4px 25px rgba(0,0,0,0.15)',
        zIndex: 10,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 12px auto' }} />
        
        <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#1e293b', textAlign: 'center' }}>🚗 नेपाल लाइव नेविगेशन</h3>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ से (Pickup):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '3px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ जाना है (Dropoff):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '3px', fontSize: '14px', boxSizing: 'border-box' }}
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
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          रास्ता खोजें (Find Route)
        </button>

        {routeInfo && (
          <div style={{ marginTop: '10px', padding: '9px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
            📍 {routeInfo}
          </div>
        )}
      </div>

    </div>
  );
}
