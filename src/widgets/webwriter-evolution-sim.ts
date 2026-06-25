import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { SimulationRunView } from "./simulation-run-view";
import { SignalWatcher, html } from "@lit-labs/signals";
import { hasValue } from "@/utils/typeGuards";
import { useSimulationStore } from "@/composables/simulationStore";
import { when } from "lit/directives/when.js";
import { SimulationConfigurationView } from "./simulation-configuration-view";
import {
  ConfigurationChangeEvent,
  SimulationConfiguration,
  SimulationPreConfigurationAside,
} from "./simulation-pre-configuration-aside";
import { SimulationInitOptions } from "@/simulation/Simulation.worker";

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
  static readonly scopedElements = {
    "simulation-run-view": SimulationRunView,
    "simulation-configuration-view": SimulationConfigurationView,
    "simulation-pre-configuration-aside": SimulationPreConfigurationAside,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static readonly styles = css`
    #root {
      display: flex;
      flex-direction: column;
    }
  `;

  @property({ attribute: false })
  accessor simulationPreConfiguration: Partial<SimulationConfiguration> | null =
    null;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="root">
        <simulation-pre-configuration-aside
          part="options"
          @configuration-change="${(e: ConfigurationChangeEvent) => {
            this.simulationPreConfiguration = e.detail;
          }}"
        ></simulation-pre-configuration-aside>
        ${when(
          hasValue(this.simulationStore.currentActiveSimulationData.get()),
          () => html`
            <simulation-run-view
              .configuration=${this.simulationPreConfiguration}
            ></simulation-run-view>
          `,
          () => html`
            <simulation-configuration-view
              @start-simulation="${(e: CustomEvent<SimulationInitOptions>) => {
                const simulationPreConfiguration =
                  this.simulationPreConfiguration;

                this.simulationStore.initializeNewSimulation({
                  ...e.detail,
                  ...(hasValue(simulationPreConfiguration?.seed)
                    ? { seed: simulationPreConfiguration.seed }
                    : {}),
                });
              }}"
            ></simulation-configuration-view>
          `,
        )}
      </div>
    `;
  }
}
