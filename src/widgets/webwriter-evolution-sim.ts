import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SimulationStateRender } from "./simulation-state-render";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("webwriter-evolution-sim")
export class WebwriterEvolutionSim extends LitElementWw {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {
    "simulation-state-render": SimulationStateRender,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css``;

  /** Define your template here and return it. */
  render() {
    return html` <simulation-state-render></simulation-state-render> `;
  }
}
