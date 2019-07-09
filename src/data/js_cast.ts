import { LovelaceConfig } from "./lovelace";

interface BaseHassMessage {
  type: string;
  senderId?: string;
}

export interface ConnectMessage extends BaseHassMessage {
  type: "connect";
  refreshToken: string;
  clientId: string;
  hassUrl: string;
}

export interface ShowLovelaceMessage extends BaseHassMessage {
  type: "show_lovelace";
  config: LovelaceConfig;
}

export interface BreakFreeMessage extends BaseHassMessage {
  type: "break_free";
}

export type HassMessage =
  | ConnectMessage
  | ShowLovelaceMessage
  | BreakFreeMessage;
