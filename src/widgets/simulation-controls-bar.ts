import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { useSimulationStore } from "@/composables/simulationStore";
import { SlButtonGroup, SlButton, SlIcon } from "@shoelace-style/shoelace";
import { when } from "lit/directives/when.js";
import { SignalWatcher, html } from "@lit-labs/signals";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("simulation-controls-bar")
export class SimulationControlsBar extends SignalWatcher(LitElementWw) {
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
    "sl-button-group": SlButtonGroup,
    "sl-button": SlButton,
    "sl-icon": SlIcon,
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
        <sl-button-group>
          ${when(
            this.simulationStore.isRunning.get(),
            () => html`
              <sl-button>
                <sl-icon
                  name="pause"
                  @click=${() => this.simulationStore.stopSimulation()}
                ></sl-icon>
                Pause
              </sl-button>
            `,
            () => html`
              <sl-button>
                <sl-icon
                  name="play"
                  @click=${() => this.simulationStore.startSimulation()}
                ></sl-icon>
                Start
              </sl-button>
            `,
          )}
          <!-- TODO implement reset / perhaps only after seeding mechanism ?
          <sl-button>
            <sl-icon name="arrow-clockwise"></sl-icon>
            Reset
          </sl-button>
        -->
        </sl-button-group>
      </div>
    `;
  }
}
