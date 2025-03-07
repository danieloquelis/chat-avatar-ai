import { Scenario } from "@/components/scenario";
import { Canvas } from "@/components/canvas";
import { Loader } from "@/components/loader";

export default function Home() {
  return (
    <>
      <Loader />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
        <Scenario />
      </Canvas>
    </>
  );
}
