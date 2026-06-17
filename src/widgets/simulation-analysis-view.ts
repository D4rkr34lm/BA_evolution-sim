import { css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";
import { computed, html, signal, SignalWatcher } from "@lit-labs/signals";
import { ChartData, ChartOptions } from "chart.js";
import { SlOption, SlSelect } from "@shoelace-style/shoelace";
import { useSimulationStore } from "@/composables/simulationStore";
import {
  definedGenes,
  GeneName,
  getDefinedGene,
} from "@/simulation/genetics/definitions";
import { ChartWrapper } from "./chart-wrapper";
import {
  createAlleleShareOverTimeSeries,
  createCurrentAlleleDistribution,
  createPopulationSeries,
  DEFAULT_HISTORY_SUBSET_PRESET,
  getAlleleColor,
  getAllelesForGene,
  getHistorySubset,
  HISTORY_SUBSET_OPTIONS,
  HistorySubsetPreset,
} from "./utils/simulationAnalysis";

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

@customElement("simulation-analysis-view")
export class SimulationAnalysisView extends SignalWatcher(LitElementWw) {
  simulationStore = useSimulationStore();

  private readonly selectedHistorySubsetPreset = signal<HistorySubsetPreset>(
    DEFAULT_HISTORY_SUBSET_PRESET,
  );
  private readonly selectedHistoryGene = signal<GeneName>(DEFAULT_GENE_NAME);
  private readonly selectedHistoryAllele = signal("all");
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

  private readonly historyAlleles = computed(() =>
    getAllelesForGene(this.historySubset.get(), this.selectedHistoryGene.get()),
  );

  private readonly selectedHistoryAlleles = computed(() => {
    const availableAlleles = this.historyAlleles.get();
    const selectedAllele = this.selectedHistoryAllele.get();

    if (selectedAllele === "all") {
      return availableAlleles;
    }

    const numericAllele = Number(selectedAllele);

    return availableAlleles.includes(numericAllele)
      ? [numericAllele]
      : availableAlleles;
  });

  private readonly alleleHistoryChartData = computed<ChartData>(() => ({
    datasets: createAlleleShareOverTimeSeries({
      snapshots: this.historySubset.get(),
      geneName: this.selectedHistoryGene.get(),
      alleles: this.selectedHistoryAlleles.get(),
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
    "sl-select": SlSelect,
    "sl-option": SlOption,
  };

  static readonly styles = css`
    #analysis-container {
      display: grid;
      gap: 1rem;
      width: 100%;
    }

    .analysis-header,
    .chart-card,
    .controls-row {
      box-sizing: border-box;
    }

    .analysis-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: var(--sl-border-radius-medium);
      background: var(--sl-color-neutral-0);
      padding: 1rem;
    }

    .analysis-title {
      margin: 0;
      font-size: 1.15rem;
    }

    .analysis-description {
      color: var(--sl-color-neutral-700);
      margin: 0.35rem 0 0;
      max-width: 52rem;
      line-height: 1.4;
    }

    .history-control {
      min-width: 13rem;
    }

    .warning {
      color: var(--sl-color-warning-700);
      font-size: 0.85rem;
      margin: 0.5rem 0 0;
      text-align: right;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
      gap: 1rem;
    }

    .chart-card {
      display: grid;
      gap: 1rem;
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: var(--sl-border-radius-medium);
      background: var(--sl-color-neutral-0);
      padding: 1rem;
      min-width: 0;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .chart-title {
      margin: 0;
      font-size: 1rem;
    }

    .chart-description {
      color: var(--sl-color-neutral-700);
      margin: -0.5rem 0 0;
      line-height: 1.4;
    }

    .controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .controls-row sl-select {
      min-width: 12rem;
    }

    @media (max-width: 700px) {
      .analysis-header {
        display: grid;
        align-items: stretch;
      }

      .warning {
        text-align: left;
      }
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
    this.selectedHistoryAllele.set("all");
  }

  private handleHistoryAlleleChange(event: Event) {
    this.selectedHistoryAllele.set(this.getSelectValue(event));
  }

  private handleCurrentGeneChange(event: Event) {
    this.selectedCurrentGene.set(this.getSelectValue(event) as GeneName);
  }

  private renderGeneOptions() {
    return definedGenes.map(
      (gene) => html`<sl-option value=${gene.name}>${gene.label}</sl-option>`,
    );
  }

  render() {
    const selectedHistorySubsetPreset = this.selectedHistorySubsetPreset.get();
    const selectedHistorySubsetOption = HISTORY_SUBSET_OPTIONS.find(
      (option) => option.value === selectedHistorySubsetPreset,
    );
    const selectedHistoryGene = getDefinedGene(this.selectedHistoryGene.get());
    const selectedCurrentGene = getDefinedGene(this.selectedCurrentGene.get());
    const historyAlleles = this.historyAlleles.get();
    const selectedHistoryAllele = this.selectedHistoryAllele.get();
    const selectedHistoryAlleleValue = historyAlleles.includes(
      Number(selectedHistoryAllele),
    )
      ? selectedHistoryAllele
      : "all";

    return html`
      <section id="analysis-container" aria-labelledby="analysis-heading">
        <div class="analysis-header">
          <div>
            <h2 id="analysis-heading" class="analysis-title">
              Population analysis
            </h2>
            <p class="analysis-description">
              These graphs connect individual genomes to population-level change
              by showing population size and allele frequencies over time.
            </p>
          </div>
          <div>
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
        </div>

        <div class="chart-grid">
          <article class="chart-card wide-card">
            <h3 class="chart-title">Population development</h3>
            <p class="chart-description">
              Tracks the number of living agents across the selected history
              window.
            </p>
            <chart-wrapper
              type="line"
              label="Population development"
              .data=${this.populationChartData.get()}
              .chartOptions=${populationChartOptions}
            ></chart-wrapper>
          </article>

          <article class="chart-card wide-card">
            <h3 class="chart-title">Gene distribution over time</h3>
            <p class="chart-description">
              Shows how allele shares for ${selectedHistoryGene.label} change
              over the selected history window.
            </p>
            <div class="controls-row">
              <sl-select
                label="Gene"
                .value=${this.selectedHistoryGene.get()}
                @sl-change=${this.handleHistoryGeneChange}
              >
                ${this.renderGeneOptions()}
              </sl-select>
              <sl-select
                label="Allele"
                .value=${selectedHistoryAlleleValue}
                ?disabled=${historyAlleles.length === 0}
                @sl-change=${this.handleHistoryAlleleChange}
              >
                <sl-option value="all">All alleles</sl-option>
                ${historyAlleles.map(
                  (allele) => html`
                    <sl-option value=${String(allele)}
                      >Allele ${allele}</sl-option
                    >
                  `,
                )}
              </sl-select>
            </div>
            <chart-wrapper
              type="line"
              label="Gene distribution over time"
              .data=${this.alleleHistoryChartData.get()}
              .chartOptions=${alleleShareLineOptions}
            ></chart-wrapper>
          </article>

          <article class="chart-card wide-card">
            <h3 class="chart-title">Current gene distribution</h3>
            <p class="chart-description">
              Shows the current allele shares for ${selectedCurrentGene.label}.
            </p>
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
          </article>
        </div>
      </section>
    `;
  }
}
