import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { computed, html, signal, SignalWatcher } from "@lit-labs/signals";
import { ChartData, ChartOptions } from "chart.js";
import { SlCard, SlOption, SlSelect } from "@shoelace-style/shoelace";
import { useSimulationStore } from "@/composables/simulationStore";
import { definedGenes, GeneName } from "@/simulation/genetics/definitions";
import { ChartWrapper } from "./chart-wrapper";
import {
  createAlleleShareOverTimeSeries,
  createCurrentAlleleDistribution,
  createFoodAvailabilitySeries,
  createPopulationSeries,
  DEFAULT_HISTORY_SUBSET_PRESET,
  getAlleleColor,
  getHistorySubset,
  HISTORY_SUBSET_OPTIONS,
  HistorySubsetPreset,
} from "./utils/simulationAnalysis";
import { hasValue } from "@/utils/typeGuards";
import { isEmpty } from "lodash-es";

const DEFAULT_GENE_NAME: GeneName = definedGenes[0].name;

const populationChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "linear",
      title: {
        display: true,
        text: "Tick",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Agents",
      },
    },
  },
};

const foodAvailabilityChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "linear",
      title: {
        display: true,
        text: "Tick",
      },
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: "Available food",
      },
      ticks: {
        callback: (value) => `${Math.round(Number(value) * 100)}%`,
      },
    },
  },
};

const alleleShareLineOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "linear",
      title: {
        display: true,
        text: "Tick",
      },
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: "Allele share",
      },
      ticks: {
        callback: (value) => `${Math.round(Number(value) * 100)}%`,
      },
    },
  },
};

const currentDistributionOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: "Allele",
      },
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: "Current share",
      },
      ticks: {
        callback: (value) => `${Math.round(Number(value) * 100)}%`,
      },
    },
  },
};

export interface GraphConfig {
  enabled: boolean;
  showPopulationGraph: boolean;
  showFoodAvailabilityGraph: boolean;
  showAlleleHistoricShareGraph: boolean;
  showAlleleShareGraph: boolean;
}

export const DEFAULT_GRAPH_OPTIONS = {
  enabled: true,
  showPopulationGraph: true,
  showFoodAvailabilityGraph: true,
  showAlleleHistoricShareGraph: true,
  showAlleleShareGraph: true,
};

@customElement("simulation-analysis-view")
export class SimulationAnalysisView extends SignalWatcher(LitElementWw) {
  @property({ attribute: false })
  accessor configuration: GraphConfig = DEFAULT_GRAPH_OPTIONS;

  private readonly simulationStore = useSimulationStore();

  private readonly selectedHistorySubsetPreset = signal<HistorySubsetPreset>(
    DEFAULT_HISTORY_SUBSET_PRESET,
  );
  private readonly selectedHistoryGene = signal<GeneName>(DEFAULT_GENE_NAME);
  private readonly selectedCurrentGene = signal<GeneName>(DEFAULT_GENE_NAME);

  private readonly historySubset = computed(() =>
    getHistorySubset(
      Array.from(this.simulationStore.simulationHistory),
      this.selectedHistorySubsetPreset.get(),
    ),
  );

  private readonly populationChartData = computed<ChartData>(() => ({
    datasets: [
      {
        label: "Population",
        data: createPopulationSeries(this.historySubset.get()),
        borderColor: "hsl(211, 86%, 46%)",
        backgroundColor: "hsla(211, 86%, 46%, 0.14)",
        fill: true,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  }));

  private readonly foodAvailabilityChartData = computed<ChartData>(() => ({
    datasets: [
      {
        label: "Available food",
        data: createFoodAvailabilitySeries(this.historySubset.get()),
        borderColor: "hsl(142, 72%, 35%)",
        backgroundColor: "hsla(142, 72%, 35%, 0.14)",
        fill: true,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  }));

  private readonly alleleHistoryChartData = computed<ChartData>(() => ({
    datasets: createAlleleShareOverTimeSeries({
      snapshots: this.historySubset.get(),
      geneName: this.selectedHistoryGene.get(),
    }).map((series, index) => ({
      label: series.label,
      data: series.data,
      borderColor: getAlleleColor(series.allele, index),
      backgroundColor: getAlleleColor(series.allele, index),
      fill: false,
      pointRadius: 0,
      tension: 0.2,
    })),
  }));

  private readonly currentDistributionChartData = computed<ChartData>(() => {
    const snapshot =
      this.simulationStore.currentActiveSimulationData.get()?.snapshot ?? null;
    const distribution = createCurrentAlleleDistribution({
      snapshot,
      geneName: this.selectedCurrentGene.get(),
    });

    return {
      labels: distribution.map((entry) => String(entry.allele)),
      datasets: [
        {
          label: "Current allele share",
          data: distribution.map((entry) => entry.share),
          backgroundColor: distribution.map((entry, index) =>
            getAlleleColor(entry.allele, index),
          ),
        },
      ],
    };
  });

  static readonly scopedElements = {
    "chart-wrapper": ChartWrapper,
    "sl-card": SlCard,
    "sl-select": SlSelect,
    "sl-option": SlOption,
  };

  static readonly styles = css`
    #analysis-container {
      display: grid;
      width: 100%;
    }

    .warning {
      color: var(--sl-color-warning-700);
      font-size: 0.85rem;
      margin: 0.5rem 0 0;
      text-align: right;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
      padding: 0 1rem 1rem;
    }

    .graph-panel {
      display: grid;
      gap: 0.75rem;
      min-width: 0;
      --chart-height: 14rem;
    }

    .chart-title {
      margin: 0;
      font-size: 1rem;
    }

    .controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    #header {
      gap: 1rem;
      padding: 1rem;
      align-items: center;
      justify-content: space-between;
    }
  `;

  private getSelectValue(event: Event) {
    return (event.target as unknown as { value: string }).value;
  }

  private handleHistorySubsetChange(event: Event) {
    this.selectedHistorySubsetPreset.set(
      this.getSelectValue(event) as HistorySubsetPreset,
    );
  }

  private handleHistoryGeneChange(event: Event) {
    this.selectedHistoryGene.set(this.getSelectValue(event) as GeneName);
  }

  private handleCurrentGeneChange(event: Event) {
    this.selectedCurrentGene.set(this.getSelectValue(event) as GeneName);
  }

  private renderGeneOptions() {
    return definedGenes.map(
      (gene) => html`<sl-option value=${gene.name}>${gene.label}</sl-option>`,
    );
  }

  private populationHistoryGraph() {
    return html` <article class="graph-panel">
      <h3 class="chart-title">Population development</h3>
      <chart-wrapper
        type="line"
        label="Population development"
        .data=${this.populationChartData.get()}
        .chartOptions=${populationChartOptions}
      ></chart-wrapper>
    </article>`;
  }

  private foodAvailabilityGraph() {
    return html` <article class="graph-panel">
      <h3 class="chart-title">Food availability</h3>
      <chart-wrapper
        type="line"
        label="Food availability"
        .data=${this.foodAvailabilityChartData.get()}
        .chartOptions=${foodAvailabilityChartOptions}
      ></chart-wrapper>
    </article>`;
  }

  private alleleShareOverTimeGraph() {
    return html` <article class="graph-panel">
      <h3 class="chart-title">Gene distribution over time</h3>
      <div class="controls-row">
        <sl-select
          label="Gene"
          .value=${this.selectedHistoryGene.get()}
          @sl-change=${this.handleHistoryGeneChange}
        >
          ${this.renderGeneOptions()}
        </sl-select>
      </div>
      <chart-wrapper
        type="line"
        label="Gene distribution over time"
        .data=${this.alleleHistoryChartData.get()}
        .chartOptions=${alleleShareLineOptions}
      ></chart-wrapper>
    </article>`;
  }

  private currentAlleleDistributionGraph() {
    return html` <article class="graph-panel">
      <h3 class="chart-title">Current gene distribution</h3>
      <div class="controls-row">
        <sl-select
          label="Gene"
          .value=${this.selectedCurrentGene.get()}
          @sl-change=${this.handleCurrentGeneChange}
        >
          ${this.renderGeneOptions()}
        </sl-select>
      </div>
      <chart-wrapper
        type="bar"
        label="Current gene distribution"
        .data=${this.currentDistributionChartData.get()}
        .chartOptions=${currentDistributionOptions}
      ></chart-wrapper>
    </article>`;
  }

  render() {
    const selectedHistorySubsetPreset = this.selectedHistorySubsetPreset.get();
    const selectedHistorySubsetOption = HISTORY_SUBSET_OPTIONS.find(
      (option) => option.value === selectedHistorySubsetPreset,
    );

    const {
      showAlleleHistoricShareGraph,
      showAlleleShareGraph,
      showFoodAvailabilityGraph,
      showPopulationGraph,
    } = this.configuration;

    const configuredGraphs = [
      showAlleleHistoricShareGraph ? this.alleleShareOverTimeGraph() : null,
      showAlleleShareGraph ? this.currentAlleleDistributionGraph() : null,
      showFoodAvailabilityGraph ? this.foodAvailabilityGraph() : null,
      showPopulationGraph ? this.populationHistoryGraph() : null,
    ].filter(hasValue);

    if (!this.configuration.enabled || isEmpty(configuredGraphs)) {
      return html``;
    }

    return html`
      <section id="analysis-container" aria-labelledby="analysis-heading">
        <div id="header">
          <sl-select
            class="history-control"
            label="History window"
            .value=${selectedHistorySubsetPreset}
            @sl-change=${this.handleHistorySubsetChange}
          >
            ${HISTORY_SUBSET_OPTIONS.map(
              (option) => html`
                <sl-option value=${option.value}>${option.label}</sl-option>
              `,
            )}
          </sl-select>
          ${selectedHistorySubsetOption?.mayLag
            ? html`<p class="warning">
                Full history may lag during long simulations.
              </p>`
            : null}
        </div>
        <div class="chart-grid">${configuredGraphs}</div>
      </section>
    `;
  }
}
