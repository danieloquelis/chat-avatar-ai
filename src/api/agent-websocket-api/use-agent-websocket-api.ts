import { useQuery } from "@/hooks/use-query";
import { AgentWebsocketApiResponse } from "./agent-websocket-api-common";

export const useAgentWebsocketApi = () => {
  return useQuery<AgentWebsocketApiResponse>("/api/signed-websocket-url");
};
