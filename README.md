# Do Constitutions Shape Democracy?
### QSS 45 Final Project — Rishith Hakker

An ML-driven empirical study of whether constitutional design predicts democratic outcomes — and whether a growing gap between constitutional promise and democratic reality forecasts backsliding.

---

## Research Questions

1. **Can constitutional text predict democracy levels?** Using 14 structural dimensions scored from the Comparative Constitutions Project, how well can a gradient-boosting model explain V-Dem's Polyarchy scores?
2. **Does the constitutional gap predict decline?** If a constitution "promises" more democracy than a country delivers, does that gap widen before backsliding episodes?
3. **What role does democratic culture play?** How much predictive power does adding the EIU Democratic Culture Index add over constitutional features alone?
4. **Are there structural patterns?** Do older constitutions or more "ambitious" constitutions correlate with different democratic trajectories?

---

## Pipeline Overview

| Notebook | Description |
|---|---|
| `00_typology_pipeline.ipynb` | LLM-assisted pipeline: reads 14 CCP mapping JSONs, merges them, and scores each constitutional variable across 14 democratic dimensions to produce `typology/ccpc_typology_v4.json` |
| `02_score_dimensions.ipynb` | Applies the typology to all ~17,000 country-years in CCPCNC v5, producing a 0–1 score for each of the 14 dimensions (`ccpc_axis_scores_llm.csv`) |
| `03_predict_democracy.ipynb` | Country-blocked 5-fold CV with CatBoost: predicts `v2x_polyarchy` from constitutional dimension scores; generates the "constitutional gap" series |
| `04_lead_lag_analysis.ipynb` | Tests whether today's constitutional gap predicts future democratic decline at lags of 1–5 years; spotlights countries like Hungary and Venezuela |
| `05_constitutional_ambition.ipynb` | Diminishing-returns analysis: do constitutions that "promise" more democracy actually deliver more? |
| `06_constitutional_patterns.ipynb` | Two structural findings: constitutional age effect and constitutional inflation over time |
| `07_culture_constitution.ipynb` | Adds EIU Democratic Culture Index to the model; typology plot mapping regime trajectories |
| `08_culture_model.ipynb` | Full constitution + culture model; R² comparison; feature importance breakdown |
| `09_anomaly_detection.ipynb` | Isolation Forest & DBSCAN on 14-dimensional constitutional profiles to find structurally unusual constitutions |

> **Note:** There is no `01_` notebook. Step 1 (iterative typology generation) was consolidated into `00_typology_pipeline.ipynb`.

### `step_3_targets/`
Robustness checks running the Step 3 model against four alternative V-Dem targets:
`v2x_libdem`, `v2x_egaldem`, `v2x_partipdem`, `v2x_delibdem`.

---

## Repository Structure

```
.
├── 00_typology_pipeline.ipynb
├── 02_score_dimensions.ipynb
├── 03_predict_democracy.ipynb
├── 04_lead_lag_analysis.ipynb
├── 05_constitutional_ambition.ipynb
├── 06_constitutional_patterns.ipynb
├── 07_culture_constitution.ipynb
├── 08_culture_model.ipynb
├── 09_anomaly_detection.ipynb
│
├── step_3_targets/          # Robustness checks across 4 alternative democracy targets
│
├── data/
│   ├── ccpcnc/              # Comparative Constitutions Project (CCPCNC v5) — see below
│   ├── vdem/                # V-Dem dataset — see below
│   └── eiu/                 # EIU Democratic Culture Index
│
├── ccp_mappings/            # 14 hand-curated JSON mappings of CCP variables → dimensions
│   ├── ccp_mapping_INDEX.json
│   ├── ccp_mapping_combined.json
│   ├── ccp_mapping_by_dimension.json
│   └── ccp_mapping_part01_*.json … ccp_mapping_part14_*.json
│
├── typology/
│   ├── ccpc_typology_v4.json   # Final LLM-generated typology used by pipeline
│   └── dimensions/             # Per-dimension variable definitions (14 JSON files)
│
├── figures/                 # All output plots (PNG)
│   └── shap/                # SHAP beeswarm and dependence plots
│
├── presentations/           # Final slide deck
│
├── ccpc_axis_scores_llm.csv         # Step 2 output: 14 dimension scores × country-year
├── backsliding_gap_kfold.csv        # Step 3 output: OOF predicted democracy + gap
├── backsliding_gap_culture.csv      # Step 8 output: gap with culture model
├── backsliding_gap_v2x_rule.csv     # Gap for rule-of-law target
├── feature_importances_kfold.csv    # Step 3 feature importances
├── feature_importances_culture.csv  # Step 8 feature importances
├── gap_decomposition.csv            # Step 4: gap decomposed by dimension
├── lead_lag_catboost.csv            # Step 4: lead-lag regression results
├── multitarget_results.csv          # Step 3 robustness: results across 5 targets
├── multitarget_importances.csv      # Step 3 robustness: importances across targets
├── episode_validation.csv           # Step 4: backsliding episode annotations
├── ccpc_axis_scores_typfinal.csv    # Alternative scores using final typology
└── ccpc_typology.json               # Convenience copy of the active typology
```

---

## Data Sources

### ⚠️ Large files — not included in this repo

Two source datasets exceed GitHub's 100 MB file-size limit and must be downloaded separately:

| File | Size | Source |
|---|---|---|
| `data/vdem/vdem_data.csv` | ~202 MB | [V-Dem Dataset v14](https://v-dem.net/data/the-v-dem-dataset/) |
| `data/ccpcnc/ccpcnc_v5.csv` | ~203 MB | [Comparative Constitutions Project](https://comparativeconstitutionsproject.org/download-data/) |

After downloading, place them at the paths shown above. All other data files are included.

### Included datasets
- **EIU Democratic Culture Index** (`data/eiu/`) — country-level survey of democratic attitudes
- **CCP Mapping JSONs** (`ccp_mappings/`) — hand-curated mappings linking CCPCNC variables to 14 democratic dimensions
- **CCPCNC v5 small subset** (`data/ccpcnc/ccpcnc_v5_small.csv`) — trimmed version for quick exploration

---

## 14 Constitutional Dimensions

The model scores each country-year constitution on:

| # | Dimension |
|---|---|
| 1 | Civil Liberties |
| 2 | Socioeconomic Rights |
| 3 | Political Competition |
| 4 | Executive Constraints |
| 5 | Legislative Autonomy |
| 6 | Judicial Independence |
| 7 | Rule of Law & Due Process |
| 8 | Amendment Rigidity |
| 9 | Federalism & Decentralization |
| 10 | Emergency Powers Constraints |
| 11 | Transparency & Information Access |
| 12 | Institutional Accountability |
| 13 | Civilian Control of Security |
| 14 | Equality (Gender / Minority / Indigenous) |

---

## Setup

```bash
pip install pandas numpy scikit-learn catboost shap matplotlib scipy plotly langchain
```

The typology pipeline (`00_typology_pipeline.ipynb`) calls the Dartmouth LLM API via `langchain_dartmouth`. All other notebooks use only standard open-source libraries.

Run notebooks in order (00 → 02 → 03 → …). Steps 05–09 only need the intermediate CSVs produced by earlier steps.

---

## Key Findings

- **Constitutional text explains ~40–50% of democracy variance** (R² ≈ 0.45–0.52 on held-out countries) using only constitutional features.
- **The constitutional gap is predictive**: a widening gap at t predicts democratic decline at t+2 to t+4, consistent with backsliding in Hungary, Venezuela, and Turkey.
- **Democratic culture adds ~10–15 percentage points** of explained variance when combined with constitutional features.
- **Older constitutions** are associated with smaller gaps (better implementation), while newer constitutions show more "inflation" of democratic promises.
