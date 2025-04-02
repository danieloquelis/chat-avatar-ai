export type ConvertTextToSpeechOptions = {
  text: string;
};

export type UseAgentConversationOptions = {
  agentId?: string;
  agentUrl?: string;
  onConnected?: () => Promise<void>;
  onClosed?: () => Promise<void>;
  onUserEvent?: (event: UserEvent) => Promise<void>;
  onAgentEvent?: (event: AgentEvent) => Promise<void>;
};

export type UserEvent = {
  transcription: string;
};

export type AgentEvent =
  | {
      type: "transcription";
      transcription: string;
    }
  | {
      type: "audio";
      audioBase64: string;
      eventId: number;
    };

export type AgentConversationStatus =
  | "disconnecting"
  | "disconnected"
  | "connecting"
  | "connected";

type BaseRequest = {
  type: string;
};

type UserChunkRequest = {
  user_audio_chunk?: string;
};

type ConversationInitiationClientRequest = BaseRequest & {
  type: "conversation_initiation_client_data";
  conversation_config_override?: {
    agent?: {
      prompt?: string;
      first_message?: string;
      language?: string;
    };
  };
  tts?: {
    voice_id?: string;
  };
  custom_llm_extra_body?: {
    temperature?: number;
    max_tokens?: number;
  };
  dynamic_variables?: {
    [key: string]: string | number | boolean;
  };
};

type PongRequest = BaseRequest & {
  type: "pong";
  event_id?: number;
};

type ClientToolResultRequest = BaseRequest & {
  type: "client_tool_result";
  tool_call_id: string;
  result: string;
  is_error: boolean;
};

export type ElevenLabsWebSocketRequest =
  | UserChunkRequest
  | ConversationInitiationClientRequest
  | PongRequest
  | ClientToolResultRequest;

type BaseEvent = {
  type: string;
};

type ConversationInitiationMetadataEvent = BaseEvent & {
  type: "conversation_initiation_metadata";
  conversation_initiation_metadata_event: {
    conversation_id: string;
    agent_output_audio_format: string;
    user_input_audio_format: string;
  };
};

type UserTranscriptEvent = BaseEvent & {
  type: "user_transcript";
  user_transcription_event: {
    user_transcript: string;
  };
};

type AgentResponseEvent = BaseEvent & {
  type: "agent_response";
  agent_response_event: {
    agent_response: string;
  };
};

type AgentResponseCorrectionEvent = BaseEvent & {
  type: "agent_response_correction";
  agent_response_correction_event: {
    corrected_response: string;
  };
};

type AudioResponseEvent = BaseEvent & {
  type: "audio";
  audio_event: {
    audio_base_64: string;
    event_id: number;
  };
};

type InterruptionEvent = BaseEvent & {
  type: "interruption";
  interruption_event: {
    reason: string;
  };
};

type PingEvent = BaseEvent & {
  type: "ping";
  ping_event: {
    event_id: number;
    ping_ms?: number;
  };
};

type ClientToolCallEvent = BaseEvent & {
  type: "client_tool_call";
  client_tool_call: {
    tool_name: string;
    tool_call_id: string;
    parameters: Record<string, unknown>;
  };
};

type InternalVadScoreEvent = BaseEvent & {
  type: "internal_vad_score";
  vad_event: {
    score: number;
  };
};

type InternalTurnProbabilityEvent = BaseEvent & {
  type: "internal_turn_probability";
  turn_event: {
    probability: number;
  };
};

type InternalTentativeAgentResponseEvent = BaseEvent & {
  type: "internal_tentative_agent_response";
  tentative_agent_response_internal_event: {
    tentative_agent_response: string;
  };
};

export type ElevenLabsWebSocketEvent =
  | ConversationInitiationMetadataEvent
  | UserTranscriptEvent
  | AgentResponseEvent
  | AgentResponseCorrectionEvent
  | AudioResponseEvent
  | InterruptionEvent
  | PingEvent
  | ClientToolCallEvent
  | InternalVadScoreEvent
  | InternalTurnProbabilityEvent
  | InternalTentativeAgentResponseEvent;
