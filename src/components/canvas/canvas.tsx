"use client";

import { FC, PropsWithChildren } from "react";
import { CanvasProps } from "@react-three/fiber";
import { Canvas as RTCanvas } from "@react-three/fiber";

export const Canvas: FC<CanvasProps & PropsWithChildren> = (props) => {
  const { children } = props;
  return <RTCanvas {...props}>{children}</RTCanvas>;
};
