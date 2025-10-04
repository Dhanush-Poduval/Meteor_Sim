'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import React, { useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";

export default function MeteorMap() {
  const [meteors, setMeteors] = useState([]);

  const customIcon = new Icon({
    iconUrl: "map-pin (1).png",
    iconSize: [38, 38]
  });

  useEffect(() => {
    async function fetchMeteors() {
      try {
        const meteorsRes = await fetch('http://127.0.0.1:8000/meteors');
        const meteorsData = await meteorsRes.json();
        const craterPromises = meteorsData.map(async (m) => {
          console.log(m.id)
          const craterRes = await fetch('http://127.0.0.1:8000/crater', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: m.id,
              crater_lat: 23.5, 
              crater_lon: 80,   
              angle: 45
            })
          });
          const craterData = await craterRes.json();

          return {
            name: m.name,
            speed: m.speed,
            material: m.material,
            crater_size: craterData.crater_size || 0,
            entry: { lat: 23.5, lon: 80 },    
            impact: { lat: craterData.crater_lat || 23.5, lon: craterData.crater_lon || 80 },
            outcome: craterData.message || 'Impact'
          };
        });

        const results = await Promise.all(craterPromises);
        setMeteors(results);
      } catch (err) {
        console.error(err);
      }
    }

    fetchMeteors();
  }, []);

  return (
    <MapContainer center={[23.5, 80]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=''
      />

      {meteors.map((m, idx) => (
        <React.Fragment key={idx}>
          <Marker position={[m.entry.lat, m.entry.lon]} icon={customIcon}>
            <Popup>
              <strong>{m.name}</strong><br />
              Speed: {m.speed} km/s<br />
              Material: {m.material}<br />
              Outcome: {m.outcome}
            </Popup>
          </Marker>

          {m.outcome === 'Impact' && (
            <>
              <Circle
                center={[m.impact.lat, m.impact.lon]}
                radius={m.crater_size}
                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }}
              />
              <Polyline
                positions={[[m.entry.lat, m.entry.lon], [m.impact.lat, m.impact.lon]]}
                color="blue"
              />
            </>
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
}
