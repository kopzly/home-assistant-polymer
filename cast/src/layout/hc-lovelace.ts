import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  CSSResult,
  css,
  property,
} from "lit-element";
import { LovelaceConfig } from "../../../src/data/lovelace";
import "../../../src/panels/lovelace/hui-view";
import { HomeAssistant } from "../../../src/types";
import { Lovelace } from "../../../src/panels/lovelace/types";

@customElement("hc-lovelace")
class HcLovelace extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public lovelaceConfig!: LovelaceConfig;

  protected render(): TemplateResult | void {
    const lovelace: Lovelace = {
      config: this.lovelaceConfig,
      editMode: false,
      enableFullEditMode: () => undefined,
      mode: "storage",
      language: "en",
      saveConfig: async () => undefined,
      setEditMode: () => undefined,
    };
    return html`
      <hui-view
        .hass=${this.hass}
        .lovelace=${lovelace}
        columns="2"
        index="0"
      ></hui-view>
    `;
  }

  static get styles(): CSSResult {
    return css`
      hui-view {
        height: 100vh;
        padding: 16px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-lovelace": HcLovelace;
  }
}
