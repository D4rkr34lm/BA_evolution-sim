import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { useSimulationStore } from "@/composables/simulationStore";
import { SlButton } from "@shoelace-style/shoelace";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("simulation-controls-bar")
export class SimulationControlsBar extends LitElementWw {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  simulationStore = useSimulationStore();

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {
    "sl-button": SlButton,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css`
    #controls-container {
      display: flex;
      flex-direction: row;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="controls-container">
        <sl-button variant="default"> Start </sl-button>
      </div>
    `;
  }
}
