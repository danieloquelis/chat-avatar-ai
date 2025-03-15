import * as THREE from "three";
import { useGraph as ThreeUseGraph } from "@react-three/fiber";

export const useGraph = <TObject>(object: THREE.Object3D): TObject => {
  return ThreeUseGraph(object) as unknown as TObject;
};
