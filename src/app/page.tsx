import { Scenario } from "@/components/scenario";
import { Canvas } from "@/components/canvas";
import { Loader } from "@/components/loader";
import { Chat } from "@/components/chat/chat";

export default function Home() {
  return (
    <>
      <Loader />
      <Chat hidden={false} />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
        <Scenario />
      </Canvas>
    </>
  );
}
