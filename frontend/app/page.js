// app/page.jsx
'use client'

import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false, // disables SSR for this component
});

export default function Page() {
  return (
    
    <div className="h-screen w-screen">
      <div>
        <h1 className="text-3xl font-bold underline text-center p-4">
          Meteor Impact Visualization
        </h1>
      </div>
      <Map />
    </div>
  );
}
