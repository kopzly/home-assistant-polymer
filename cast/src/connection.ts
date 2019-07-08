import {
  getAuth,
  createConnection,
  Connection,
  subscribeEntities,
  HassEntities,
} from "home-assistant-js-websocket";
import {
  HassMessage,
  ConnectMessage,
  TrackEntityMessage,
  BreakFreeMessage,
} from "./types";
import "./entity-state";
// tslint:disable-next-line: no-duplicate-imports
import { EntityStateElement } from "./entity-state";

export class ConnectionManager {
  public connection?: Connection;
  public entities?: HassEntities;
  public breakFree = false;
  public entityStateElements?: EntityStateElement[];

  public processIncomingMessage(msg: HassMessage) {
    if (msg.type === "connect") {
      this._handleConnectMessage(msg);
    } else if (msg.type === "track_entity") {
      this._handleTrackEntityMessage(msg);
    } else if (msg.type === "break_free") {
      this._handleBreakFreeMessage(msg);
    } else {
      // tslint:disable-next-line: no-console
      console.warn("unknown msg type", msg);
    }
  }

  private async _handleConnectMessage(msg: ConnectMessage) {
    let auth;
    try {
      auth = await getAuth({
        loadTokens: async () => ({
          hassUrl: msg.hassUrl,
          clientId: msg.clientId,
          refresh_token: msg.refreshToken,
          access_token: "",
          expires: 0,
          expires_in: 0,
        }),
      });
    } catch (err) {
      document.body.append(`Unable to get auth: ${err}`);
      return;
    }
    this.connection = await createConnection({ auth });
    document.body.append("Connected!");
  }

  private async _handleTrackEntityMessage(msg: TrackEntityMessage) {
    if (!this.entityStateElements) {
      this.entityStateElements = [];
      subscribeEntities(this.connection!, (entities) => {
        this.entities = entities;
        for (const entityStateEl of this.entityStateElements!) {
          entityStateEl.stateObj = entities[entityStateEl.entityId];
        }
      });
    }
    const entityStateElement = new EntityStateElement();
    entityStateElement.entityId = msg.entityId;
    entityStateElement.connection = this.connection!;
    entityStateElement.allowToggle = this.breakFree;
    if (this.entities) {
      entityStateElement.stateObj = this.entities[entityStateElement.entityId];
    }
    this.entityStateElements.push(entityStateElement);
    document.body.append(entityStateElement);
  }

  private _handleBreakFreeMessage(_msg: BreakFreeMessage) {
    this.breakFree = true;
    for (const trackEntityEl of this.entityStateElements!) {
      trackEntityEl.allowToggle = true;
    }
    document.body.querySelector("touch-controls")!.remove();
  }

  // private respondMessage(msg: HassMessage, response: any) {
  //   // @ts-ignore
  //   castContext.sendCustomMessage(HAST_NS, msg.senderId, response);
  // }
}
