import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { html } from "@lit-labs/signals";
import { SlButton, SlIcon } from "@shoelace-style/shoelace";
import {
  ManualSimulationTool,
  useSimulationStore,
} from "@/composables/simulationStore";
import { AgentSpriteData, FoodSourceSpriteData } from "./assets";
import { SIMULATION_TILE_SIZE } from "@/simulation/rendering";

@customElement("simulation-manual-tools")
export class SimulationManualTools extends LitElementWw {
  simulationStore = useSimulationStore();

  @property({ attribute: "widget-id" })
  accessor widgetId = "";

  static readonly scopedElements = {
    "sl-button": SlButton,
    "sl-icon": SlIcon,
  };

  static readonly styles = css`
    #manual-tools-container {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    #label {
      font-weight: 600;
    }

    sl-button[draggable="true"] {
      cursor: grab;
    }

    .tool-content {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .tool-sprite {
      width: ${SIMULATION_TILE_SIZE}px;
      height: ${SIMULATION_TILE_SIZE}px;
      object-fit: contain;
      image-rendering: pixelated;
    }

    .remove-tool::part(base) {
      color: var(--sl-color-danger-700);
      border-color: var(--sl-color-danger-500);
    }

    .remove-tool[disabled]::part(base) {
      color: var(--sl-color-danger-400);
      border-color: var(--sl-color-danger-200);
    }
  `;

  private startDrag(
    event: DragEvent,
    tool: ManualSimulationTool,
    dragImageSource?: string,
  ) {
    this.simulationStore.manualToolDnd.startDrag(tool, this.widgetId);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "copy";

      if (dragImageSource) {
        const dragImage = new Image(SIMULATION_TILE_SIZE, SIMULATION_TILE_SIZE);
        dragImage.src = dragImageSource;
        event.dataTransfer.setDragImage(dragImage, 8, 8);
      }
    }
  }

  private endDrag() {
    this.simulationStore.manualToolDnd.endDrag();
  }

  private renderSpriteToolButton({
    label,
    tool,
    spriteSource,
    disabled = false,
  }: {
    label: string;
    tool: ManualSimulationTool;
    spriteSource: string;
    disabled?: boolean;
  }) {
    return html`
      <sl-button
        size="small"
        draggable=${disabled ? "false" : "true"}
        ?disabled=${disabled}
        @dragstart=${(event: DragEvent) =>
          this.startDrag(event, tool, spriteSource)}
        @dragend=${() => this.endDrag()}
      >
        <span class="tool-content">
          <img class="tool-sprite" src=${spriteSource} alt="" />
          <span>${label}</span>
        </span>
      </sl-button>
    `;
  }

  private renderRemoveToolButton() {
    return html`
      <sl-button class="remove-tool" size="small" variant="danger" disabled>
        <span class="tool-content">
          <sl-icon name="eraser"></sl-icon>
          <span>Remove</span>
        </span>
      </sl-button>
    `;
  }

  render() {
    return html`
      <div id="manual-tools-container">
        <span id="label">Manual Tools:</span>
        ${this.renderSpriteToolButton({
          label: "Food Source",
          tool: "add-food-source",
          spriteSource: FoodSourceSpriteData,
        })}
        ${this.renderSpriteToolButton({
          label: "Agent",
          tool: "add-agent",
          spriteSource: AgentSpriteData,
          disabled: true,
        })}
        ${this.renderRemoveToolButton()}
      </div>
    `;
  }
}
