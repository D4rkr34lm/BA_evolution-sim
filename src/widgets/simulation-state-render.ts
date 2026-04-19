import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, query } from "lit/decorators.js";
import { Application, Container, Sprite, TilingSprite } from "pixi.js";
import { AgentSnapshot, SimulationSnapshot } from "@/simulation/serialization";
import { hasValue } from "@/utils/typeGuards";
import { Textures } from "./assets";
import { SimulationMetadata } from "@/simulation/running";
import { Vec2 } from "@/simulation/position";
import { useSimulationStore } from "@/composables/simulationStore";
import { effect } from "signal-utils/subtle/microtask-effect";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

const BASE_TILE_SIZE = 64;
class BackgroundRenderer {
  readonly root: Container;
  readonly backgroundTilesSprite: TilingSprite;

  constructor() {
    const tileScale: Vec2 = {
      x: BASE_TILE_SIZE / Textures.backgroundTile.width,
      y: BASE_TILE_SIZE / Textures.backgroundTile.height,
    };

    this.backgroundTilesSprite = new TilingSprite({
      texture: Textures.backgroundTile,
      tileScale,
    });

    this.root = new Container();
  }

  update(worldSize: Vec2) {
    const backgroundTileSize = {
      width: BASE_TILE_SIZE * worldSize.x,
      height: BASE_TILE_SIZE * worldSize.y,
    };

    this.backgroundTilesSprite.setSize(backgroundTileSize);
  }
}
class AgentRenderer {
  readonly root: Container;
  readonly bodySprite: Sprite;

  constructor(agentSnapshot: AgentSnapshot) {
    this.root = new Container();
    this.bodySprite = new Sprite({
      texture: Textures.agent,
      width: BASE_TILE_SIZE,
      height: BASE_TILE_SIZE,
    });
    this.root.addChild(this.bodySprite);

    this.update(agentSnapshot);
  }

  update(agentSnapshot: AgentSnapshot) {
    this.bodySprite.x = agentSnapshot.state.position.x;
    this.bodySprite.y = agentSnapshot.state.position.y;
  }
}

function useSimulationRenderer() {
  const rootContainer = new Container();
  const backgroundRenderer = new BackgroundRenderer();
  const agentRendererCache = new Map<string, AgentRenderer>();

  rootContainer.addChild(backgroundRenderer.root);

  function updateAgents(snapshots: AgentSnapshot[]) {
    // Remove agents no longer existent
    const oldAgentIds = [...agentRendererCache.keys()];
    const newAgentIds = new Set(snapshots.map((sp) => sp.id));
    const removedAgents = oldAgentIds
      .filter((id) => !newAgentIds.has(id))
      .map((id) => agentRendererCache.get(id))
      .filter(hasValue);

    for (const removedAgent of removedAgents) {
      rootContainer.removeChild(removedAgent.root);
    }

    // Create or update agent renderers
    for (const snapshot of snapshots) {
      const cachedRenderer = agentRendererCache.get(snapshot.id);

      if (hasValue(cachedRenderer)) {
        cachedRenderer.update(snapshot);
      } else {
        const newRenderer = new AgentRenderer(snapshot);
        agentRendererCache.set(snapshot.id, newRenderer);
      }
    }
  }

  function update(
    metadata: SimulationMetadata,
    snapshot: SimulationSnapshot | null,
  ) {
    backgroundRenderer.update(metadata.worldSize);

    updateAgents(snapshot?.agents ?? []);
  }

  return {
    root: rootContainer,
    update,
  };
}

@customElement("simulation-state-render")
export class SimulationStateRender extends LitElementWw {
  /* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
  localize = LOCALIZE
  */

  simulationStore = useSimulationStore();

  @query("#simulation-container")
  accessor canvasContainer!: HTMLDivElement;

  app: Application | null = null;
  renderer = useSimulationRenderer();

  private async setupCanvas() {
    const app = new Application();

    await app.init({ resizeTo: this.canvasContainer, background: "#FFFFFF" });
    this.canvasContainer.appendChild(app.canvas);

    this.app = app;
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

    effect(() => {
      const store = this.simulationStore.get();

      if (store.isInitialized) {
        this.renderer.update(store.metadata, store.activeSnapshot);
      }
    });
  }
}
