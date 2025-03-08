"use client";

import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { FC, useEffect, useState } from "react";

import * as THREE from "three";
import {
  FacialExpression,
  facialExpressions,
} from "@/constants/facial-expressions";
import { visemesMapping } from "@/constants/visemes-mapping";
import { morphTargets, MorphTarget } from "@/constants/morph-targets";
import { useSpeech } from "@/providers/speech-provider";
import { AvatarAnimationType, AvatarProps } from "./avatar-common";
import { Phoneme } from "@/service/rhubarb";
import { useAvatarModel } from "./use-avatar-model";
import { useAvatarAnimations } from "./use-avatar-animations";

export const Avatar: FC<AvatarProps> = (props) => {
  const { nodes, materials, scene } = useAvatarModel(); //useGLTF("/assets/avatar.glb");
  const { animations, group, actions } = useAvatarAnimations(); //useGLTF("/assets/animations.glb");

  const { message, onMessagePlayed } = useSpeech();
  const [phonemes, setPhonemes] = useState<Phoneme>();
  const [setupMode, setSetupMode] = useState(false);
  const [blink, setBlink] = useState(false);
  const [facialExpression, setFacialExpression] =
    useState<FacialExpression>("default");
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [animation, setAnimation] = useState<AvatarAnimationType>("Idle");

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      return;
    }

    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setPhonemes(message.phonemes);

    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    setAudio(audio);
    audio.onended = onMessagePlayed;
    audio.play();
  }, [message, onMessagePlayed]);

  useEffect(() => {
    if (!actions[animation]) {
      return;
    }

    actions[animation].reset().fadeIn(0.5).play();

    return () => {
      if (actions[animation]) {
        actions[animation].fadeOut(0.5);
      }
    };
  }, [actions, animation]);

  const lerpMorphTarget = (target: MorphTarget, value: number, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed,
        );
      }
    });
  };

  useFrame(() => {
    !setupMode &&
      morphTargets.forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });

    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    if (setupMode) {
      return;
    }

    const appliedMorphTargets: MorphTarget[] = [];
    if (message && phonemes && audio) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < phonemes.mouthCues.length; i++) {
        const mouthCue = phonemes.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          appliedMorphTargets.push(visemesMapping[mouthCue.value]);

          lerpMorphTarget(visemesMapping[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    Object.values(visemesMapping).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => {
        setAnimation(value);
      },
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    setupMode: button(() => {
      setSetupMode(!setupMode);
    }),
  });

  useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...morphTargets.map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: 0,
            max: 1,
            onChange: (val: number) => {
              lerpMorphTarget(key, val, 0.1);
            },
          },
        };
      }),
    ),
  );

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => {
            setBlink(false);
            nextBlink();
          }, 200);
        },
        THREE.MathUtils.randInt(1000, 5000),
      );
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group} position={[0, -0.5, 0]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Headwear.geometry}
        material={materials.Wolf3D_Headwear}
        skeleton={nodes.Wolf3D_Headwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
};
