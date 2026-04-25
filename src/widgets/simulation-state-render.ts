import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, query } from "lit/decorators.js";
import { Application, Container, Sprite, TilingSprite } from "pixi.js";
import {
  AgentSnapshot,
  EntitySnapshot,
  FoodSourceSnapshot,
  SimulationSnapshot,
} from "@/simulation/serialization";
import { hasValue } from "@/utils/typeGuards";
import { Textures } from "./assets";
import { SimulationMetadata } from "@/simulation/running";
import { scaleVector, Vec2 } from "@/simulation/position";
import { useSimulationStore } from "@/composables/simulationStore";
import { effect } from "signal-utils/subtle/microtask-effect";

/* Optional LOCALIZATION: Uncomment this after first running `npm run localize` in the command line.
import LOCALIZE from '../localization/generated'
import {msg} from '@lit/localize'
*/

const BASE_TILE_SIZE = 16;
const FOOD_SOURCE_SIZE_FACTOR = 0.75;
const FOOD_SOURCE_TINT = 0x8bc34a;

function toTilePosition(vec: Vec2): Vec2 {
  return scaleVector(vec, BASE_TILE_SIZE);
}
interface EntitySnapshotRenderer<TSnapshot> {
  root: Container;
  update: (snapshot: TSnapshot) => void;
}

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

    this.root.addChild(this.backgroundTilesSprite);
  }

  update(worldSize: Vec2) {
    const backgroundTileSize = {
      width: BASE_TILE_SIZE * worldSize.x,
      height: BASE_TILE_SIZE * worldSize.y,
    };

    this.backgroundTilesSprite.setSize(backgroundTileSize);
  }
}
class AgentRenderer implements EntitySnapshotRenderer<AgentSnapshot> {
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
    const tilePosition = toTilePosition(agentSnapshot.state.position);

    this.bodySprite.x = tilePosition.x;
    this.bodySprite.y = tilePosition.y;
  }
}

class FoodSourceRenderer implements EntitySnapshotRenderer<FoodSourceSnapshot> {
  readonly root: Container;
  readonly bodySprite: Sprite;

  constructor(foodSourceSnapshot: FoodSourceSnapshot) {
    this.root = new Container();
    this.bodySprite = new Sprite({
      texture: Textures.foodSource,
      width: BASE_TILE_SIZE * FOOD_SOURCE_SIZE_FACTOR,
      height: BASE_TILE_SIZE * FOOD_SOURCE_SIZE_FACTOR,
    });
    this.root.addChild(this.bodySprite);

    this.update(foodSourceSnapshot);
  }

  update(foodSourceSnapshot: FoodSourceSnapshot) {
    const tilePosition = toTilePosition(foodSourceSnapshot.position);
    const centeredOffset = (BASE_TILE_SIZE * (1 - FOOD_SOURCE_SIZE_FACTOR)) / 2;

    this.bodySprite.x = tilePosition.x + centeredOffset;
    this.bodySprite.y = tilePosition.y + centeredOffset;
  }
}

class EntitySnapshotRendererCache<TSnapshot extends EntitySnapshot> {
  readonly rendererCache = new Map<string, EntitySnapshotRenderer<TSnapshot>>();

  constructor(
    private readonly rootContainer: Container,
    private readonly createRenderer: (
      snapshot: TSnapshot,
    ) => EntitySnapshotRenderer<TSnapshot>,
  ) {}

  update(snapshots: TSnapshot[]) {
    const oldIds = Array.from(this.rendererCache.keys());
    const nextIds = new Set(snapshots.map((sp) => sp.id));

    const removedIds = oldIds.filter((id) => !nextIds.has(id));
    const renderersToRemove = removedIds
      .map((id) => this.rendererCache.get(id))
      .filter(hasValue);

    removedIds.forEach((removedId) => this.rendererCache.delete(removedId));

    // Remove
    for (const removedRenderer of renderersToRemove) {
      this.rootContainer.removeChild(removedRenderer.root);
    }

    for (const snapshot of snapshots) {
      const snapshotId = snapshot.id;
      const cachedRenderer = this.rendererCache.get(snapshotId);
      // Update
      if (hasValue(cachedRenderer)) {
        cachedRenderer.update(snapshot);
      }
      // Create
      else {
        const newRenderer = this.createRenderer(snapshot);
        this.rendererCache.set(snapshotId, newRenderer);
        this.rootContainer.addChild(newRenderer.root);
      }
    }
  }
}

function useSimulationRenderer() {
  const rootContainer = new Container();
  const backgroundRenderer = new BackgroundRenderer();
  const agentRendererCache = new EntitySnapshotRendererCache<AgentSnapshot>(
    rootContainer,
    (snapshot) => new AgentRenderer(snapshot),
  );
  const foodSourceRendererCache =
    new EntitySnapshotRendererCache<FoodSourceSnapshot>(
      rootContainer,
      (snapshot) => new FoodSourceRenderer(snapshot),
    );

  rootContainer.addChild(backgroundRenderer.root);

  function update(
    metadata: SimulationMetadata,
    snapshot: SimulationSnapshot | null,
  ) {
    backgroundRenderer.update(metadata.worldSize);

    agentRendererCache.update(snapshot?.agents ?? []);
    foodSourceRendererCache.update(snapshot?.foodSources ?? []);
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
  unwatch: (() => void) | null = null;

  private async setupCanvas() {
    const app = new Application();

    await app.init({ resizeTo: this.canvasContainer, background: "#FFFFFF" });
    this.canvasContainer.appendChild(app.canvas);

    this.app = app;
    app.stage.addChild(this.renderer.root);
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

    this.unwatch = effect(() => {
      const data = this.simulationStore.currentActiveSimulationData.get();

      if (hasValue(data)) {
        this.renderer.update(data.metadata, data.snapshot);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.app?.destroy();
    this.unwatch?.();
  }
}
