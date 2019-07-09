import { HassElement } from "../../../src/state/hass-element";
import { getAuth, createConnection } from "home-assistant-js-websocket";
import { customElement, TemplateResult, html, property } from "lit-element";
import {
  HassMessage,
  ConnectMessage,
  BreakFreeMessage,
  ShowLovelaceMessage,
} from "../../../src/data/js_cast";
import { LovelaceConfig } from "../../../src/data/lovelace";
import "./hc-launch-screen";

@customElement("hc-main")
export class HcMain extends HassElement {
  @property() private _lovelaceConfig?: LovelaceConfig;
  @property() private _error?: string;

  public processIncomingMessage(msg: HassMessage) {
    if (msg.type === "connect") {
      this._handleConnectMessage(msg);
    } else if (msg.type === "show_lovelace") {
      this._handleShowLovelaceMessage(msg);
    } else if (msg.type === "break_free") {
      this._handleBreakFreeMessage(msg);
    } else {
      // tslint:disable-next-line: no-console
      console.warn("unknown msg type", msg);
    }
  }

  protected render(): TemplateResult | void {
    if (!this._lovelaceConfig) {
      return html`
        <hc-launch-screen
          .hass=${this.hass}
          .error=${this._error}
        ></hc-launch-screen>
      `;
    }
    return html`
      <hc-lovelace
        .hass=${this.hass}
        .lovelaceConfig=${this._lovelaceConfig}
      ></hc-lovelace>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    import("../second-load");
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
      this._error = err;
      return;
    }
    const connection = await createConnection({ auth });
    if (this.hass) {
      this.hass.connection.close();
    }
    this.initializeHass(auth, connection);
  }

  private _handleShowLovelaceMessage(msg: ShowLovelaceMessage) {
    this._lovelaceConfig = msg.config;
  }

  private _handleBreakFreeMessage(_msg: BreakFreeMessage) {
    const controls = document.body.querySelector("touch-controls");
    if (controls) {
      controls.remove();
    }
  }

  // private respondMessage(msg: HassMessage, response: any) {
  //   // @ts-ignore
  //   castContext.sendCustomMessage(HAST_NS, msg.senderId, response);
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-main": HcMain;
  }
}
