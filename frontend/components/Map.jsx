'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import React, { useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";

export default function MeteorMap() {
  const [craters, setCraters] = useState([]);

  const customIcon = new Icon({
    iconUrl: "/map-pin (1).png",
    iconSize: [38, 38]
  });

  useEffect(() => {
    async function fetchCraters() {
      try {
        const res = await fetch('http://127.0.0.1:8000/craters');
        const data = await res.json();
        setCraters(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCraters();
  }, []);

  const getCraterColor = (crater) => {
    if (crater.impact === 'water' && crater.tsunami_radius > 0) return 'blue';
    if (crater.impact === 'land' && crater.earthquake_mag > 6) return 'red';
    return crater.impact === 'land' ? 'orange' : 'lightblue';
  };

  return (
    <MapContainer center={[20, 80]} zoom={3} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
      />

      {craters.map((crater, idx) => (
        <React.Fragment key={idx}>
          <Marker position={[crater.lat, crater.lon]} icon={customIcon}>
            <Popup>
              <strong>{crater.name}</strong><br />
             
             
             
              Crater Size: {Math.round(crater.crater_size)} m<br />
              Earthquake: {crater.earthquake_mag.toFixed(2)}<br />
              Tsunami Radius: {Math.round(crater.tsunami_radius)} km
            </Popup>
          </Marker>

          <Circle
            center={[crater.lat, crater.lon]}
            radius={crater.crater_size}
            pathOptions={{
              color: getCraterColor(crater),
              fillColor: getCraterColor(crater),
              fillOpacity: 0.5
            }}
          />
          {crater.impact_type && (
            <Polyline
              positions={[
                [crater.lat, crater.lon],
                [crater.lat, crater.lon] 
              ]}
              color={crater.impact_type === 'water' ? 'blue' : 'red'}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
}
