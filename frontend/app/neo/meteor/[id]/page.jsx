'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StarsCanvas from '@/components/Stars'

export default function MeteorPage({ params }) {
  const { id } = React.use(params)
  const [meteor, setMeteor] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [angle, setAngle] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchMeteor() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/meteor/${id}`)
        const data = await res.json()
        setMeteor(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMeteor()
  }, [id])

  if (!meteor) return <div>Loading...</div>

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/crater', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crater_lat: lat,
          crater_lon: lon,
          angle: angle,
          neo_id: meteor.id
        })
      })
      const data = await res.json()
      router.push(`/`)
    } catch (error) {
      console.log("Error :", error)
    }
  }

  return (
    <main className='w-full h-full relative'>
      {/* Stars Background */}
      <div className='absolute inset-0 -z-10'>
        <StarsCanvas style={{ pointerEvents: 'none' }} />
      </div>

      {/* Content */}
      <div className='p-6 flex flex-col items-center space-y-6 relative z-10'>
        <Card className="w-full max-w-md border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{meteor.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><span className="font-medium">Speed:</span> {meteor.speed} km/s</p>
            <p><span className="font-medium">Radius:</span> {meteor.radius} m</p>
            <p><span className="font-medium">Potentially hazardous:</span> {meteor.hazardous ? 'Yes' : 'No'}</p>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Go Back
              </Button>
              <Button onClick={() => setShowPopup(true)}>
                Stimulate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popup Overlay */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div
              className="absolute inset-0 bg-white/30 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            ></div>

            {/* Centered Popup Card */}
            <Card className="relative w-full max-w-sm border border-gray-200 shadow-md p-4 z-10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Enter Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Latitude</label>
                  <Input
                    type="number"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Enter latitude"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Longitude</label>
                  <Input
                    type="number"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    placeholder="Enter longitude"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Angle</label>
                  <Input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    placeholder="Enter angle"
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setShowPopup(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
