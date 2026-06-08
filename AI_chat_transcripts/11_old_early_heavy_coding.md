# Transcript: 11 old early heavy coding

## [USER]

hi

---

## [USER]

Look through vdem_llm_merge_catboost.ipynb. can you explain the 2016 and beyond analysis. Explain the results. Is the   
   method fine?

---

## [CLAUDE]

Now I have everything I need. Here's a thorough breakdown:

---

## Section 12: Post-2016 Analysis — Explanation

### What it does
The notebook re-trains the exact same CatBoost pipeline, but **restricts the data to 2016–2025** (the "democratic backsliding era"). It then compares:
- Model performance (R²/RMSE) vs. the full 1950–2025 panel
- SHAP feature importances vs. the full model
- Which constitutional features gained or lost predictive weight

---

### Results

#### 1. Model Performance — Big Jump in R²

| Target | Full R² | Post-2016 R² | ΔR² |
|---|---|---|---|
| Polyarchy | 0.598 | **0.824** | +0.226 |
| Libdem | 0.683 | **0.846** | +0.162 |
| Partipdem | 0.666 | **0.853** | +0.187 |
| Delibdem | 0.613 | **0.841** | +0.228 |
| Egaldem | 0.703 | **0.857** | +0.154 |

All five targets jump ~0.15–0.23 R² points. The constitutional LLM scores explain **~83–86% of the variance** in V-Dem scores in the post-2016 window, compared to ~60–70% over the full panel. This is a substantial improvement.

#### 2. Top SHAP Drivers (Polyarchy, Post-2016)
1. **Civilian control of security** (0.039 SHAP, ↑ vs. full)
2. **Political competition** (0.034 SHAP, ↑)
3. **Emergency powers constraints** (0.034 SHAP, ↓ — *decreased* relative to full)

#### 3. Feature Importance Shifts (Post-2016 vs. Full Panel)
Features that **gained** importance:
- `socioeconomic_rights` (+2.62) — biggest gainer
- `legislative_autonomy` (+1.94)
- `political_competition` (+1.75)
- `cluster` (+1.74)
- `judicial_independence` (+1.68)
- `civilian_control_of_security` (+1.32)

Features that **lost** importance:
- `emergency_powers_constraints` (−5.64) — biggest drop
- `civil_liberties` (−4.26) — second biggest drop
- `executive_constraints` (−1.52)
- `institutional_accountability` (−0.48)

---

### What the Results Mean
In the **backsliding era (2016+)**, what's written in constitutions about **socioeconomic rights, legislative autonomy, judicial independence, and civilian security control** becomes *more* predictive of actual democracy scores. Meanwhile, formal **civil liberties and emergency powers clauses** matter *less* — arguably because these are the exact provisions that backsliding regimes exploit or hollow out on paper while retaining their text.

---

### Is the Method Fine? — Critical Assessment

#### ✅ What's solid
- CatBoost handles the clustered categorical feature (`cluster`) natively — good choice
- SHAP for interpretability is best practice
- Comparing full vs. post-2016 is a sensible way to test era-specific dynamics

#### ⚠️ Significant concerns

1. **Data leakage / temporal mismatch (most serious issue):** The LLM scores are from each country's **most recent constitution**, and that single score is **broadcast across all years** — including years before that constitution existed. For example, Mexico's 2016+ constitution scores are applied to its 1950 V-Dem data. This means in the post-2016 subsample, the features and targets are more temporally aligned, which **artificially inflates R²**. The huge jump (+0.15–0.23 R²) in the post-2016 model is at least partly explained by this alignment artifact, not purely by the model being better.

2. **Small post-2016 sample:** ~1,014 country-year observations across 10 years and 169 countries. With a 0.2 test split, that's ~200 test observations — noisy R² estimates.

3. **No time-series cross-validation:** The train/test split is random (`train_test_split` with `random_state`), not time-based. For panel data, you should hold out the most recent years as the test set, otherwise the model sees future observations of the same countries during training — another source of inflated R².

4. **Constitutional scores have very low variance:** Most LLM scores cluster around 0.75, meaning the model may be fitting a near-constant predictor to each country cluster rather than learning genuine constitutional variation.

5. **Cluster circularity:** The `cluster` feature is derived from the same LLM scores used as features — it's not truly independent information.

#### Bottom line
The **direction of the findings is plausible** (institutional and civil society features matter more during backsliding), but the **R² values are likely inflated** due to temporal alignment between features and targets in the post-2016 window. A time-aware cross-validation split would give a more honest estimate of predictive power.

---

## [USER]

can you fix these problems

---

## [USER]

Essentially, I want to figure which countries / factors are causing / permitting the fall in democracy. For example, if countries with a particularly low civil liberties score are most suseptible to a decline in democracy scores and so on. Also, for some countries which have had multiple consituttions since 2015, use both, changes are okay (but obviously, use the end year)

---

## [CLAUDE]

Now Fix 2 — rewrite the CatBoost helper (cell 20) with a time-based split:

---

## [CLAUDE]

Everything runs. The decline-slope CatBoost R² of -0.092 is itself an honest and informative result (constitutional text alone doesn't predict decline slope cross-sectionally). Now copy the executed notebook over the original and clean up:

---

## [CLAUDE]

All three fixes are complete and the notebook runs cleanly end-to-end. Here's a summary of everything that was done and what the results actually tell you:

---

## What was fixed

### Fix 1 — Temporal leakage (Section 4)
- **Old**: Broadcast each country's *most recent* constitution scores across all years → 77.5% of rows used a constitution that didn't exist yet
- **New**: `pd.merge_asof` matches each V-Dem year to the constitution *actually in force* at that time. Multi-constitution countries (Algeria, Burundi, Chile, Sudan, etc.) now get their scores updated mid-panel when a new constitution takes effect
- **Result**: 12,646 → 3,165 rows — all valid. Assertion confirms `year ≥ constitution_year` everywhere

### Fix 2 — Random train/test split (Section 6)
- **Old**: `train_test_split(random_state=42)` — same countries in train and test, future data in training
- **New**: Train on years < 2016, test on years ≥ 2016 — genuinely out-of-sample
- **Result**: Honest R² drops from ~0.60–0.70 to **0.53–0.57** across all five V-Dem targets — a real but moderate signal, not inflated

### Fix 3 — New diagnostic analysis (Section 12)
Six sub-analyses replacing the old post-2016 comparison:

- **12a**: Democracy trend slopes per country. 45 declining, 111 stable, 13 rising. Worst decliners: Burkina Faso (−0.073/yr), Mali (−0.050), Tunisia (−0.049), Myanmar (−0.049), El Salvador (−0.045)

- **12b**: Violin plots comparing constitutional profiles of declining vs. rising countries, with Mann-Whitney U significance tests per feature

- **12c**: Vulnerability analysis — **legislative autonomy** and **civilian control of security** are the features where low-scoring countries decline most. Interestingly, *none* of the gaps are statistically significant at p<0.05, suggesting constitutional text alone is a weak predictor of *who* declines

- **12d**: CatBoost predicting decline slope directly (one row per country). R² = −0.09 — **the constitutional text does not predict which countries will backslide**. This is itself a substantively important finding: having a weak constitution correlates with low democracy levels, but it doesn't predict the *rate* of decline

- **12e**: Annotated scatter of each country's weakest constitutional dimension vs. their decline slope. The worst decliners' constitutional weak spots: **legislative autonomy** (Mali, Tunisia, Myanmar, El Salvador, Niger, Peru) and **civilian security control** (Burkina Faso, Afghanistan)

- **12f**: For countries with multiple constitutions, delta analysis. Burundi's 2018 constitution saw a −1.25 total score drop, tracking a −0.21 polyarchy drop. Sudan's 2019 constitution was similar. Positive cases: Afghanistan's 2004 constitution (+1.25) tracked +0.167 polyarchy improvement

---

## [USER]

what notebook is this in? where can I find it

---

## [CLAUDE]

The notebook is at:

**`/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/vdem_llm_merge_catboost.ipynb`**

So from your Downloads folder: `QSS_45_Project` → `clean_versions` → `vdem_llm_merge_catboost.ipynb`

---

## [USER]

s essentially, consittuions cant explain if there will be ademocratic decline right?

---

