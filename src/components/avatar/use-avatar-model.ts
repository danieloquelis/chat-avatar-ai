import { useGLTF } from "@react-three/drei";
import { AvatarGLTF } from "./avatar-common";
import React from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGraph } from "@react-three/fiber";

export const useAvatarModel = () => {
  const { scene, ...rest } = useGLTF("/assets/avatar.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as AvatarGLTF;

  return {
    ...rest,
    scene,
    nodes,
    materials,
  };
};
