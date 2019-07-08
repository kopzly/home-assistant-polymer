import {
  LitElement,
  TemplateResult,
  CSSResult,
  css,
  customElement,
  html,
  property,
} from "lit-element";
import {
  HassEntity,
  Connection,
  callService,
} from "home-assistant-js-websocket";

@customElement("entity-state")
export class EntityStateElement extends LitElement {
  public entityId!: string;
  public connection!: Connection;
  @property() public stateObj?: HassEntity;
  @property() public allowToggle = false;

  protected render(): TemplateResult | void {
    if (!this.stateObj) {
      return html`
        Entity not available: ${this.entityId}
      `;
    }
    return html`
      ${this.stateObj.attributes.friendly_name || this.entityId}:
      ${this.stateObj.state}
      ${this.allowToggle
        ? html`
            <button @click=${this._handleToggle}>Toggle</button>
          `
        : ""}
    `;
  }

  private _handleToggle() {
    callService(this.connection, "light", "toggle", {
      entity_id: this.entityId,
    });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        margin: 4px;
        padding: 8px;
      }
      button {
        display: inline-block;
        margin-left: 24px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "entity-state": EntityStateElement;
  }
}
