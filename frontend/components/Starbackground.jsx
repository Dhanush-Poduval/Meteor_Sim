'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

export default function StarBackground({ className }) {
  return (
    <Canvas className={className} camera={{ position: [0, 0, 1] }}>
      <Stars
        radius={100}   // radius of the sphere
        depth={50}     // depth of stars
        count={5000}   // number of stars
        factor={4}     // star size factor
        saturation={0} // keep white
        fade           // fade at edges
      />
    </Canvas>
  )
}
