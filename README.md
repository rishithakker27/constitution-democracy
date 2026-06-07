# Do Constitutions Shape Democracy?
### A Machine Learning Analysis of Constitutional Design and Democratic Performance
**QSS 45 Final Project — Rishith Hakker, Dartmouth College**

A large-*n* empirical test of the Madisonian claim that structural constitutional provisions protect democracy. Using a gradient-boosted model trained on 17,390 country-year observations spanning 1789–2023, we find that the provisions that best predict democracy are **not** the classical separation-of-powers safeguards — but political competition, institutional accountability, and civil liberties.

---

## Research Questions

1. **Do constitutions matter?** Can constitutional text alone predict democratic outcomes out-of-sample on entirely unseen countries?
2. **Which institutions specifically matter?** Do the classical Madisonian provisions (executive constraints, judicial independence, legislative autonomy) carry the most predictive weight — or something else?
3. **How have constitutions evolved?** Which of the 14 constitutional dimensions have grown or stagnated across two centuries of drafting?

---

## Key Findings

| Finding | Result |
|---|---|
| OOF R² (constitutional text → democracy) | **0.116** (fold-avg: 0.10 ± 0.09) |
| Top predictor | **Political Competition** (10.7%) |
| Classical Madisonian rank | Executive Constraints 9th, Judicial Independence 11th, Legislative Autonomy 14th |
| Constitutional gap → culture lift | OOF R² rises from 0.07 → 0.40 when EIU culture added |
| Age effect | 60+ yr constitutions avg gap = +0.36; 0–5 yr = −0.12 |
| Worst underperformers (2016–23) | Nicaragua (+0.44), Cuba (+0.41), Eritrea, Morocco, Saudi Arabia |
| Best overperformers | Denmark (−0.62), New Zealand, Canada, Belgium, France |

> **The large in-sample R² (0.89) vs OOF R² (0.12) gap is not simply overfitting** — it reflects fundamental country heterogeneity. Constitutional provisions can be standardised and compared; the political experience of each state cannot.

---

## Pipeline

| Notebook | What it does | Key output |
|---|---|---|
| `01_generate_typology.ipynb` | Calls GPT-class LLM (Dartmouth API) to assign weights and value maps to 839 CCPCNC variables across 14 dimensions | `typology/ccpc_typology_v4.json` |
| `02_score_constitutional_dimensions.ipynb` | Applies typology to all 17,390 country-years; computes weighted-mean dimension scores | `outputs/ccpc_axis_scores_llm.csv` |
| `03_predict_democracy_kfold.ipynb` | CatBoost (depth=3, 5-fold country-blocked CV) predicts V-Dem Polyarchy; generates constitutional gap | `outputs/backsliding_gap_kfold.csv`, `outputs/feature_importances_kfold.csv` |
| `04_lead_lag_gap_analysis.ipynb` | Tests whether today's gap predicts Δdemocracy at t+1…t+5; episode validation; gap decomposition | `outputs/lead_lag_catboost.csv` |
| `05_diminishing_returns.ipynb` | OLS: actual = 0.31 + 0.49 × predicted — more ambitious constitutions underdeliver more | `outputs/05_diminishing_returns/` |
| `06_age_and_inflation.ipynb` | Age vs gap (r=+0.49, p<10⁻⁷⁵); constitutional inflation by era | `outputs/06_age_and_inflation/` |
| `07_culture_and_constitution.ipynb` | 2×2 typology, interaction model, OLS R² decomposition, transition probabilities | `outputs/07_culture_and_constitution/` |
| `08_culture_constitution_model.ipynb` | CatBoost + EIU culture: Model A (R²=0.07) vs Model B (R²=0.40); lift = +0.33 | `outputs/08_culture_constitution_model/` |
| `09_anomaly_detection.ipynb` | Isolation Forest + LOF on 14-dim constitutional space | — |
| `10_dimension_trends.ipynb` | Tracks all 14 dimension averages from 1900s → 2020s | `outputs/10_dimension_trends/` |

### `03_alternatetargets/`
Runs the identical CatBoost pipeline against all five V-Dem democracy concepts:

| Target | Fold-avg R² |
|---|---|
| Electoral Democracy (`v2x_polyarchy`) | 0.101 |
| Egalitarian Democracy (`v2x_egaldem`) | 0.096 |
| Deliberative Democracy (`v2x_delibdem`) | 0.083 |
| Participatory Democracy (`v2x_partipdem`) | 0.063 |
| Liberal Democracy (`v2x_libdem`) | 0.052 |

---

## Repository Structure

```
.
├── 01_generate_typology.ipynb
├── 02_score_constitutional_dimensions.ipynb
├── 03_predict_democracy_kfold.ipynb
├── 03_alternatetargets/             # Same pipeline, 5 alternate V-Dem targets
├── 04_lead_lag_gap_analysis.ipynb
├── 05_diminishing_returns.ipynb
├── 06_age_and_inflation.ipynb
├── 07_culture_and_constitution.ipynb
├── 08_culture_constitution_model.ipynb
├── 09_anomaly_detection.ipynb
├── 10_dimension_trends.ipynb
│
├── pnas_template.tex                # PNAS-format paper
├── references.bib                   # BibTeX references
│
├── typology/
│   └── ccpc_typology_v4.json        # LLM-generated weights & value maps (839 variables)
│
├── data/
│   ├── ccpcnc/                      # ⚠️ Not included — download separately (1.1 GB)
│   ├── vdem/                        # ⚠️ Not included — download separately (206 MB)
│   ├── eiu/                         # EIU Democratic Culture Index (included)
│   └── ccp_mappings/                # 14 hand-curated JSON mappings (included)
│
├── outputs/
│   ├── ccpc_axis_scores_llm.csv     # Notebook 02: 14 dimension scores × country-year
│   ├── backsliding_gap_kfold.csv    # Notebook 03: OOF gap (1,293 rows, 164 countries)
│   ├── feature_importances_kfold.csv
│   ├── backsliding_gap_culture.csv  # Notebook 08: gap with culture model
│   ├── feature_importances_culture.csv
│   ├── lead_lag_catboost.csv
│   ├── gap_decomposition.csv
│   ├── episode_validation.csv
│   ├── robustness/                  # Per-target feature importances & gap CSVs
│   ├── shap/                        # SHAP beeswarm plots
│   ├── 05_diminishing_returns/
│   ├── 06_age_and_inflation/
│   ├── 07_culture_and_constitution/
│   ├── 08_culture_constitution_model/
│   └── 10_dimension_trends/
│
└── portfolio/                       # React/Vite interactive web portfolio
    └── src/
```

---

## 14 Constitutional Dimensions

Ranked by CatBoost feature importance (Polyarchy target):

| Rank | Dimension | Importance |
|---|---|---|
| 1 | Political Competition | 10.7% |
| 2 | Institutional Accountability | 9.2% |
| 3 | Civil Liberties | 8.7% |
| 4 | Emergency Powers Constraints | 8.7% |
| 5 | Civilian Control of Security | 8.6% |
| 6 | Transparency / Information Access | 8.3% |
| 7 | Rule of Law / Due Process | 7.7% |
| 8 | Federalism / Decentralization | 7.4% |
| 9 | Executive Constraints | 6.8% |
| 10 | Amendment Rigidity | 5.3% |
| 11 | Judicial Independence | 5.1% |
| 12 | Socioeconomic Rights | 5.0% |
| 13 | Legislative Autonomy | 4.5% |
| 14 | Equality (Gender / Minority / Indigenous) | 3.8% |

---

## Data Sources

### ⚠️ Not included — download separately

| Dataset | Size | Source |
|---|---|---|
| CCPCNC v5 (`data/ccpcnc/ccpcnc_v5.csv`) | ~1.1 GB | [Comparative Constitutions Project](https://comparativeconstitutionsproject.org/download-data/) |
| V-Dem v14 (`data/vdem/vdem_data.csv`) | ~206 MB | [V-Dem Dataset v14](https://v-dem.net/data/the-v-dem-dataset/) |

After downloading, place files at the paths above. All other data (EIU, CCP mappings, typology, scored CSVs) is included.

---

## Setup

```bash
pip install pandas numpy scikit-learn catboost shap matplotlib scipy plotly seaborn
```

Notebook `01` calls the Dartmouth LLM API via `langchain_dartmouth` — a Dartmouth account is required only for that step. All downstream notebooks (02–10) use only standard open-source libraries and the pre-computed `ccpc_axis_scores_llm.csv`.

**Run order:** `01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10`
Notebooks 05–10 only require the CSVs produced by 02 and 03, so you can skip 01 if you use the included scored output.
