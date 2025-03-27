import { NextResponse } from "next/server";
import { Rhubarb } from "rhubarb-lip-sync-wasm";

export async function POST(req: Request) {
  const request = await req.json();
  const audioPayload = request.audioPayload as string;

  const pcmAudio = Buffer.from(audioPayload, "base64");
  const mouthCues = await Rhubarb.getLipSync(pcmAudio);

  return NextResponse.json({
    mouthCues,
  });
}
