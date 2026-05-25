import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SlInput } from "@shoelace-style/shoelace";
import { SignalWatcher, html } from "@lit-labs/signals";
import { SimulationInitOptions } from "@/simulation/Simulation.worker";
import { useForm } from "@/composables/useForm";
import { createInputHandler } from "@/utils/handleInput";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

export type ConfigurationChangeEvent = CustomEvent<
  Partial<SimulationInitOptions>
>;

@customElement("simulation-pre-configuration-aside")
export class SimulationPreConfigurationAside extends SignalWatcher(
  LitElementWw,
) {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  form = useForm<Partial<SimulationInitOptions>>({}, () => {
    this.emitFormConfigurationChange();
  });

  emitFormConfigurationChange() {
    this.dispatchEvent(
      new CustomEvent<Partial<SimulationInitOptions>>("configuration-change", {
        detail: this.form.formValue.get(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static readonly scopedElements = {
    "sl-input": SlInput,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static readonly styles = css`
    #pre-configuration-container {
      display: flex;
      flex-direction: row;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="pre-configuration-container">
        <h3>Configuration</h3>
        <sl-input
          label="Seed"
          .value="${this.form.formValue.get().seed ?? ""}"
          @input="${createInputHandler((e) =>
            this.form.updateFormValue("seed", e),
          )}"
        >
        </sl-input>
      </div>
    `;
  }
}
