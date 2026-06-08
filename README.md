# Do Constitutions Shape Democracy?
### A Machine Learning Analysis of Constitutional Design and Democratic Performance
**QSS 45 Final Project — Rishi Thakker, Dartmouth College**

A large-*n* empirical test of the Madisonian claim that structural constitutional provisions protect democracy. Using a gradient-boosted model trained on 17,390 country-year observations spanning 1789–2023, we find that the provisions that best predict democracy are **not** the classical separation-of-powers safeguards — but political competition, institutional accountability, and civil liberties.

**[Paper (PDF)](QSS45_FinalEssay.pdf) · [Interactive Website](https://portfolio-eight-lilac-55.vercel.app) · [Full Dimension Table](constitutional_dimensions.md)**

---

## Research Questions

1. **Do constitutions matter?** Can constitutional text alone predict democratic outcomes out-of-sample on entirely unseen countries?
2. **Which institutions specifically matter?** Do the classical Madisonian provisions (executive constraints, judicial independence, legislative autonomy) carry the most predictive weight — or something else?
3. **How have constitutions evolved?** Which of the 14 constitutional dimensions have grown or stagnated across two centuries of drafting?

---

## Key Findings

| Finding | Result |
|---|---|
| OOF R² (constitutional text → democracy) | **0.10 ± 0.09** (country-blocked 5-fold CV) |
| Top predictor | **Political Competition** (10.7%) |
| Classical Madisonian rank | Executive Constraints 9th, Judicial Independence 11th, Legislative Autonomy 13th |
| Constitutional gap → culture lift | OOF R² rises from 0.07 → 0.40 when EIU culture added |
| Age effect | Older constitutions consistently outperform their text; gap inverts ~30 years |
| Worst underperformers (2023) | Nicaragua (+0.44), Cuba (+0.41), Eritrea, Belarus, Afghanistan |
| Best overperformers | Denmark, New Zealand, Canada, Belgium, France |

> **The large in-sample R² (0.89) vs OOF R² (0.10) gap is not simply overfitting** — it reflects fundamental country heterogeneity. Constitutional provisions can be standardised and compared; the political experience of each state cannot.

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
├── QSS45_FinalEssay.pdf             # Final paper (PNAS format)
├── constitutional_dimensions.md     # Full 14-dimension table with example variables
│
├── AI_chat_transcripts/             # Claude Code & Cowork session transcripts
│   └── ...                          # 23 coding-relevant sessions
│
├── typology/
│   └── ccpc_typology_v4.json        # LLM-generated weights & value maps (839 variables)
│
├── data/
│   ├── ccpcnc/                      # ⚠️ Not included — download separately (1.1 GB)
│   ├── vdem/                        # ⚠️ Not included — download separately (206 MB)
│   ├── eiu/                         # EIU Democratic Culture Index (included)
│   ├── ccp_mappings/                # 14 hand-curated JSON mappings (included)
│   └── data_inputs/                 # Cowork session: CCPCNC variable → dimension mapping
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
└── portfolio/                       # React/Vite interactive website
    └── src/                         # https://portfolio-eight-lilac-55.vercel.app
```

---

## 14 Constitutional Dimensions

Ranked by CatBoost feature importance (Polyarchy target). Each dimension aggregates a subset of the 839 CCPCNC variables using LLM-assigned weights and value maps.

| Rank | Dimension | Importance | Description | Example CCPCNC Variables |
|---|---|---|---|---|
| 1 | Political Competition | 10.7% | Whether the constitution establishes competitive multi-party elections, universal suffrage, and rights to form and join political parties | Multi-party system required, universal suffrage, right to form parties, campaign rights |
| 2 | Institutional Accountability | 9.2% | Horizontal accountability mechanisms: independent audit institutions, ombudsman, and legislative oversight of executive action | Independent audit body, ombudsman, legislative oversight powers, anti-corruption commission |
| 3 | Civil Liberties | 8.7% | Constitutional protections for individual freedoms of expression, assembly, religion, and movement | Freedom of speech, freedom of assembly, freedom of religion, freedom of movement |
| 4 | Emergency Powers Constraints | 8.7% | Limits on when and how states of emergency can be declared, extended, and used to suspend rights | Legislative approval required, duration limits, non-derogable rights listed |
| 5 | Civilian Control of Security | 8.6% | Constitutional provisions placing military and police forces under civilian authority | Civilian commander-in-chief, legislative approval of military deployment, police oversight |
| 6 | Transparency / Info Access | 8.3% | Right to access government information and protections for press freedom and open government | Right to information, freedom of press, open government provisions |
| 7 | Rule of Law / Due Process | 7.7% | Fair trial rights, habeas corpus, and due process protections against arbitrary state action | Right to counsel, presumption of innocence, prohibition of torture, habeas corpus |
| 8 | Federalism / Decentralization | 7.4% | Distribution of powers between central and sub-national governments | Regional/state governments established, devolution of powers, fiscal federalism |
| 9 | Executive Constraints | 6.8% | Formal limits on executive authority including term limits and legislative checks | Term limits, legislative override of veto, approval requirements for executive acts |
| 10 | Amendment Rigidity | 5.3% | Procedural barriers to constitutional modification | Supermajority requirements, referendum required, unamendable core provisions |
| 11 | Judicial Independence | 5.1% | Protections for judicial autonomy through tenure, appointment, and removal provisions | Security of tenure, independent appointment process, jurisdictional protections |
| 12 | Socioeconomic Rights | 5.0% | Positive constitutional rights to economic and social goods | Right to education, right to health, right to housing, labour rights |
| 13 | Legislative Autonomy | 4.5% | Parliamentary independence from executive control and capacity for self-governance | Legislative immunity, committee powers, independent budget authority |
| 14 | Equality | 3.8% | Non-discrimination provisions covering gender, ethnic minorities, and indigenous groups | Gender equality clause, ethnic minority protections, indigenous peoples' rights |

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
