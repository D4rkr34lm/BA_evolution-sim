import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { SignalWatcher, html } from "@lit-labs/signals";
import { SimulationConfiguration } from "./simulation-pre-configuration-aside";
import { SimulationInitOptions } from "@/simulation/Simulation.worker";
import { cloneDeep, set } from "lodash-es";
import { SlDialog } from "@shoelace-style/shoelace";
import { createInputHandler } from "@/utils/handleInput";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("webwriter-evolution-sim")
export class WebwriterEvolutionSim extends SignalWatcher(LitElementWw) {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static readonly scopedElements = {
    "sl-dialog": SlDialog,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static readonly styles = css``;

  @property({ attribute: false })
  accessor simulationConfiguration!: SimulationConfiguration;

  @property({ attribute: false })
  accessor open = false;

  private emitCreateNewSimulation(configuration: SimulationConfiguration) {
    console.log(
      "INFO - Create new simulation with configuration (student)",
      configuration,
    );

    this.dispatchEvent(
      new CustomEvent<SimulationConfiguration>("configuration-change", {
        detail: configuration,
        bubbles: true,
        composed: true,
      }),
    );
  }

  updateConfiguration(target: string, value: unknown) {
    this.simulationConfiguration = set(
      cloneDeep(this.simulationConfiguration),
      target,
      value,
    );
  }

  renderOptionConfigurator(label: string, option: keyof SimulationInitOptions) {
    const configurationValue = this.simulationConfiguration.initOptions[option];
    return html`
      <sl-input
        label=${label}
        value=${this.simulationConfiguration.initOptions[option].value}
        disabled=${configurationValue.locked}
        @input=${createInputHandler((value) =>
          this.updateConfiguration(`initOptions.${option}.value`, value),
        )}
      ></sl-input>
    `;
  }

  /** Define your template here and return it. */
  render() {
    const fieldsToRender = [
      { label: "Seed", option: "seed" },
      { label: "World Size", option: "worldSize" },
      { label: "Initial Agents", option: "initialAgentsAmount" },
      {
        label: "Initial Food Sources",
        option: "initialFoodSourcesAmount",
      },
    ];

    const configurationFields = fieldsToRender.map((field) =>
      this.renderOptionConfigurator(
        field.label,
        field.option as keyof SimulationInitOptions,
      ),
    );

    return html`
      <sl-dialog>
        <h3>Create Simulation</h3>
        <p>Create a new simulation with the following configuration:</p>
        ${configurationFields}
        <sl-button
          @click=${() =>
            this.emitCreateNewSimulation(this.simulationConfiguration)}
        >
          <sl-icon name="plus" slot="prefix"></sl-icon>
          Create
        </sl-button>
      </sl-dialog>
    `;
  }
}
