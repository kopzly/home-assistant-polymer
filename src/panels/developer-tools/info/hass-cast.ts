import {
  customElement,
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  property,
} from "lit-element";
import { loadJS } from "../../../common/dom/load_resource";
import "../../../components/ha-card";
import { HomeAssistant } from "../../../types";
import "../../../components/entity/ha-entity-picker";

interface SessionStateChangedEvent {
  type: "sessionstatechanged";
  sessionState:
    | "SESSION_STARTING"
    | "SESSION_STARTED"
    | "SESSION_RESUMED"
    | "SESSION_ENDING"
    | "SESSION_ENDED"
    | "SESSION_START_FAILED";
  errorCode: null | "cancel";
  session: null | {};
}

@customElement("hass-cast")
class HassCast extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() private _connected = false;

  protected render(): TemplateResult | void {
    return html`
      <ha-card header="Hass Cast">
        <div class="content">
          <div class="connect">
            <google-cast-launcher></google-cast-launcher>
          </div>
          ${this._connected
            ? html`
                <div class="actions">
                  <ha-entity-picker
                    label="Entity to track"
                    domain-filter="light"
                    .hass=${this.hass}
                  ></ha-entity-picker>
                  <mwc-button @click=${this._trackEntity}>Track</mwc-button>
                  <br /><br /><br />
                  <mwc-button @click=${this._breakFree}>Break Free</mwc-button>
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    window["__onGCastApiAvailable"] = (isAvailable) =>
      this._onCastAvailable(isAvailable);

    loadJS(
      "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
    );
  }

  private _onCastAvailable(isAvailable: boolean) {
    if (!isAvailable) {
      console.log("CAST NOT AVAILABLE");
      return;
    }
    console.log("INIT CAST");
    const context = this._castContext;
    context.setOptions({
      receiverApplicationId: "B12CE3CA",
      // @ts-ignore
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
    context.addEventListener(
      // @ts-ignore
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      (ev: SessionStateChangedEvent) => {
        if (ev.sessionState === "SESSION_STARTED") {
          this._castSessionEstablished();
        }
      }
    );
  }

  private _sendCastMessage(msg) {
    this._castSession.sendMessage("urn:x-cast:com.nabucasa.hast", msg);
  }

  private _castSessionEstablished() {
    this._sendCastMessage({
      type: "connect",
      refreshToken: this.hass.auth.data.refresh_token,
      clientId: this.hass.auth.data.clientId,
      hassUrl: "http://192.168.1.234:8123",
    });
    this._connected = true;
  }

  private get _castContext(): any {
    // @ts-ignore
    return cast.framework.CastContext.getInstance();
  }

  private get _castSession(): any {
    return this._castContext.getCurrentSession();
  }

  private _trackEntity() {
    const picker = this.shadowRoot!.querySelector("ha-entity-picker")!;

    const entityId = picker.value;
    if (!entityId) {
      return;
    }
    this._sendCastMessage({
      type: "track_entity",
      entityId,
    });
    picker.value = "";
  }

  private _breakFree() {
    this._sendCastMessage({
      type: "break_free",
    });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        text-align: left;
        display: block;
        max-width: 300px;
      }
      .content {
        padding: 0 16px 16px;
      }
      .connect {
        max-width: 50px;
      }
      .actions {
        margin-top: 16px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hass-cast": HassCast;
  }
}
