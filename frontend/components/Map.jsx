'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import {Icon }from 'leaflet';

import React from 'react';
import "leaflet/dist/leaflet.css"



export default function DummyMeteorMap() {
    //dummy
  const meteors = [
    {
      name: 'Impactor-2025',
      speed: 15, 
      material: 'Iron',
      crater_size: 500, 
      entry: { lat: 23.5, lon: 80 },
      impact: { lat: 23.55, lon: 80.03 },
      outcome: 'Impact'
    },
    {
      name: 'StonyRock',
      speed: 8,
      material: 'Stony',
      crater_size: 0,
      entry: { lat: 22.5, lon: 81 },
      impact: { lat: 22.52, lon: 81.01 },
      outcome: 'Burned up'
    }
  ];
   const customIcon=new Icon({
        iconUrl:"map-pin (1).png",
        iconSize:[38,38] 
    })

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
                color="yellow"
              />
            </>
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
}
