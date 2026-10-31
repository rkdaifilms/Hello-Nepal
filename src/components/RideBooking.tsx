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

// ---------- आइकन ----------
// गाड़ी के आगे चलने की दिशा में हरा तीर
const arrowIcon = () =>
  L.divIcon({
    className: '',
    html: `<div class="hn-arrow" style="width:44px;height:44px;transition:transform .4s linear">
      <svg viewBox="0 0 44 44" width="44" height="44">
        <circle cx="22" cy="22" r="20" fill="rgba(22,163,74,.18)"/>
        <path d="M22 4 L34 34 L22 28 L10 34 Z" fill="#16a34a" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
      </svg></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const pin = (color: string, letter: string) =>
  L.divIcon({
    className: '',
    html: `<div style="position:relative;width:34px;height:44px">
      <svg viewBox="0 0 34 44" width="34" height="44"><path d="M17 43C17 43 2 27 2 16a15 15 0 0 1 30 0C32 27 17 43 17 43Z" fill="${color}" stroke="#fff" stroke-width="2.5"/></svg>
      <div style="position:absolute;top:7px;left:0;width:34px;text-align:center;color:#fff;font-weight:bold;font-size:15px">${letter}</div></div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 43],
  });

const rotate = (m: L.Marker | undefined, deg: number) => {
  const el = m?.getElement()?.querySelector('.hn-arrow') as HTMLElement | null;
  if (el) el.style.transform = `rotate(${deg}deg)`;
};

const bearing = (a: LatLng, b: LatLng) => {
  const r = Math.PI / 180;
  const y = Math.sin((b[1] - a[1]) * r) * Math.cos(b[0] * r);
  const x = Math.cos(a[0] * r) * Math.sin(b[0] * r) - Math.sin(a[0] * r) * Math.cos(b[0] * r) * Math.cos((b[1] - a[1]) * r);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

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
    return (d.display_name as string) || 'चुनी हुई लोकेशन';
  } catch {
    return 'चुनी हुई लोकेशन';
  }
}

async function fetchRoute(a: LatLng, b: LatLng) {
  // OSRM से असली सड़क रूट। प्रोडक्शन में अपना OSRM / OpenRouteService / Mapbox लगाएँ।
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
async function startOnlinePayment(_method: Pay, _amount: number): Promise<'pending'> {
  return 'pending';
}

export default function RideBooking() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<{ pickup?: L.Marker; drop?: L.Marker; me?: L.Marker; acc?: L.Circle; driver?: L.Marker }>({});
  const debounce = useRef<number | undefined>(undefined);
  const driverTimer = useRef<number | undefined>(undefined);
  const firstFix = useRef(true);
  const lastPos = useRef<LatLng | null>(null);

  const [pickup, setPickup] = useState<Place>({ name: '', pos: null });
  const [dropoff, setDropoff] = useState<Place>({ name: '', pos: null });
  const [suggest, setSuggest] = useState<{ field: 'pickup' | 'drop'; items: Place[] } | null>(null);
  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [follow, setFollow] = useState(true);
  const [pickMode, setPickMode] = useState<null | 'pickup' | 'drop'>(null);
  const pickModeRef = useRef<null | 'pickup' | 'drop'>(null);
  const [vehicle, setVehicle] = useState<Vehicle>('auto');
  const [km, setKm] = useState(0);
  const [mins, setMins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState<Pay>('cash');
  const [booked, setBooked] = useState(false);
  const [driverEta, setDriverEta] = useState(0);

  useEffect(() => { pickModeRef.current = pickMode; }, [pickMode]);

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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    routeLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // मैप खींचो तो फॉलो मोड बंद
    map.on('dragstart', () => setFollow(false));

    // मैप पर टैप करके पिकअप / ड्रॉप चुनना
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const mode = pickModeRef.current;
      if (!mode) return;
      const pos: LatLng = [e.latlng.lat, e.latlng.lng];
      const set = mode === 'pickup' ? setPickup : setDropoff;
      setPickMode(null);
      set({ name: 'लोकेशन लोड हो रही है…', pos });
      const name = await reverseGeocode(pos);
      set((prev) => (prev.pos === pos ? { name, pos } : prev)); // वही pos रखो ताकि रूट दोबारा न बने
    });

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapDiv.current);

    return () => {
      ro.disconnect();
      window.clearInterval(driverTimer.current);
      map.remove();
      mapRef.current = null;
      markers.current = {};
    };
  }, []);

  // ---------- लाइव GPS ----------
  useEffect(() => {
    if (!('geolocation' in navigator)) { setError('इस ब्राउज़र में GPS नहीं है'); return; }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const pos: LatLng = [p.coords.latitude, p.coords.longitude];
        if (p.coords.accuracy > 150 && lastPos.current) return; // बहुत गलत रीडिंग हटाओ
        setAccuracy(p.coords.accuracy);

        let h: number | null = p.coords.heading != null && !isNaN(p.coords.heading) ? p.coords.heading : null;
        const last = lastPos.current;
        if (!last) {
          lastPos.current = pos;
        } else if (L.latLng(last).distanceTo(L.latLng(pos)) > 5) {
          if (h == null) h = bearing(last, pos); // GPS दिशा न दे तो चलने से निकालो
          lastPos.current = pos;
        }
        if (h != null) setHeading(h);
        setMyPos(pos);
      },
      () => setError('GPS चालू करें और लोकेशन की अनुमति (Precise) दें'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // मेरी गाड़ी का तीर + accuracy घेरा + फॉलो
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !myPos) return;
    if (!markers.current.me) {
      markers.current.me = L.marker(myPos, { icon: arrowIcon(), zIndexOffset: 1000 }).addTo(map);
      markers.current.acc = L.circle(myPos, { radius: accuracy ?? 30, color: '#16a34a', weight: 1, fillColor: '#16a34a', fillOpacity: 0.1 }).addTo(map);
    } else {
      markers.current.me.setLatLng(myPos);
      markers.current.acc?.setLatLng(myPos);
    }
    markers.current.acc?.setRadius(accuracy ?? 30);
    rotate(markers.current.me, heading);

    if (firstFix.current) {
      firstFix.current = false;
      map.setView(myPos, 16);
      reverseGeocode(myPos).then((name) => setPickup((p) => (p.pos ? p : { name, pos: myPos })));
    } else if (follow) {
      map.panTo(myPos, { animate: true });
    }
  }, [myPos, heading, accuracy, follow]);

  // ---------- पिकअप / ड्रॉप पिन ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sync = (key: 'pickup' | 'drop', place: Place, color: string, letter: string, text: string) => {
      const m = markers.current[key];
      if (!place.pos) { if (m) { m.remove(); markers.current[key] = undefined; } return; }
      if (!m) {
        const nm = L.marker(place.pos, { icon: pin(color, letter), zIndexOffset: 800 }).addTo(map);
        nm.bindTooltip(text, { permanent: true, direction: 'top', offset: [0, -42] });
        markers.current[key] = nm;
      } else m.setLatLng(place.pos);
    };
    sync('pickup', pickup, '#16a34a', 'P', 'पिकअप');
    sync('drop', dropoff, '#dc2626', 'D', 'ड्रॉप');
  }, [pickup, dropoff]);

  // ---------- रूट (दोनों चुनते ही अपने-आप) ----------
  const findRoute = async () => {
    const map = mapRef.current;
    if (!map || !pickup.pos || !dropoff.pos) { setError('पिकअप और ड्रॉप दोनों चुनें'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetchRoute(pickup.pos, dropoff.pos);
      routeLayer.current?.clearLayers();
      const opt = { smoothFactor: 0, lineCap: 'round' as const, lineJoin: 'round' as const };
      L.polyline(r.coords, { ...opt, color: '#fff', weight: 11, opacity: 1 }).addTo(routeLayer.current!);
      const line = L.polyline(r.coords, { ...opt, color: '#2563eb', weight: 6, opacity: 0.95 }).addTo(routeLayer.current!);
      setFollow(false);
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
    }, 600);
  };

  const choose = (field: 'pickup' | 'drop', p: Place) => {
    (field === 'pickup' ? setPickup : setDropoff)(p);
    setSuggest(null);
    setFollow(false);
    if (p.pos) mapRef.current?.setView(p.pos, 15);
  };

  const useMyLocation = async () => {
    if (!myPos) { setError('GPS लोकेशन अभी नहीं मिली'); return; }
    choose('pickup', { name: await reverseGeocode(myPos), pos: myPos });
  };

  const recenter = () => {
    setFollow(true);
    if (myPos && mapRef.current) mapRef.current.setView(myPos, Math.max(mapRef.current.getZoom(), 16));
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

  // डेमो ड्राइवर: असली सड़क पर पिकअप तक आता है। असली में Supabase Realtime से लोकेशन आएगी।
  const startDriverDemo = async (target: LatLng) => {
    const map = mapRef.current;
    if (!map) return;
    window.clearInterval(driverTimer.current);
    markers.current.driver?.remove();
    try {
      const r = await fetchRoute([target[0] + 0.012, target[1] + 0.012], target);
      const pts = r.coords;
      if (pts.length < 2) return;
      let i = 0;
      const m = L.marker(pts[0], { icon: arrowIcon(), zIndexOffset: 900 }).addTo(map);
      m.bindTooltip(`${RATES[vehicle].icon} ड्राइवर`, { permanent: true, direction: 'right', offset: [18, 0] });
      markers.current.driver = m;
      rotate(m, bearing(pts[0], pts[1]));
      setDriverEta(r.min);
      const step = Math.max(1, Math.floor(pts.length / 40));
      driverTimer.current = window.setInterval(() => {
        const next = Math.min(i + step, pts.length - 1);
        m.setLatLng(pts[next]);
        if (next !== i) rotate(m, bearing(pts[i], pts[next]));
        i = next;
        setDriverEta(Math.ceil(r.min * (1 - i / (pts.length - 1))));
        if (i >= pts.length - 1) window.clearInterval(driverTimer.current);
      }, 800);
    } catch {
      setError('ड्राइवर का रूट नहीं मिला');
    }
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
  const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#2563eb', fontSize: 12, padding: '4px 10px 4px 0', cursor: 'pointer' };
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      {/* मैप + ऊपर के बटन */}
      <div style={{ flex: 1, minHeight: 200, position: 'relative' }}>
        <div ref={mapDiv} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {pickMode && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#1e293b', color: '#fff', padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', display: 'flex', gap: 10, alignItems: 'center' }}>
            मैप पर टैप करके {pickMode === 'pickup' ? 'पिकअप' : 'ड्रॉप'} चुनें
            <span onClick={() => setPickMode(null)} style={{ cursor: 'pointer' }}>✕</span>
          </div>
        )}

        <button onClick={recenter} aria-label="मेरी लोकेशन" style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 1000, width: 44, height: 44, borderRadius: '50%', border: 'none', background: follow ? '#16a34a' : '#fff', color: follow ? '#fff' : '#16a34a', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,.3)', cursor: 'pointer' }}>
          🎯
        </button>
      </div>

      {/* नीचे का पैनल */}
      <div style={{ padding: 12, background: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, boxShadow: '0 -4px 16px rgba(0,0,0,.15)', maxHeight: '55%', overflowY: 'auto', zIndex: 1000 }}>
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
          <button onClick={useMyLocation} style={linkBtn}>📡 मेरी लोकेशन</button>
          <button onClick={() => setPickMode('pickup')} style={linkBtn}>🗺️ मैप पर चुनें</button>
          {suggestBox('pickup')}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={label}>🔴 कहाँ जाना है (Dropoff):</label>
          <input type="text" value={dropoff.name} onChange={(e) => onType('drop', e.target.value)} placeholder="Butwal..." style={input} />
          <button onClick={() => setPickMode('drop')} style={linkBtn}>🗺️ मैप पर चुनें</button>
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
              (डेमो ड्राइवर) {driverEta > 0 ? <>आपके पास लगभग <b>{driverEta} मिनट</b> में पहुँच रहा है।</> : <b>ड्राइवर पहुँच गया!</b>}
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
