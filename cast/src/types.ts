export interface ReceivedMessage<T> {
  gj: boolean;
  data: T;
  senderId: string;
  type: "mesage";
}

interface BaseHassMessage {
  type: string;
  senderId: string;
}

export interface ConnectMessage extends BaseHassMessage {
  type: "connect";
  refreshToken: string;
  clientId: string;
  hassUrl: string;
}

export interface TrackEntityMessage extends BaseHassMessage {
  type: "track_entity";
  entityId: string;
}

export interface BreakFreeMessage extends BaseHassMessage {
  type: "break_free";
}

export type HassMessage =
  | ConnectMessage
  | TrackEntityMessage
  | BreakFreeMessage;
