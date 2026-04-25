import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SignalWatcher, html } from "@lit-labs/signals";
import { useSimulationStore } from "@/composables/simulationStore";
import { SlInput } from "@shoelace-style/shoelace";
import { useForm } from "@/composables/useForm";
import { SimulationInitOptions } from "@/simulation/Simulation.worker";
import {
  SIMULATION_FOOD_AMOUNT,
  SIMULATION_INITIAL_AGENT_COUNT,
  SIMULATION_WORLD_SIZE,
} from "@/simulation/constants";
import { SlButton } from "@shoelace-style/shoelace";
import { createInputHandler } from "@/utils/handleInput";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("simulation-configuration-view")
export class SimulationConfigurationView extends SignalWatcher(LitElementWw) {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  form = useForm<SimulationInitOptions>({
    worldSize: SIMULATION_WORLD_SIZE,
    initialAgentsAmount: SIMULATION_INITIAL_AGENT_COUNT,
    initialFoodSourcesAmount: SIMULATION_FOOD_AMOUNT,
  });
  simulationStore = useSimulationStore();

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {
    "sl-input": SlInput,
    "sl-button": SlButton,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css`
    #root {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .flex-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="root">
        <div class="flex-row">
          <sl-input
            label="World Width"
            .value="${this.form.formValue.get().worldSize.x}"
            @input="${createInputHandler((e) =>
              this.form.updateFormValue("worldSize.x", Number(e)),
            )}"
          ></sl-input>
          <sl-input
            type="number"
            label="World Height"
            .value="${this.form.formValue.get().worldSize.y}"
            @input="${createInputHandler((e) =>
              this.form.updateFormValue("worldSize.y", Number(e)),
            )}"
          ></sl-input>
        </div>
        <sl-input
          label="Initial Agents Amount"
          .value="${this.form.formValue.get().initialAgentsAmount}"
          @input="${createInputHandler((e) =>
            this.form.updateFormValue("initialAgentsAmount", Number(e)),
          )}"
        ></sl-input>
        <sl-input
          label="Initial Food Sources Amount"
          .value="${this.form.formValue.get().initialFoodSourcesAmount}"
          @input="${createInputHandler((e) =>
            this.form.updateFormValue("initialFoodSourcesAmount", Number(e)),
          )}"
        ></sl-input>
        <sl-button
          @click="${() =>
            this.simulationStore.initializeNewSimulation(
              this.form.formValue.get(),
            )}"
        >
          Start simulation
        </sl-button>
      </div>
    `;
  }
}
