import { Object3D, SkinnedMesh } from "three";

export const isSkinnedMesh = (object3D: Object3D): object3D is SkinnedMesh => {
  return (object3D as SkinnedMesh).isSkinnedMesh;
};
