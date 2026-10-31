import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLng = [number, number]; // [lat, lon]
type Vehicle = 'bike' | 'auto' | 'jeep';
type Pay = 'cash' | 'esewa' | 'khalti' | 'nabil';
interface Place { name: string; pos: LatLng | null }

const RATES: Record<Vehicle, { label: string; base: number; perKm: number; perMin: number; min: number; icon: string }> = {
  bike: { label: 'Hello Bike', base: 30, perKm: 18, perMin: 1, min: 60, icon: '🏍️' },
  auto: { label: 'Hello Auto', base: 50, perKm: 30, perMin: 1.5, min: 100, icon: '🛺' },
  jeep: { label: 'Hello Jeep', base: 80, perKm: 45, perMin: 2, min: 150, icon: '🚙' },
};

const dot = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
const emojiIcon = (e: string) =>
  L.divIcon({ className: '', html: `<div style="font-size:26px;line-height:26px">${e}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });

// ---------- सर्विसेज़ ----------
async function searchPlaces(q: string): Promise<Place[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=np&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'hi,ne,en' } });
  const data = await res.json();
  return data.map((d: any) => ({ name: d.display_name as string, pos: [parseFloat(d.lat), parseFloat(d.lon)] as LatLng }));
}

async function reverseGeocode(pos: LatLng): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`;
    const d = await (await fetch(url, { headers: { 'Accept-Language': 'hi,ne,en' } })).json();
    return (d.display_name as string) || 'मेरी लोकेशन';
  } catch {
    return 'मेरी लोकेशन';
  }
}

async function fetchRoute(a: LatLng, b: LatLng) {
  // OSRM (असली सड़क रूट)। प्रोडक्शन में अपना OSRM / OpenRouteService / Mapbox सर्वर लगाएँ।
  const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
  const data = await (await fetch(url)).json();
  if (!data.routes?.length) throw new Error('रूट नहीं मिला');
  const r = data.routes[0];
  return {
    coords: (r.geometry.coordinates as [number, number][]).map(([lon, lat]) => [lat, lon] as LatLng),
    km: r.distance / 1000,
    min: Math.max(1, Math.round(r.duration / 60)),
  };
}

// TODO: eSewa / Khalti / Nabil का असली पेमेंट सिर्फ़ सर्वर (Supabase Edge Function) से करें।
// सीक्रेट की ऐप कोड में कभी न डालें।
async function startOnlinePayment(_method: Pay, _amount: number): Promise<'pending'> {
  return 'pending';
}

export default function RideBooking() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<{ pickup?: L.Marker; drop?: L.Marker; me?: L.Marker; driver?: L.Marker }>({});
  const debounce = useRef<number | undefined>(undefined);
  const driverTimer = useRef<number | undefined>(undefined);
  const firstFix = useRef(true);

  const [pickup, setPickup] = useState<Place>({ name: '', pos: null });
  const [dropoff, setDropoff] = useState<Place>({ name: '', pos: null });
  const [suggest, setSuggest] = useState<{ field: 'pickup' | 'drop'; items: Place[] } | null>(null);
  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle>('auto');
  const [km, setKm] = useState(0);
  const [mins, setMins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState<Pay>('cash');
  const [booked, setBooked] = useState(false);
  const [driverEta, setDriverEta] = useState(0);

  const fare = useMemo(() => {
    if (!km) return 0;
    const r = RATES[vehicle];
    const raw = Math.max(r.min, r.base + r.perKm * km + r.perMin * mins);
    return Math.round(raw / 5) * 5;
  }, [km, mins, vehicle]);

  // ---------- मैप बनाना (सिर्फ़ एक बार) ----------
  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = L.map(mapDiv.current, { zoomControl: false }).setView([27.5, 83.45], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    routeLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      window.clearInterval(driverTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---------- लाइव GPS ----------
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setMyPos([p.coords.latitude, p.coords.longitude]),
      () => setError('GPS चालू करें / लोकेशन की अनुमति दें'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !myPos) return;
    if (!markers.current.me) markers.current.me = L.marker(myPos, { icon: dot('#2563eb'), zIndexOffset: 1000 }).addTo(map);
    else markers.current.me.setLatLng(myPos);

    if (firstFix.current) {
      firstFix.current = false;
      map.setView(myPos, 15);
      reverseGeocode(myPos).then((name) => setPickup((p) => (p.pos ? p : { name, pos: myPos })));
    }
  }, [myPos]);

  // ---------- पिकअप / ड्रॉप मार्कर ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sync = (key: 'pickup' | 'drop', place: Place, color: string) => {
      const m = markers.current[key];
      if (!place.pos) { if (m) { m.remove(); markers.current[key] = undefined; } return; }
      if (!m) markers.current[key] = L.marker(place.pos, { icon: dot(color) }).addTo(map);
      else m.setLatLng(place.pos);
    };
    sync('pickup', pickup, '#16a34a');
    sync('drop', dropoff, '#dc2626');
  }, [pickup, dropoff]);

  // ---------- रूट (दोनों लोकेशन मिलते ही अपने-आप) ----------
  const findRoute = async () => {
    const map = mapRef.current;
    if (!map || !pickup.pos || !dropoff.pos) { setError('पिकअप और ड्रॉप दोनों चुनें'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetchRoute(pickup.pos, dropoff.pos);
      routeLayer.current?.clearLayers();
      L.polyline(r.coords, { color: '#fff', weight: 10, opacity: 1 }).addTo(routeLayer.current!);
      const line = L.polyline(r.coords, { color: '#2563eb', weight: 6, opacity: 0.95 }).addTo(routeLayer.current!);
      map.fitBounds(line.getBounds(), { padding: [60, 60] });
      setKm(r.km); setMins(r.min);
    } catch (e: any) {
      setKm(0); setMins(0);
      setError(e.message || 'रूट लोड नहीं हुआ, इंटरनेट जाँचें');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pickup.pos && dropoff.pos) findRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup.pos, dropoff.pos]);

  // ---------- टाइप करते समय suggestions ----------
  const onType = (field: 'pickup' | 'drop', value: string) => {
    (field === 'pickup' ? setPickup : setDropoff)({ name: value, pos: null });
    window.clearTimeout(debounce.current);
    if (value.trim().length < 3) { setSuggest(null); return; }
    debounce.current = window.setTimeout(async () => {
      try { setSuggest({ field, items: await searchPlaces(value) }); } catch { setSuggest(null); }
    }, 600); // Nominatim नियम: ~1 रिक्वेस्ट/सेकंड
  };

  const choose = (field: 'pickup' | 'drop', p: Place) => {
    (field === 'pickup' ? setPickup : setDropoff)(p);
    setSuggest(null);
    if (p.pos) mapRef.current?.setView(p.pos, 15);
  };

  const useMyLocation = async () => {
    if (!myPos) { setError('GPS लोकेशन अभी नहीं मिली'); return; }
    choose('pickup', { name: await reverseGeocode(myPos), pos: myPos });
  };

  // ---------- बुकिंग ----------
  const confirmBooking = async () => {
    if (!pickup.pos || !dropoff.pos || !fare) return;
    let payStatus: 'cash' | 'pending' = 'cash';
    if (payMethod !== 'cash') payStatus = await startOnlinePayment(payMethod, fare);
    // TODO: यहाँ Supabase 'rides' टेबल में insert करें (pickup, drop, vehicle, fare, payMethod, payStatus)
    void payStatus;
    setShowPay(false);
    setBooked(true);
    startDriverDemo(pickup.pos);
  };

  // डेमो ड्राइवर: असली में Supabase Realtime से ड्राइवर की लोकेशन आएगी
  const startDriverDemo = (target: LatLng) => {
    const map = mapRef.current;
    if (!map) return;
    window.clearInterval(driverTimer.current);
    let cur: LatLng = [target[0] + 0.01, target[1] + 0.01];
    markers.current.driver?.remove();
    markers.current.driver = L.marker(cur, { icon: emojiIcon(RATES[vehicle].icon), zIndexOffset: 900 }).addTo(map);
    driverTimer.current = window.setInterval(() => {
      cur = [cur[0] + (target[0] - cur[0]) * 0.15, cur[1] + (target[1] - cur[1]) * 0.15];
      markers.current.driver?.setLatLng(cur);
      const distKm = map.distance(cur, target) / 1000;
      setDriverEta(Math.max(1, Math.round((distKm / 25) * 60)));
      if (distKm < 0.03) window.clearInterval(driverTimer.current);
    }, 1000);
  };

  const cancelBooking = () => {
    window.clearInterval(driverTimer.current);
    markers.current.driver?.remove();
    markers.current.driver = undefined;
    setBooked(false);
  };

  // ---------- UI ----------
  const input: React.CSSProperties = { width: '100%', padding: 9, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 2, fontSize: 14, boxSizing: 'border-box' };
  const label: React.CSSProperties = { fontSize: 11, color: '#64748b', fontWeight: 'bold' };
  const payOptions: { id: Pay; text: string; color: string }[] = [
    { id: 'cash', text: '💵 यात्रा के बाद ड्राइवर को नकद दें', color: '#2563eb' },
    { id: 'esewa', text: '🟢 eSewa (डिजिटल वालेट)', color: '#16a34a' },
    { id: 'khalti', text: '🟣 Khalti Digital Wallet', color: '#5d2e8c' },
    { id: 'nabil', text: '🔴 Nabil Bank / Mobile Banking', color: '#dc2626' },
  ];

  const suggestBox = (field: 'pickup' | 'drop') =>
    suggest?.field === field && suggest.items.length > 0 ? (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', marginTop: 2, maxHeight: 150, overflowY: 'auto' }}>
        {suggest.items.map((s, i) => (
          <div key={i} onClick={() => choose(field, s)} style={{ padding: '8px 10px', fontSize: 12, borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
            📍 {s.name}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <div ref={mapDiv} style={{ flex: 1, minHeight: 200, zIndex: 0 }} />

      <div style={{ padding: 12, background: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, boxShadow: '0 -4px 16px rgba(0,0,0,.15)', maxHeight: '58dvh', overflowY: 'auto', zIndex: 1000 }}>
        {/* वाहन चुनें */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {(Object.keys(RATES) as Vehicle[]).map((v) => (
            <button key={v} onClick={() => setVehicle(v)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: vehicle === v ? '2px solid #2563eb' : '1px solid #cbd5e1', background: vehicle === v ? '#eff6ff' : '#fff', fontSize: 12, fontWeight: 'bold', cursor: 'pointer' }}>
              <div style={{ fontSize: 20 }}>{RATES[v].icon}</div>
              {RATES[v].label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={label}>🟢 कहाँ से (Pickup):</label>
          <input type="text" value={pickup.name} onChange={(e) => onType('pickup', e.target.value)} placeholder="Bhairahawa..." style={input} />
          <button onClick={useMyLocation} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, padding: '4px 0', cursor: 'pointer' }}>📡 मेरी मौजूदा लोकेशन लगाएँ</button>
          {suggestBox('pickup')}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={label}>🔴 कहाँ जाना है (Dropoff):</label>
          <input type="text" value={dropoff.name} onChange={(e) => onType('drop', e.target.value)} placeholder="Butwal..." style={input} />
          {suggestBox('drop')}
        </div>

        <button onClick={findRoute} disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 'bold', cursor: 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'सड़क रूट खोजा जा रहा है...' : '🔄 सड़क रूट और किराया रीफ्रेश करें'}
        </button>

        {error && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>⚠️ {error}</div>}

        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
            {km ? `📍 कुल दूरी: ${km.toFixed(1)} किमी | ⏱️ समय: ${mins} मिनट` : 'पिकअप और ड्रॉप चुनें'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#16a34a', fontWeight: 'bold' }}>
            <span>कुल किराया ({RATES[vehicle].label}):</span>
            <span>Rs. {fare} NPR</span>
          </div>
        </div>

        {!booked ? (
          <button disabled={!fare} onClick={() => setShowPay(true)} style={{ width: '100%', background: fare ? '#dc2626' : '#94a3b8', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: fare ? 'pointer' : 'not-allowed' }}>
            {RATES[vehicle].icon} {RATES[vehicle].label} बुक करें →
          </button>
        ) : (
          <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
            <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>✅ राइड बुक हो गई! ड्राइवर आ रहा है।</div>
            <div style={{ fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
              (डेमो ड्राइवर) आपके पास लगभग <b>{driverEta || '--'} मिनट</b> में पहुँच रहा है।
            </div>
            <div style={{ fontSize: 12, color: '#d97706', fontWeight: 'bold', marginBottom: 8 }}>
              💰 भुगतान: {payMethod === 'cash' ? 'यात्रा के बाद ड्राइवर को नकद दें' : payMethod.toUpperCase() + ' (ऑनलाइन)'}
            </div>
            <button onClick={cancelBooking} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              रद्द करें / नयी बुकिंग करें
            </button>
          </div>
        )}
      </div>

      {showPay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: '#1e293b' }}>भुगतान का तरीका चुनें</h3>
              <button onClick={() => setShowPay(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: 8, marginBottom: 15, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 15 }}>
              <span>कुल देय किराया:</span>
              <span style={{ color: '#16a34a' }}>Rs. {fare} NPR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {payOptions.map((o) => (
                <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: payMethod === o.id ? `2px solid ${o.color}` : '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="radio" name="pay" checked={payMethod === o.id} onChange={() => setPayMethod(o.id)} />
                  <span style={{ fontWeight: 'bold', fontSize: 14 }}>{o.text}</span>
                </label>
              ))}
            </div>

            <button onClick={confirmBooking} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}>
              राइड कन्फर्म करें और ड्राइवर को बुलाएं
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
