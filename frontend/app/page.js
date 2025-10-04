// app/page.jsx
'use client'

import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false, // disables SSR for this component
});

export default function Page() {
  return (
    <div className="h-screen w-screen">
      <Map />
    </div>
  );
}
