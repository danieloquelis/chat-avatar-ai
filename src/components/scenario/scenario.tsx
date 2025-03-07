"use client";

import { CameraControls, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import CameraControlsImpl from "camera-controls";
import { Avatar } from "@/components/avatar";

export const Scenario = () => {
  const cameraControls = useRef<CameraControlsImpl | null>(null);

  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, []);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" background blur={0.5} />
      <Avatar />
    </>
  );
};
