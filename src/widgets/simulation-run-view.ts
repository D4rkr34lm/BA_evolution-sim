import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { SimulationStateRender } from "./simulation-state-render";
import { SimulationControlsBar } from "./simulation-controls-bar";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

@customElement("simulation-run-view")
export class SimulationRunView extends LitElementWw {
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
    "simulation-controls-bar": SimulationControlsBar,
  };

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css`
    #root {
      display: flex;
      flex-direction: column;
    }

    #bottom-bar {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html`
      <div id="root">
        <simulation-state-render></simulation-state-render>
        <div id="bottom-bar">
          <simulation-controls-bar></simulation-controls-bar>
          <span> Current Tick: unknown </span>
        </div>
      </div>
    `;
  }
}
