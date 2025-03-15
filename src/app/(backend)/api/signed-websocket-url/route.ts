import { ElevenLabs } from "@/service/eleven-labs";
import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.ELEVEN_LABS_AGENT_ID;
  if (!agentId) {
    console.error("[Api /api/signed-websocket-url]", "Did not find agentId");
    return NextResponse.json({ status: 404 });
  }
  const url = await ElevenLabs.getAgentWebsocketUrl(agentId);
  return NextResponse.json({
    url,
  });
}
