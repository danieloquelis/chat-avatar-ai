import { useRef } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";

export const useAvatarAnimations = () => {
  const group = useRef<THREE.Group>(null);
  const { animations, ...rest } = useGLTF("/assets/animations.glb");
  const { actions } = useAnimations(animations, group);

  return {
    ...rest,
    group,
    animations,
    actions,
  };
};
