import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, query } from "lit/decorators.js";
import { Application, Container, Sprite, TilingSprite } from "pixi.js";
import { AgentSnapshot, SimulationSnapshot } from "@/simulation/serialization";
import { hasValue } from "@/utils/typeGuards";
import { Textures } from "./assets";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

const BASE_TILE_SIZE = 64;

class AgentRenderer {
  root: Container;
  bodySprite: Sprite;

  constructor(agentSnapshot: AgentSnapshot) {
    this.root = new Container();
    this.bodySprite = new Sprite({
      texture: Textures.agent,
    });
    this.root.addChild(this.bodySprite);

    this.update(agentSnapshot);
  }

  update(agentSnapshot: AgentSnapshot) {
    this.bodySprite.x = agentSnapshot.state.position.x;
    this.bodySprite.y = agentSnapshot.state.position.y;
  }
}

@customElement("simulation-state-render")
export class SimulationStateRender extends LitElementWw {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  @query("#simulation-container")
  accessor canvasContainer!: HTMLDivElement;

  app: Application | null = null;

  activeRenderedEntities: { [id: string]: AgentRenderer } = {};
  backgroundTileSprite: TilingSprite | null = null;

  private async setupCanvas() {
    const app = new Application();

    await app.init({ resizeTo: this.canvasContainer, background: "#FFFFFF" });
    this.canvasContainer.appendChild(app.canvas);

    this.app = app;
  }

  private renderSimulation(simulationSnapshot: SimulationSnapshot) {
    if (!this.app) return;

    this.app.stage.addChild(backgroundTileSprite);

    for (const agentSnapshot of simulationSnapshot.agents) {
      const activeRenderer = this.activeRenderedEntities[agentSnapshot.id];

      if (hasValue(activeRenderer)) {
        activeRenderer.update(agentSnapshot);
      } else {
        const newRenderer = new AgentRenderer(agentSnapshot);
        this.activeRenderedEntities[agentSnapshot.id] = newRenderer;
        this.app.stage.addChild(newRenderer.root);
      }
    }
  }

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {};

  /** Put the styles for your Shadow DOM (what is rendered through render()) here. */
  static styles = css`
    #simulation-container {
      width: 100%;
      aspect-ratio: 16 / 9;
    }
  `;

  /** Define your template here and return it. */
  render() {
    return html` <div id="simulation-container"></div> `;
  }

  async firstUpdated() {
    await this.setupCanvas();

    // TODO remove
    setTimeout(() => {
      this.renderSimulation({
        tick: 0,
        agents: [
          {
            id: "agent1",
            state: {
              position: { x: 100, y: 100 },
              currentEnergy: 50,
            },
          },
          {
            id: "agent2",
            state: {
              position: { x: 200, y: 150 },
              currentEnergy: 80,
            },
          },
        ],
        foodSources: [],
      });
    }, 1000);
  }
}
