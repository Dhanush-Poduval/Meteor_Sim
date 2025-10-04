'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MeteorPage({ params }) {
  const { id } = React.use(params)
  const [meteor, setMeteor] = useState([])

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

  return (
    <div className='text-white'>
      <h1 className='text-white'>{meteor.name}</h1>
      <p className='text-white'>Speed: {meteor.speed} km/s</p>
      <p className='text-white'>Radius: {meteor.radius} m</p>
      <p className='text-white'>Potentially hazardous: {meteor.hazardous ? 'Yes' : 'No'}</p>
    </div>
  )
}
