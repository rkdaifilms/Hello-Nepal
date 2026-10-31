
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Vehicle = "bike" | "auto" | "car";

type Place = {
  name: string;
  lat: number;
  lon: number;
};

const VEHICLES: Record<Vehicle, { label: string; icon: string }> = {
  bike: { label: "Hello Nepal Bike", icon: "🏍️" },
  auto: { label: "Hello Nepal Auto", icon: "🛺" },
  car: { label: "Hello Nepal Car", icon: "🚗" },
};

const nepalView: L.LatLngExpression = [28.25, 84.0];

export default function RideBooking() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarker = useRef<L.Marker | null>(null);
  const dropMarker = useRef<L.Marker | null>(null);
  const vehicleMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);
  const trailLine = useRef<L.Polyline | null>(null);
  const watchId = useRef<number | null>(null);

  const [pickup, setPickup] = useState<Place | null>(null);
  const [drop, setDrop] = useState<Place | null>(null);
  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");
  const [pickupResults, setPickupResults] = useState<Place[]>([]);
  const [dropResults, setDropResults] = useState<Place[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle>("bike");
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [gpsStatus, setGpsStatus] = useState("GPS बंद है");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    const map = L.map(mapElement.current, {
      center: nepalView,
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Search any place in Nepal
  async function searchPlace(value: string, type: "pickup" | "drop") {
    if (type === "pickup") setPickupText(value);
    else setDropText(value);

    if (value.trim().length < 3) {
      type === "pickup" ? setPickupResults([]) : setDropResults([]);
      return;
    }

    try {
      setSearching(true);
      const url =
        "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=np&limit=6&q=" +
        encodeURIComponent(value);

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("लोकेशन सर्च नहीं हो सकी");

      const data = await response.json();

      const results: Place[] = data.map((item: any) => ({
        name: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));

      type === "pickup"
        ? setPickupResults(results)
        : setDropResults(results);
    } catch {
      setError("लोकेशन खोजने में समस्या हुई। दोबारा कोशिश करें।");
    } finally {
      setSearching(false);
    }
  }

  function choosePlace(place: Place, type: "pickup" | "drop") {
    if (type === "pickup") {
      setPickup(place);
      setPickupText(place.name);
      setPickupResults([]);
    } else {
      setDrop(place);
      setDropText(place.name);
      setDropResults([]);
    }

    const map = mapRef.current;
    if (!map) return;

    const position: L.LatLngExpression = [place.lat, place.lon];

    if (type === "pickup") {
      if (pickupMarker.current) map.removeLayer(pickupMarker.current);

      pickupMarker.current = L.marker(position)
        .addTo(map)
        .bindPopup("📍 Pickup: " + place.name);
    } else {
      if (dropMarker.current) map.removeLayer(dropMarker.current);

      dropMarker.current = L.marker(position)
        .addTo(map)
        .bindPopup("🏁 Drop: " + place.name);
    }

    map.setView(position, 14);
    if (pickup && type === "drop") {
      map.fitBounds(
        L.latLngBounds(
          [pickup.lat, pickup.lon],
          [place.lat, place.lon]
        ),
        { padding: [40, 40] }
      );
    }
  }

  // Draw actual road route using OSRM
  async function findRoute() {
    if (!pickup || !drop || !mapRef.current) {
      setError("पहले Pickup और Drop दोनों चुनें।");
      return;
    }

    setError("");

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}` +
        `?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("रूट सर्वर उपलब्ध नहीं है");

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("इस जगह का सड़क रूट नहीं मिला");
      }

      const route = data.routes[0];
      const coordinates: L.LatLngExpression[] =
        route.geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );

      const map = mapRef.current;

      if (routeLine.current) map.removeLayer(routeLine.current);

      routeLine.current = L.polyline(coordinates, {
        color: "#1769e0",
        weight: 6,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      setDistance(route.distance / 1000);
      setDuration(route.duration / 60);

      map.fitBounds(routeLine.current.getBounds(), {
        padding: [45, 45],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "रूट बनाने में समस्या हुई"
      );
    }
  }

  // Show user's real GPS location
  function locateMe() {
    if (!navigator.geolocation) {
      setError("इस डिवाइस में GPS उपलब्ध नहीं है।");
      return;
    }

    setGpsStatus("GPS लोकेशन खोज रहे हैं...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: Place = {
          name: "मेरी वर्तमान लोकेशन",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        choosePlace(point, "pickup");
        setGpsStatus("GPS चालू है");
      },
      (err) => {
        setGpsStatus("GPS उपलब्ध नहीं");
        setError(
          err.code === 1
            ? "लोकेशन की अनुमति दें।"
            : "GPS लोकेशन नहीं मिल सकी।"
        );
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }

  // Live vehicle tracking: call this on the driver's device
  function startLiveDriverTracking() {
    if (!navigator.geolocation) {
      setError("GPS उपलब्ध नहीं है।");
      return;
    }

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    setGpsStatus("ड्राइवर GPS लाइव है");

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const current: L.LatLngExpression = [lat, lon];
        const map = mapRef.current;

        if (!map) return;

        if (!vehicleMarker.current) {
          vehicleMarker.current = L.marker(current, {
            icon: L.divIcon({
              className: "hello-nepal-vehicle",
              html: `<div style="font-size:30px;text-shadow:0 2px 5px #777">🚗</div>`,
              iconSize: [38, 38],
              iconAnchor: [19, 19],
            }),
          }).addTo(map);
        } else {
          vehicleMarker.current.setLatLng(current);
        }

        const previous = trailLine.current?.getLatLngs() as
          | L.LatLng[]
          | undefined;

        const points = previous ? [...previous, L.latLng(lat, lon)] : [L.latLng(lat, lon)];

        if (trailLine.current) {
          trailLine.current.setLatLngs(points);
        } else {
          trailLine.current = L.polyline(points, {
            color: "#16a34a",
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
          }).addTo(map);
        }

        map.panTo(current);
      },
      (err) => {
        setGpsStatus("GPS त्रुटि");
        setError(
          err.code === 1
            ? "ड्राइवर को GPS की अनुमति देनी होगी।"
            : "ड्राइवर की GPS लोकेशन नहीं मिल रही।"
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000,
      }
    );
  }

  function stopLiveDriverTracking() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setGpsStatus("GPS बंद है");
  }

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "auto", padding: 12 }}>
      <h2>Hello Nepal Ride Booking</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={pickupText}
          onChange={(e) => searchPlace(e.target.value, "pickup")}
          placeholder="Pickup location — नेपाल में जगह खोजें"
          style={inputStyle}
        />
        <button onClick={locateMe}>मेरी GPS</button>
      </div>

      {pickupResults.map((place, index) => (
        <button
          key={`p-${index}`}
          style={resultStyle}
          onClick={() => choosePlace(place, "pickup")}
        >
          📍 {place.name}
        </button>
      ))}

      <input
        value={dropText}
        onChange={(e) => searchPlace(e.target.value, "drop")}
        placeholder="Drop location — नेपाल में जगह खोजें"
        style={inputStyle}
      />

      {dropResults.map((place, index) => (
        <button
          key={`d-${index}`}
          style={resultStyle}
          onClick={() => choosePlace(place, "drop")}
        >
          🏁 {place.name}
        </button>
      ))}

      <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
        {(Object.keys(VEHICLES) as Vehicle[]).map((key) => (
          <button
            key={key}
            onClick={() => setVehicle(key)}
            style={{
              ...vehicleStyle,
              border: vehicle === key ? "2px solid #dc2626" : "1px solid #ddd",
            }}
          >
            {VEHICLES[key].icon} {VEHICLES[key].label}
          </button>
        ))}
      </div>

      <div
        ref={mapElement}
        style={{
          width: "100%",
          height: 420,
          borderRadius: 12,
          border: "1px solid #ddd",
          zIndex: 0,
        }}
      />

      <button style={mainButton} onClick={findRoute}>
        सड़क का सही रूट दिखाएँ
      </button>

      <div style={{ padding: 12, background: "#f5f7fa", marginTop: 12 }}>
        <p>दूरी: {distance.toFixed(2)} km</p>
        <p>अनुमानित समय: {Math.ceil(duration)} मिनट</p>
        <p>गाड़ी: {VEHICLES[vehicle].label}</p>
        <p>GPS स्थिति: {gpsStatus}</p>
      </div>

      <button style={mainButton} onClick={startLiveDriverTracking}>
        ड्राइवर का लाइव GPS चालू करें
      </button>

      <button style={{ ...mainButton, background: "#555" }} onClick={stopLiveDriverTracking}>
        GPS बंद करें
      </button>

      {searching && <p>लोकेशन खोज रहे हैं...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 13,
  border: "1px solid #ccc",
  borderRadius: 10,
  marginBottom: 8,
  boxSizing: "border-box",
};

const resultStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 10,
  marginBottom: 5,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
};

const vehicleStyle: React.CSSProperties = {
  flex: 1,
  padding: 12,
  background: "#fff",
  borderRadius: 10,
  cursor: "pointer",
};

const mainButton: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginTop: 10,
  background: "#dc2626",
  color: "white",
  border: 0,
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
};
