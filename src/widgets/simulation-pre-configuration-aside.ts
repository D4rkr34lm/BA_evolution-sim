import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SlCard, SlInput, SlSwitch } from "@shoelace-style/shoelace";
import { SignalWatcher, html } from "@lit-labs/signals";
import { SimulationInitOptions } from "@/simulation/Simulation.worker";
import { useForm } from "@/composables/useForm";
import { createInputHandler } from "@/utils/handleInput";
import { DEFAULT_GRAPH_OPTIONS, GraphConfig } from "./simulation-analysis-view";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

export type SimulationConfiguration = {
  seed: SimulationInitOptions["seed"];
  graphs: GraphConfig;
};

export type ConfigurationChangeEvent = CustomEvent<SimulationConfiguration>;

@customElement("simulation-pre-configuration-aside")
export class SimulationPreConfigurationAside extends SignalWatcher(
  LitElementWw,
) {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  form = useForm<SimulationConfiguration>(
    {
      seed: "",
      graphs: {
        enabled: true,
        showPopulationGraph: true,
        showFoodAvailabilityGraph: true,
        showAlleleShareGraph: true,
        showAlleleHistoricShareGraph: true,
      },
    },
    () => {
      this.emitFormConfigurationChange();
    },
  );

  emitFormConfigurationChange() {
    console.log("INFO - Change configuration", this.form.formValue.get());

    this.dispatchEvent(
      new CustomEvent<SimulationConfiguration>("configuration-change", {
        detail: this.form.formValue.get(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  toggleGraphOption(option: keyof SimulationConfiguration["graphs"]) {
    this.form.updateFormValue("graphs", {
      ...DEFAULT_GRAPH_OPTIONS,
      ...this.form.formValue.get().graphs,
      [option]: !this.form.formValue.get().graphs?.[option],
    });
  }

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static readonly scopedElements = {
    "sl-input": SlInput,
    "sl-card": SlCard,
    "sl-switch": SlSwitch,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static readonly styles = css`
    #pre-configuration-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .config-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-left: 1rem;
    }

    h4 {
      margin: 0.5rem;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="pre-configuration-container">
        <h3>Configuration</h3>
        <sl-card>
          <sl-input
            label="Seed"
            .value="${this.form.formValue.get().seed ?? ""}"
            @input="${createInputHandler((e) =>
              this.form.updateFormValue("seed", e),
            )}"
          >
          </sl-input>
        </sl-card>
        <sl-card>
          <div class="config-container">
            <h4>Graphs</h4>
            <sl-switch
              .checked="${this.form.formValue.get().graphs?.enabled ?? true}"
              @input="${() => this.toggleGraphOption("enabled")}"
            >
              Enabled
            </sl-switch>
            <sl-switch
              .disabled="${!this.form.formValue.get().graphs?.enabled}"
              .checked="${this.form.formValue.get().graphs
                ?.showPopulationGraph ?? true}"
              @input="${() => this.toggleGraphOption("showPopulationGraph")}"
            >
              Show Population Graph
            </sl-switch>
            <sl-switch
              .disabled="${!this.form.formValue.get().graphs?.enabled}"
              .checked="${this.form.formValue.get().graphs
                ?.showFoodAvailabilityGraph ?? true}"
              @input="${() =>
                this.toggleGraphOption("showFoodAvailabilityGraph")}"
            >
              Show Food Availability Graph
            </sl-switch>
            <sl-switch
              .disabled="${!this.form.formValue.get().graphs?.enabled}"
              .checked="${this.form.formValue.get().graphs
                ?.showAlleleShareGraph ?? true}"
              @input="${() => this.toggleGraphOption("showAlleleShareGraph")}"
            >
              Show Allele Share Graph
            </sl-switch>
            <sl-switch
              .disabled="${!this.form.formValue.get().graphs?.enabled}"
              .checked="${this.form.formValue.get().graphs
                ?.showAlleleHistoricShareGraph ?? true}"
              @input="${() =>
                this.toggleGraphOption("showAlleleHistoricShareGraph")}"
            >
              Show Allele Historic Share Graph
            </sl-switch>
          </div>
        </sl-card>
      </div>
    `;
  }
}
