import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SimulationRunView } from "./simulation-run-view";
import { SignalWatcher, html } from "@lit-labs/signals";
import { hasValue } from "@/utils/typeGuards";
import { useSimulationStore } from "@/composables/simulationStore";
import { when } from "lit/directives/when.js";
import { SimulationConfigurationView } from "./simulation-configuration-view";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("webwriter-evolution-sim")
export class WebwriterEvolutionSim extends SignalWatcher(LitElementWw) {
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
    "simulation-run-view": SimulationRunView,
    "simulation-configuration-view": SimulationConfigurationView,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css`
    #root {
      display: flex;
      flex-direction: column;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="root">
        ${when(
          hasValue(this.simulationStore.currentActiveSimulationData.get()),
          () => html` <simulation-run-view></simulation-run-view> `,
          () => html`
            <simulation-configuration-view></simulation-configuration-view>
          `,
        )}
      </div>
    `;
  }
}
