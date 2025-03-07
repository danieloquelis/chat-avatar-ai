"use client";

import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { Canvas } from "@react-three/fiber";
import { Scenario } from "@/components/scenario";

export default function Home() {
  return (
    <>
      <Loader />
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
        <Scenario />
      </Canvas>
    </>
  );
}
