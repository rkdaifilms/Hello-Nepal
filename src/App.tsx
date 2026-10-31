import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg';

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const endMarker = useRef<mapboxgl.Marker | null>(null);

  const [pickup, setPickup] = useState<string>('भैरहवा, नेपाल');
  const [dropoff, setDropoff] = useState<string>('Lumbini, Nepal');
  const [vehicle, setVehicle] = useState<string>('bike'); // bike, auto, jeep
  const [routeInfo, setRouteInfo] = useState<string>('जगह का नाम लिखकर 'रास्ता खोजें' दबाएं');
  const [fareInfo, setFareInfo] = useState<string>('');

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
      setRouteInfo('सटीक जीपीएस रूट और लोकेशन खोजी जा रही है...');
      setFareInfo('');

      // 1. Pickup लोकेशन ढूंढें
      const pickupQuery = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickup)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const pickupJson = await pickupQuery.json();
      if (!pickupJson.features || pickupJson.features.length === 0) {
        setRouteInfo('पिकअप लोकेशन नहीं मिली! सही नाम लिखें।');
        return;
      }
      const startCoord = pickupJson.features[0].center;

      // 2. Dropoff लोकेशन ढूंढें
      const dropoffQuery = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoff)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const dropoffJson = await dropoffQuery.json();
      if (!dropoffJson.features || dropoffJson.features.length === 0) {
        setRouteInfo('ड्रॉपऑफ लोकेशन नहीं मिली! सही नाम लिखें।');
        return;
      }
      const endCoord = dropoffJson.features[0].center;

      // 3. नेविगेशन रूट निकालें
      const routeQuery = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const routeJson = await routeQuery.json();

      if (!routeJson.routes || routeJson.routes.length === 0) {
        setRouteInfo('रूट नहीं मिल पाया!');
        return;
      }

      const data = routeJson.routes[0];
      const routeGeoJSON = data.geometry;

      const distanceKm = (data.distance / 1000).toFixed(1);
      const durationMin = Math.round(data.duration / 60);
      
      setRouteInfo(`📍 दूरी: ${distanceKm} किमी | ⏱️ समय: ${durationMin} मिनट`);

      // 4. वाहन के हिसाब से किराया कैलकुलेट करें (नेपाली रुपयों में अनुमानित रेट)
      let baseRate = 50; // बेस फेर
      let perKmRate = 30;
      let vehicleName = 'बाइक (Bike)';

      if (vehicle === 'auto') {
        baseRate = 100;
        perKmRate = 50;
        vehicleName = 'ऑटो (Auto/E-Rickshaw)';
      } else if (vehicle === 'jeep') {
        baseRate = 200;
        perKmRate = 80;
        vehicleName = 'जीप/कार (Jeep/Car)';
      }

      const estimatedFare = Math.round(baseRate + (parseFloat(distanceKm) * perKmRate));
      setFareInfo(`🛺 वाहन: ${vehicleName} | 💵 अनुमानित किराया: रु. ${estimatedFare}`);

      // 5. मैप पर नीला रास्ता दिखाएं
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
            'line-width': 6
          }
        });
      }

      // मार्कर सेट करें
      if (startMarker.current) startMarker.current.remove();
      if (endMarker.current) endMarker.current.remove();

      startMarker.current = new mapboxgl.Marker({ color: '#10b981' }).setLngLat(startCoord).addTo(map.current);
      endMarker.current = new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(endCoord).addTo(map.current);

      // मैप को रूट पर फिट करें
      const coordinates = routeGeoJSON.coordinates;
      const bounds = coordinates.reduce((b: mapboxgl.LngLatBounds, coord: [number, number]) => {
        return b.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 70 });

    } catch (error) {
      console.error('Error:', error);
      setRouteInfo('नेटवर्क एरर आया है!');
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
          height: '46vh', 
          zIndex: 1 
        }} 
      />

      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '54vh',
        background: '#ffffff',
        padding: '15px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -4px 25px rgba(0,0,0,0.2)',
        zIndex: 10,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 10px auto' }} />
        
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b', textAlign: 'center' }}>🚖 भैरहवा राइड बुकिंग & GPS</h3>
        
        {/* वाहन चुनने का ऑप्शन (Bike, Auto, Jeep) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button 
            onClick={() => setVehicle('bike')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'bike' ? '#2563eb' : '#f1f5f9', color: vehicle === 'bike' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🏍️ बाइक
          </button>
          <button 
            onClick={() => setVehicle('auto')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'auto' ? '#2563eb' : '#f1f5f9', color: vehicle === 'auto' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🛺 ऑटो
          </button>
          <button 
            onClick={() => setVehicle('jeep')}
            style={{ flex: 1, padding: '8px', background: vehicle === 'jeep' ? '#2563eb' : '#f1f5f9', color: vehicle === 'jeep' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            🚙 जीप/कार
          </button>
        </div>

        <div style={{ marginBottom: '6px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ से (Pickup):</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)} 
            placeholder="पिकअप जगह..."
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>कहाँ जाना है (Dropoff):</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)} 
            placeholder="ड्रॉपऑफ जगह..."
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '2px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          onClick={handleFindRoute}
          style={{
            width: '100%',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
          }}
        >
          रास्ता और किराया खोजें (Find Route)
        </button>

        {routeInfo && (
          <div style={{ marginTop: '8px', padding: '8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            {routeInfo}
          </div>
        )}

        {fareInfo && (
          <div style={{ marginTop: '5px', padding: '8px', background: '#f0fdf4', color: '#15803d', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
            {fareInfo}
          </div>
        )}
      </div>
    </div>
  );
}
