import { GLTF } from "three-stdlib";
import * as THREE from "three";

export type AvatarProps = {};

export type AvatarGLTF = GLTF & {
  nodes: {
    Wolf3D_Glasses: THREE.SkinnedMesh;
    Wolf3D_Headwear: THREE.SkinnedMesh;
    Wolf3D_Body: THREE.SkinnedMesh;
    Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
    Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
    Wolf3D_Outfit_Top: THREE.SkinnedMesh;
    EyeLeft: THREE.SkinnedMesh;
    EyeRight: THREE.SkinnedMesh;
    Wolf3D_Head: THREE.SkinnedMesh;
    Wolf3D_Teeth: THREE.SkinnedMesh;
    Hips: THREE.Bone;
  };
  materials: {
    Wolf3D_Glasses: THREE.MeshStandardMaterial;
    Wolf3D_Headwear: THREE.MeshStandardMaterial;
    Wolf3D_Body: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Bottom: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Footwear: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
    Wolf3D_Eye: THREE.MeshStandardMaterial;
    Wolf3D_Skin: THREE.MeshStandardMaterial;
    Wolf3D_Teeth: THREE.MeshStandardMaterial;
  };
};

export type AvatarAnimationType =
  | "Angry"
  | "Defeated"
  | "DismissingGesture"
  | "HappyIdle"
  | "Idle"
  | "SadIdle"
  | "Surprised"
  | "TalkingOne"
  | "TalkingThree"
  | "TalkingTwo"
  | "ThoughtfulHeadShake";

interface GLTFAction extends THREE.AnimationClip {
  name: AvatarAnimationType;
}

export type AvatarAnimationGLTF = GLTF & {
  nodes: {
    Hips: THREE.Bone;
  };
  animations: GLTFAction[];
  materials: object;
};
