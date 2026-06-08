# Transcript: 04 constitutional culture interaction

## [USER]

Project: Parchment Without Power — QSS 45, Dartmouth
Core thesis: Constitutional text barely predicts democratic outcomes. The gap between constitutional promise and democratic reality is the interesting story.
Dataset
CCPCNC v5 — comparative constitutions dataset, 1,175 binary/ordinal variables describing constitutional provisions across 178 countries
V-Dem — v2x_polyarchy (0–1 electoral democracy score), the target variable
EIU Democratic Culture Index — citizen preference for democracy (0–10), 2006–2024, 174 countries
Full dataset: ~13,208 country-years, 1789–2023
Pipeline (7 steps)
Step 1 — step_1_generate_typology.ipynb
Sends the CCPCNC v5 codebook PDF (~59K tokens) to gpt-oss-120b via Dartmouth Cloud. LLM assigns 731 of 1,175 variables to 14 theoretical dimensions (civil liberties, judicial independence, rule of law, etc.) with weights (0.5–3.0) and 0–1 value maps. Output: ccpc_typology.json.
Step 2 — step_2_score_dimensions.ipynb
Applies the typology via weighted average to produce 14 constitutional dimension scores (0–1) per country-year. Missing/inapplicable codes excluded from denominator. Output: ccpc_axis_scores_llm.csv.
Step 3 — step_3_k_fold.ipynb and step_3_ver_final.ipynb
CatBoost regressor (depth=2, 1000 iters, early stopping) predicts v2x_polyarchy from 14 constitutional scores. Country-blocked 5-fold CV (no temporal leakage). OOF R² = 0.17 — constitutions explain 17% of democracy variance. The backsliding gap = actual − predicted. Output: backsliding_gap_kfold.csv, feature_importances_kfold.csv.
Step 4 — step_4_lead_lag.ipynb
Lead-lag analysis: CatBoost predicts Δv2x_polyarchy at t+1 to t+5 from [gap, v2x_polyarchy]. OOF R² grows from 0.006 → 0.036. Also: episode validation (gap is negative before backsliding) and gap decomposition (recovery dominates over constitutional amendment, 6:1 ratio). NOTE: the "early warning" finding was critiqued and dropped — the negative gap before backsliding likely reflects already-ongoing decline, not prediction.
Step 5 — step_5_constitutional_ambition.ipynb
Diminishing returns to constitutional ambition. Low-promise constitutions are exceeded 1.37× in practice; high-promise ones barely met (1.02×). OLS slope = 0.65 — each unit of constitutional promise yields only 0.65 units of actual democracy. Top-decile most ambitious constitutions average actual < predicted. Charts: step5_conversion_rate.png, step5_scatter.png.
Step 6 — step_6_constitutional_patterns.ipynb
Two structural findings from CCPCNC systyear (year constitution was adopted):
Constitutional age — r = +0.48 (p < 10⁻⁵⁰). New constitutions (0–5 yrs): avg gap = −0.112. 60+ year constitutions: avg gap = +0.342. Difference = +0.47.
Constitutional inflation — promise has risen across eras (0.387 → 0.460) while actual democracy has fallen (0.835 → 0.407). Recent constitutions (2005+) are the most ambitious and have the first negative average gap (−0.053). Charts: step6_constitution_age.png, step6_constitution_inflation.png.
Step 7 — step_7_culture_constitution_prediction.ipynb
Merges EIU Democratic Culture Index. Key findings:
Culture alone: r = +0.55 with the gap (stronger than any constitutional feature)
Constitution + culture: R² = 0.36 (vs 0.17 alone) — culture doubles explanatory power
OLS: actual = −0.132 + 0.488×pred + 0.080×culture
2×2 typology (hard threshold on median culture × gap sign): Stable democracy / Ripe for change / Stuck autocracy / Fragile democracy
Simulation: constitutional upgrade alone → +0.038 V-Dem. Add culture shift → +0.158. Constitutional reform without cultural change is a weak lever.
"Ripe" countries (high culture, negative gap): Belarus, Ukraine, Thailand, China, Vietnam, Haiti, Tajikistan
Charts: step7_2x2_typology.png, step7_simulation.png
Key Results
Finding	Stat
Constitution → democracy (R²)	0.17
Constitution + culture → democracy (R²)	0.36
Top feature: rule of law	11.4% importance
Judicial independence (theory's favourite)	ranks 10th of 14
Conversion rate, modest constitutions	1.37× (exceed predictions)
Conversion rate, ambitious constitutions	1.02× (barely meet predictions)
Constitutional age correlation with gap	r = +0.48
Worst backslider	Belarus (gap = −0.38)
Constitutional upgrade effect alone	+0.038 V-Dem
Constitutional upgrade + culture shift	+0.158 V-Dem
Presentation — backsliding_presentation_v2.pptx (8 slides)
Title — "Parchment Without Power"
Methodology — 3-step flow: LLM → CatBoost → Gap
R² = 0.17 — big number + 3 context cards
Not What Theory Predicts — all 14 features ranked; judicial independence/executive constraints highlighted in orange at bottom
World Map — 2023 gap choropleth (rendered from step_3_k_fold notebook Plotly output)
More Promise → Less Delivery — conversion rate 1.37× → 1.02× bar chart
New Constitutions Underdeliver — constitutional age chart + constitutional inflation chart side by side
The Parchment Persists — 3 conclusion cards + decomposition bar chart
Key Files
backsliding/
├── step_1_generate_typology.ipynb
├── step_2_score_dimensions.ipynb
├── step_3_k_fold.ipynb
├── step_3_ver_final.ipynb
├── step_4_lead_lag.ipynb
├── step_5_constitutional_ambition.ipynb
├── step_6_constitutional_patterns.ipynb
├── step_7_culture_constitution_prediction.ipynb
├── ccpc_typology.json
├── ccpc_axis_scores_llm.csv
├── backsliding_gap_kfold.csv
├── backsliding_presentation_v2.pptx   ← current deck
├── gap_map.png
├── step5_conversion_rate.png
├── step5_scatter.png
├── step6_constitution_age.png
├── step6_constitution_inflation.png
├── step7_2x2_typology.png
└── step7_simulation.png
Key Critiques to Be Aware Of
LLM typology unvalidated — weights and value maps are GPT-generated, no inter-rater reliability check
Early warning finding dropped — gap before backsliding likely mechanical (V-Dem already declining), not predictive
2×2 typology is rule-based — median threshold is arbitrary; robustness not tested
Constitutional inflation confounded — pre-WWI constitutions belong to survivor stable democracies (US, UK, etc.), not a fair comparison to recent ones
Endogeneity throughout — constitutions are adopted endogenously to political history; no IV strategy

Ignore the 2x2 typology; what's interesting things we can do with the culture stuff?

---

## [USER]

I like 3 and 1

---

## [USER]

[Request interrupted by user]

---

## [USER]

okay, maybe forget adoption and everything, can we build a second model in a new file where we run a similar catboost model as we do in previous files but just with the new dataset?

---

## [CLAUDE]

Clear picture. The new notebook will mirror Step 3 exactly — same CatBoost setup, same country-blocked CV — but merge in EIU culture, restrict to EIU-covered years, and run two models side by side: constitution-only (recomputed on the same restricted rows for a fair comparison) vs constitution + culture.

---

## [CLAUDE]

Now let's verify it runs cleanly end-to-end, minus the CatBoost parts (since the `deeplearn` kernel isn't available via nbconvert):

---

## [CLAUDE]

Data merges cleanly. 2,493 rows, 160 countries, 100% culture coverage. The file is ready at [step_8_culture_model.ipynb](step_8_culture_model.ipynb).

Here's what it does:

- **Cells 1–2:** Load all three datasets, merge, restrict to EIU years → 2,493 rows / 160 countries
- **Cell 3 (CV):** Runs two identical 5-fold country-blocked CatBoost models on the same rows — Model A (14 constitutional features) and Model B (+culture). Prints per-fold R² for both so you can see variance, plus the R² lift
- **Cell 4 (final models):** Trains full-data models for importances
- **Cell 5 (importances):** Side-by-side bar charts showing where culture ranks vs. all 14 constitutional dimensions
- **Cell 6 (gap):** Worst backsliders / most resilient using the culture-model OOF predictions
- **Cell 7 (gap comparison):** Scatter of gap_A vs. gap_B — who moves when culture is controlled for, colored by culture score
- **Cell 8 (export):** `backsliding_gap_culture.csv` and `feature_importances_culture.csv`

The most interesting output will be Cell 5 — if culture ranks #1 among all 15 features, that's the headline. Cell 7 is also good: it shows which countries look less bad (high culture, underperforming) vs. more bad (low culture, overperforming) once culture enters the model.

---

## [USER]

can you run the code and tell me the results

---

## [USER]

okay, can you add these findings as a last slide in the presentation? backsliding_presentation_v2.pptx

---

## [USER]

Base directory for this skill: /Users/rishithhakker/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/fe88df68-62c4-4712-a335-f9a2b8c2774d/327a2b96-7838-4933-8bf6-efc39e72230d/skills/pptx

# PPTX Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Read/analyze content | `extract-text presentation.pptx` |
| Edit or create from template | Read [editing.md](editing.md) |
| Create from scratch | Read [pptxgenjs.md](pptxgenjs.md) |

---

## [USER]

okay let's make this simpler; I only have 4 minutes to present. Make changes accordingly. Should we delete slide 6 and 8?

---

## [CLAUDE]

Before cutting, let me just confirm what's on each slide so my recommendation is grounded:

- **1** — Title ("Parchment Without Power")
- **2** — Methodology (LLM → CatBoost → Gap)
- **3** — R² = 0.17 (the main finding)
- **4** — Feature importances (not what theory predicts)
- **5** — World map (2023 gap choropleth)
- **6** — More Promise → Less Delivery (conversion rate chart)
- **7** — New Constitutions Underdeliver (age + inflation charts)
- **8** — The Parchment Persists (conclusion cards)
- **9** — Culture in the Model (new slide)

For 4 minutes (~40 sec/slide), my honest recommendation is to delete **6, 7, and 8** — not just 6 and 8. Here's why:

- **6** (conversion rate) and **7** (constitutional age/inflation) are both supporting details — interesting, but each needs 30+ seconds of explanation to land
- **8** (conclusion) can be dropped because **slide 9 already works as your conclusion** — culture doubling R² is a stronger ending than a recap

That leaves you **6 slides**: Title → Method → R²=0.17 → Feature importances → World map → Culture. Clean narrative arc, ~40 sec each.

If you delete only 6 and 8 as you suggested, you get 7 slides (~34 sec each) — tighter but doable if you want to keep the constitutional age finding.

Which do you prefer — cut all three (6, 7, 8) for 6 slides, or just 6 and 8 for 7 slides?

---

## [USER]

okay, go through the folder and explain each notebook and what it does to me

---

## [USER]

what if we go thorugh the data and see countries in which there is a sudden change in predicted democracy score (amendment or change in constitution) and see if the change coresponded to acutal democratic change? the change or lack could be attributed to the new culture variable?

---

## [CLAUDE]

This is a really good idea and it's more defensible than the adoption-event approach we tried earlier. Here's what the analysis would look like:

**The setup:** Instead of looking only at full constitution replacements (which gave us 2 usable events), we look at **year-over-year changes in the 14 constitutional dimension scores** — which captures amendments too. A sudden jump in the composite score = a significant constitutional reform happened. Then we ask: did democracy actually follow?

**The three-part question:**
1. When a country's constitutional score jumps, does `v2x_polyarchy` change in the next 1–5 years? (baseline — probably weak, consistent with R²=0.17)
2. Does that relationship get stronger in high-culture countries?
3. Does it get *weaker or reversed* in low-culture countries — i.e., the parchment changed but nothing moved?

**Data we'd use:**
- `ccpc_axis_scores_llm.csv` — dimension scores all years, 178 countries (this gives us the constitutional "shocks")
- `vdem/vdem_data.csv` — V-Dem all years (the democratic outcome)
- EIU culture — the moderating variable (restricts to 2006+ for the culture-conditioned part)

**What we'd likely find:** A handful of clean case studies like Tunisia 2014 (constitutional improvement + democratic improvement, high culture), Hungary 2011 (constitutional "improvement" on paper, democratic collapse in practice, moderate culture), Thailand's repeated rewrites (low culture, no democratic movement).

**The honest caveat:** Endogeneity — countries that rewrite their constitutions while also democratizing were probably already moving in that direction. But that's actually the point: culture might be what explains whether a country is in "motion" when it reforms vs. just changing the text.

Want me to build this as a new `step_9` notebook?

---

## [USER]

yes please do

---

## [USER]

okay, delete this file

---

## [CLAUDE]

Done. `step_9_constitutional_shocks.ipynb` is gone.

---

## [USER]

okay, go back to my presentation. Look at slide 6.  Add my conclusion. Would a good conclusion be something like A Constituion alone has little to no impact on democaryc, rather other factors like history and culture need to be analyzed. Therefore, in revolutions or overthrows, we cannot simply create new "rules" and expect democracy
backsliding_presentation_v2.pptx

---

## [USER]

See the feature importance slide. The numbers are just integers

---

## [USER]

can I see a catboost shap for the culture part? Or any of them that might be interesting? Create a folder caleld SHAPs and put them in there

---

## [USER]

in the earlier model, why do you reckon are socioeconomic rights so high?

---

## [CLAUDE]

Good question — it's one of the more counterintuitive results and worth unpacking. A few likely reasons:

**1. It's a proxy for constitutional era, not a causal mechanism**
Socioeconomic rights (right to housing, healthcare, education, work) are almost exclusively a post-WWII phenomenon. Constitutions written before ~1945 almost never include them; constitutions written after 1989 almost always do. So a high socioeconomic rights score is effectively a signal that this is a *modern* constitution — and modern constitutions skew heavily toward democratic countries (post-Soviet transitions, post-authoritarian Latin America, etc.). The model is picking up "was written in a democratic era" rather than "socioeconomic rights cause democracy."

**2. Western European democracies contaminate the signal**
Nordic and continental European constitutions score very high on socioeconomic rights *and* have the highest V-Dem scores in the dataset. The model sees that correlation and treats it as predictive. But Denmark isn't democratic because its constitution promises healthcare — the causality runs the other way entirely.

**3. Post-communist transitions cluster here**
Poland, Czech Republic, Estonia, Hungary (pre-2011) all adopted socioeconomic rights-heavy constitutions in 1989–1997, and all scored high on V-Dem in the early years. That's a dense cluster of observations where socioeconomic rights and democracy move together — but again, the shared cause is "the Iron Curtain fell," not the rights provision itself.

**4. The depth-2 tree structure amplifies this**
With CatBoost at depth=2, each tree can only split on 2 features. Socioeconomic rights probably pairs very efficiently with one other feature (likely rule of law or civil liberties) to cleanly separate the data — not because it's causally important but because it's a useful separating variable in a low-depth tree.

**The honest interpretation:** It's a confound. If you ran the same model but restricted to constitutions written after 1989 (removing the historical era signal), socioeconomic rights would almost certainly collapse in importance. It's telling you "this country wrote its constitution after the global democratic wave" more than anything about the rights themselves. This is actually a good example to use in your limitations section — the LLM typology and the CatBoost model can't distinguish between features that *cause* democracy and features that merely *co-occur* with it.

---

## [USER]

what if I remove the variable? what are other ways to make the model better? depth 3?
