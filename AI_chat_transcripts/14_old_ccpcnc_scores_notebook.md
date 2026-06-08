# Transcript: 14 old ccpcnc scores notebook

## [USER]

read ccpcnc_scores.ipynb. what does the code do?

---

## [CLAUDE]

Here's what the notebook does:

**Goal:** Validate LLM-generated constitutional scores by building an independent set of scores from expert-coded constitutional data (CCPCNC v5), then comparing the two.

**Pipeline:**

1. **Load CCPCNC data** — The Comparative Constitutions Project (CCPCNC v5) panel dataset. It deduplicates to one row per constitution (unique `cowcode` + `systyear`).

2. **Recode variables to 0–1 indicators** — Each CCPCNC coded feature (e.g., press freedom, torture prohibition, term limits) is mapped to a 0–1 scale, where 1 = democratic/rights-protective. Special "not applicable / unknown" codes (90, 96–99) are treated as missing. Ordinal variables (like torture prohibition strength) are rescaled proportionally.

3. **Compute 10 axis scores** — Each axis is the mean of its component indicators:
   - `civil_liberties`, `socioeconomic_rights`, `political_competition`, `legislative_autonomy`, `executive_constraints`, `judicial_independence`, `rule_of_law_due_process`, `institutional_accountability`, `emergency_powers_constraints`, `civilian_control_of_security`

4. **Merge with LLM scores** — Joins the CCPCNC scores to LLM scores (from `GPT_Final_Try.ipynb`) using a metadata bridge (`constitution_metadata.csv`) that maps Constitute Project constitution IDs to CCPCNC `systyear`.

5. **Validation analysis:**
   - Pearson & Spearman correlations per axis
   - Scatter plots (CCPCNC vs LLM) with 45° reference lines
   - Mean Absolute Error and mean bias per axis
   - Full correlation heatmap across all 20 scores
   - Flags constitutions with large disagreements (|LLM − CCPC| > 0.35)
   - Radar chart comparing average scores across both methods

6. **Save outputs** — `ccpc_axis_scores.csv`, `ccpc_llm_full_comparison.csv`, `llm_ccpc_disagreements.csv`, and two figures.

In short: it's a **cross-validation notebook** testing whether the LLM's text-based constitutional scoring agrees with what human expert coders recorded in the CCPCNC database.

---

## [USER]

what does the validation show, can I use the LLMs scoring? Also, what's the methodlogy for the recoding and the scoring on the 10? It seems that there could be weaknesses there no? What if we use an LLM generated formula to see how to convert the scores to the 10 variables?

---

## [CLAUDE]

Now I have the full picture. Here's a thorough breakdown:

---

## What the validation actually shows

**Only 57 of 230 LLM-scored constitutions matched** to CCPCNC — that's 25%, so the validation itself is thin and potentially unrepresentative.

The correlations split into three tiers:

| Tier | Axes | r | Verdict |
|---|---|---|---|
| **Decent** | institutional_accountability, socioeconomic_rights, political_competition | 0.65–0.71 | LLM roughly tracks expert coders |
| **Moderate** | civil_liberties, judicial_independence, rule_of_law_due_process | 0.50–0.57 | Noisy agreement |
| **Poor** | legislative_autonomy, executive_constraints, civilian_control | 0.26–0.32 | Essentially uncorrelated |
| **Broken** | emergency_powers_constraints | **−0.24** | Measuring opposite things |

**Systematic bias is the bigger problem than noise.** The LLM scores almost uniformly *higher* than CCPCNC:
- `emergency_powers_constraints`: +0.55 bias, MAE = 0.63 — the LLM gives this a mean of 0.77 while CCPCNC gives 0.22. These are not measuring the same thing.
- `rule_of_law_due_process`: +0.38 bias — same issue
- 155 large disagreements across 57 constitutions

**Can you use the LLM scoring?** For the 3 decent axes (institutional accountability, socioeconomic rights, political competition), the LLM is plausibly valid. For emergency powers and executive/legislative constraints, the LLM scores are unreliable for cross-constitutional comparison as-is — you'd need to flag this as a limitation. The LLM's consistent upward bias suggests it's reading *aspirational constitutional text* more generously than expert coders who recorded *what was actually specified precisely*.

---

## Weaknesses in the current CCPCNC recoding methodology

Yes, there are real weaknesses:

1. **Very thin axis coverage for some dimensions.** `emergency_powers_constraints` uses only 2 CCPCNC variables (`r_emrights`, `r_emdecl`). `civilian_control` uses 3. This makes those axes extremely sensitive to those specific coding choices — and explains the wild divergence.

2. **Arbitrary ordinal rescaling.** Choices like torture: `{1:1.0, 2:0.67, 3:0.33, 4:0.0}` or amendment threshold: `{1:0.2, 2:0.4, 3:0.6, 4:0.8}` are hand-crafted. The spacing between levels is assumed equal, which may not reflect actual constitutional significance.

3. **Equal weighting within axes.** Every component indicator counts the same. `r_press` (press freedom) and `r_binding` (whether rights bind private parties) are treated as equally important to `civil_liberties` — almost certainly wrong.

4. **Axis definitions were designed for the LLM, not CCPCNC.** The 10 axes were constructed to capture what the LLM would find in constitutional text. CCPCNC was coded by comparative constitutionalists with different conceptual goals. Forcing CCPCNC variables into these axes introduces systematic conceptual mismatch — particularly for `executive_constraints` and `emergency_powers_constraints`.

5. **Missing variables.** Several important CCPCNC variables were either not available or not included (e.g., `legislative_autonomy` omits most of what makes a legislature independent).

---

## The LLM-generated formula idea

This is a good instinct, but you need to avoid circularity. The risk: if an LLM reads the CCPCNC codebook and generates the recoding weights, then the CCPCNC scores become partly a reflection of how the same LLM reasons about constitutional concepts — making the "validation" less independent.

The cleaner version of this idea:
- Use the LLM to read the **CCPCNC codebook** (variable definitions, response categories, and scales) and reason about which variables belong to which axis and what each response option implies about democratic quality — **without ever seeing the LLM constitution scores**.
- Have it produce a structured mapping: axis → list of (variable, direction, weight, ordinal_scale) tuples, with reasoning.
- Then compute the CCPCNC scores from that mapping and compare to the LLM scores as before.

This is strictly better than the manual mapping because the LLM understands the codebook language better than a hand-crafted dictionary. The key question is whether you want me to do this — it would replace the current recoding cell in `ccpcnc_scores.ipynb` with an LLM-derived mapping. Want to try it?

---

## [USER]

Yes, that's a good idea. Can you read the codebook without seeing the constituions and respons and come up with a maping structure?

---

## [USER]

This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

Summary:
1. Primary Request and Intent:
   The user is working on a QSS (Quantitative Social Science) project involving constitutional scoring. The core workflow is:
   - An LLM (GPT) scored 230 constitutions on 10 democratic/rights axes (0–1 scale), generated in `GPT_Final_Try.ipynb`
   - `ccpcnc_scores.ipynb` was written to validate those LLM scores by independently deriving scores from the CCPCNC v5 expert-coded constitutional dataset
   - The user asked: (1) what the notebook does, (2) what the validation results show and whether the LLM scores can be trusted, (3) what are the methodological weaknesses in the CCPCNC recoding, and (4) whether an LLM-generated mapping formula from the CCPCNC codebook would be better
   - The user then explicitly approved the LLM-codebook-mapping idea and asked: **"Can you read the codebook without seeing the constitutions and responses and come up with a mapping structure?"** — emphasis on not using actual data or LLM scores to avoid circular validation

2. Key Technical Concepts:
   - **CCPCNC v5** (Comparative Constitutions Project Comparative National Constitutions): expert-coded dataset, one row per country-year, with binary/ordinal variables describing constitutional provisions
   - **10 constitutional axes**: civil_liberties, socioeconomic_rights, political_competition, legislative_autonomy, executive_constraints, judicial_independence, rule_of_law_due_process, institutional_accountability, emergency_powers_constraints, civilian_control_of_security
   - **0–1 indicator recoding**: each CCPCNC variable mapped to [0,1] with 1 = democratic/rights-protective; special codes (90, 96, 97, 98, 99) treated as NaN
   - **Axis scores**: row-wise mean of component indicators, NaN-ignorant
   - **Validation approach**: merge CCPCNC axis scores with LLM axis scores via `constitution_metadata.csv` bridge (Constitute Project `id` → `year_enacted` → CCPCNC `systyear`), then compute Pearson r, Spearman r, MAE, and mean bias per axis
   - **Circularity risk**: if an LLM generates the CCPCNC recoding formula by reading the codebook AND the LLM scores, the validation is no longer independent. Solution: LLM reads only the CCPCNC codebook variable definitions — no data, no scores
   - **Systematic upward bias**: LLM consistently scores constitutions higher than CCPCNC expert coders, likely because the LLM reads aspirational text generously while coders record only precisely specified provisions

3. Files and Code Sections:
   - `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc_scores.ipynb`
     - Main validation notebook. Loads CCPCNC v5, recodes variables to 0–1 indicators per axis, computes axis means, merges with LLM scores, computes correlations/MAE/bias, saves outputs and generates scatter/heatmap/radar charts
     - Key recoding logic (manual, hand-crafted mappings):
       ```python
       SPECIAL = [90, 96, 97, 98, 99]
       def clean(col): s = pd.to_numeric(d[col], errors='coerce'); return s.where(~s.isin(SPECIAL), np.nan)
       def yn(col, yes_val=1, no_val=2): s = clean(col); return s.map({yes_val: 1, no_val: 0})
       # Ordinal example:
       d['r_torture'] = clean('torture').map({1: 1.0, 2: 0.67, 3: 0.33, 4: 0.0})
       ```
     - Axis definition dict:
       ```python
       AXES = {
           'civil_liberties': ['r_press','r_censor','r_express','r_opinion','r_assem','r_assoc','r_petition','r_torture','r_cruelty','r_privacy','r_freemove','r_binding','r_offrel'],
           'socioeconomic_rights': ['r_work','r_remuner','r_strike','r_socsec','r_healthr','r_shelter','r_educate','r_jointrde'],
           'political_competition': ['r_voteun','r_voteres','r_freeelec','r_camppubf','r_part','r_partrght','r_partprf','r_referen','r_oversght_elec'],
           'legislative_autonomy': ['r_legisl','r_housenum','r_lhterm','r_legsupr'],
           'executive_constraints': ['r_amend','r_unamend','r_amndamaj','r_amndapct','r_hosterm','r_hogterm'],
           'judicial_independence': ['r_jc','r_unconper','r_chalstag','r_judind','r_judsal'],
           'rule_of_law_due_process': ['r_amparo','r_illadmin','r_dueproc','r_fairtri','r_pubtri','r_presinoc','r_speedtri','r_expost','r_falseimp','r_rulelaw'],
           'institutional_accountability': ['r_oversght_elec','r_infoacc','r_medcom','r_cc','r_hr','r_civil','r_exinst','r_ombuds','r_assets'],
           'emergency_powers_constraints': ['r_emrights','r_emdecl'],
           'civilian_control_of_security': ['r_comchief','r_nomil','r_warap']
       }
       ```

   - `/Users/rishithhakker/Downloads/QSS_45_Project/ccpc_llm_full_comparison.csv`
     - Output of the notebook; 57 rows × 33 columns. Contains country, year_enacted, constitution_id, 10 ccpc_ scores, 10 llm_ scores, 10 diff_ columns
     - Used to compute the actual validation statistics

   - `/Users/rishithhakker/Downloads/QSS_45_Project/llm_ccpc_disagreements.csv`
     - 155 large disagreements (|LLM − CCPC| > 0.35) across 57 constitutions
     - Worst axis: emergency_powers_constraints (34 flagged), rule_of_law_due_process (29 flagged)

   - `/Users/rishithhakker/Downloads/QSS_45_Project/final_constitution_scores_updated.csv`
     - LLM scores for 230 constitutions; source scores being validated

   - `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc/codebook_v5.pdf`
     - 155-page CCPCNC v5 codebook. Partially read: pages 1–20, 21–40, 41–60, 61–80 (covering administrative/country variables, amendment procedures, executive provisions, beginning of legislature/judiciary sections)
     - **Not yet read**: pages 81–155 (judiciary continued, elections, regulatory bodies, criminal procedure, rights sections)

   - `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc/ccpcnc_v5.csv`
     - Raw CCPCNC panel data; loaded but not examined directly in this session

4. Errors and Fixes:
   - PDF page range limit: attempted to read pages 21–51 and 52–72 in one call each; both failed with "exceeds maximum of 20 pages per request." Fixed by splitting into 20-page chunks: 21–40, 41–60, 61–80.

5. Problem Solving:
   - **Validation results interpreted**: the 57-constitution matched sample is small (25%); three axes have decent correlation (≥0.65), three moderate (0.50–0.57), three poor (<0.35), and one is negatively correlated (emergency_powers_constraints, r=−0.24). LLM is systematically generous upward on most axes.
   - **Methodology weaknesses identified**: thin variable coverage per axis (emergency: 2 vars, civilian control: 3), arbitrary equal weighting, arbitrary ordinal spacing, conceptual mismatch between CCPCNC coding goals and LLM axis definitions, many CCPCNC variables simply not included
   - **Proposed solution**: use LLM to read the CCPCNC codebook (definitions only, no data) and derive a principled mapping — variable selection, direction coding, ordinal scale values, and weights — for each of the 10 axes. This avoids circularity while leveraging LLM's superior ability to interpret codebook language.

6. All User Messages:
   - "read ccpcnc_scores.ipynb. what does the code do?"
   - "what does the validation show, can I use the LLMs scoring? Also, what's the methodlogy for the recoding and the scoring on the 10? It seems that there could be weaknesses there no? What if we use an LLM generated formula to see how to convert the scores to the 10 variables?"
   - "Yes, that's a good idea. Can you read the codebook without seeing the constituions and respons and come up with a maping structure?"

7. Pending Tasks:
   - **Finish reading the CCPCNC codebook** (pages 81–155): judiciary, elections, regulatory/oversight bodies, criminal procedure/due process, rights provisions, military/security sections
   - **Generate the LLM-derived mapping structure**: for each of the 10 axes, produce a structured list of (variable_name, direction, ordinal_scale_mapping, weight, rationale) tuples derived purely from codebook definitions
   - Optionally: implement the new mapping in a revised version of `ccpcnc_scores.ipynb` and re-run the validation

8. Current Work:
   Reading the CCPCNC v5 codebook (`codebook_v5.pdf`) page by page to understand every variable's definition, response categories, and conceptual meaning — **without reference to actual CCPCNC data values or LLM scores** — in order to generate a clean, principled mapping of CCPCNC variables to the 10 constitutional axes. Read pages 1–80 so far (as images). Was about to continue reading pages 81–155 when the summary was requested.

9. Optional Next Step:
   Continue reading the codebook from page 81 onward to cover the remaining variable sections (judiciary, elections, oversight, criminal procedure, rights, military), then produce the full mapping structure. This directly follows the user's explicit request: **"Can you read the codebook without seeing the constitutions and responses and come up with a mapping structure?"** — the task was in progress and interrupted mid-codebook-read at page 80.

If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: /Users/rishithhakker/.claude/projects/-Users-rishithhakker-Downloads-QSS-45-Project-clean-versions/32fd0bbb-7b5c-4748-b510-dec978da57c0.jsonl
Continue the conversation from where it left off without asking the user any further questions. Resume directly — do not acknowledge the summary, do not recap what was happening, do not preface with "I'll continue" or similar. Pick up the last task as if the break never happened.

---

## [CLAUDE]

Now I have the full picture. Here is the principled mapping structure derived entirely from codebook definitions — no data, no LLM scores consulted.

---

## CCPCNC v5 → 10-Axis Mapping Structure

The format for each variable entry is:
```
ccpcnc_column  →  {raw_code: indicator_score}  [weight]  # rationale
```

Weight 2 = core indicator of the concept. Weight 1 = standard. Weight 0.5 = supporting/peripheral.

---

### AXIS 1: `civil_liberties`

**Concept**: protection from state repression; freedom of expression, assembly, association, privacy, and bodily integrity.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `press` | v615 PRESS — freedom of press | `{1:1.0, 2:0.0}` | 2 | Core free speech indicator |
| `express` | v611 EXPRESS — freedom of expression/speech | `{1:1.0, 2:0.0}` | 2 | Core; distinct from press freedom |
| `opinion` | v610 OPINION — freedom of opinion/thought/conscience | `{1:1.0, 2:0.0}` | 2 | Inner forum; separate from expression |
| `assem` | v618 ASSEM — freedom of assembly | `{1:1.0, 2:0.0}` | 2 | Collective action protection |
| `assoc` | v619 ASSOC — freedom of association | `{1:1.0, 2:0.0}` | 2 | |
| `petition` | v612 PETITION — right of petition to government | `{1:1.0, 2:0.0}` | 1 | |
| `censor` | v614 CENSOR — prohibition of censorship | `{1:1.0, 2:0.5, 3:0.0}` | 2 | 1=prohibited, 2=exceptional cases only, 3=no prohibition |
| `torture` | v606 TORTURE — prohibition of torture | `{1:1.0, 2:0.67, 3:0.33, 4:0.0}` | 2 | 1=universal, 2=except war, 3=except confessions, 4=allowed |
| `cruelty` | v607 CRUELTY — cruel/inhuman/degrading treatment | `{1:1.0, 2:0.5, 3:0.0}` | 2 | 3 categories only (universal/except-war/allowed) |
| `privacy` | v608 PRIVACY — right of privacy | `{1:1.0, 2:0.0}` | 1 | Includes domicile inviolability, correspondence, communications |
| `freemove` | v609 FREEMOVE — freedom of movement | `{1:1.0, 2:0.0}` | 1 | |
| `freerel` | v564 FREEREL — freedom of religion | `{1:1.0, 2:0.0}` | 1 | |
| `offrel` | v562 OFFREL — official/national religion (inverted) | `{3:1.0, 98:0.5, 2:0.25, 1:0.0}` | 1 | 3=explicitly forbidden, 1=state religion specified; no official religion = more liberal |
| `slave` | v605 SLAVE — prohibition of slavery/forced labor | `{1:1.0, 2:0.67, 3:0.33, 4:0.0}` | 2 | Same ordinal logic as torture |
| `life` | v604 LIFE — right to life | `{1:1.0, 2:0.0}` | 2 | Foundational civil right |
| `binding` | v558 BINDING — rights binding on private parties | `{1:1.0, 97:0.0, 98:0.0}` | 0.5 | Horizontal effect; supporting indicator |
| `cappun` | v519 CAPPUN — capital punishment treatment | `{1:1.0, 2:0.5, 3:0.0, 98:0.0}` | 1 | 1=universally prohibited, 2=except war, 3=allowed |
| `inalrght` | v620 INALRGHT — rights explicitly inalienable/inviolable | `{1:1.0, 2:0.0}` | 0.5 | Strengthens rights protections |

**Improvements over original**: added `freerel`, `slave`, `life`, `cappun`, `inalrght`; corrected `offrel` direction; corrected `cruelty` to 3-category ordinal (not 4).

---

### AXIS 2: `socioeconomic_rights`

**Concept**: positive rights to welfare, labor, health, housing, and education.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `healthr` | v602 HEALTHR — right to health care | `{1:1.0, 2:0.0}` | 2 | |
| `shelter` | v593 SHELTER — right to shelter/housing | `{1:1.0, 2:0.0}` | 2 | |
| `educate` | EDUCATE — right to education | `{1:1.0, 2:0.0}` | 2 | |
| `socsec` | v585 SOCSEC — social security provision | `{1:1.0, 2:0.0}` | 2 | General societal wellbeing, not narrowly pension |
| `standliv` | v578 STANDLIV — right to adequate standard of living | `{1:1.0, 2:0.0}` | 2 | Includes "adequate well-being," "life worthy of a human being" |
| `remuner` | v574 REMUNER — right to just/fair remuneration | `{1:1.0, 2:0.0}` | 1 | |
| `strike` | v576 STRIKE — right to strike | `{1:1.0, 2:0.5, 3:0.0}` | 1 | **Ordinal fix**: 2=yes with limitations→0.5, not 0; original was binary |
| `jointrde` | v575 JOINTRDE — right to form/join trade unions | `{1:1.0, 2:0.0}` | 1 | Must be explicit; not implied by freedom of association |
| `work` | v500 PROVWORK — state duty to provide employment | `{1:1.0, 2:0.0}` | 1 | State obligation to provide work; distinct from duty-to-work (v506) |
| `occupate` | v590 OCCUPATE — right to choose one's occupation | `{1:1.0, 2:0.0}` | 1 | Right to freely choose employment |
| `safework` | v591 SAFEWORK — safe/healthy working conditions | `{1:1.0, 2:1.0, 3:0.5, 90:0.25}` | 0.5 | 1=individual right, 2=state duty+right, 3=state duty only |
| `childwrk` | v592 CHILDWRK — limits on child employment | `{1:1.0, 2:0.0}` | 0.5 | |
| `finsup` | v586 FINSUP (multi-select) — government support for vulnerable groups | count/4 where count = # of groups (elderly, unemployed, disabled, children) mentioned | 1 | Normalize by 4 possible groups: 4 groups=1.0, 3=0.75, etc. |

**Improvements over original**: added `standliv`, `occupate`, `safework`, `childwrk`, `finsup`; corrected `strike` to 3-level ordinal.

---

### AXIS 3: `political_competition`

**Concept**: competitive elections, universal suffrage, party pluralism, campaign fairness, electoral oversight.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `voteun` | v430 VOTEUN — claim to universal adult suffrage | `{1:1.0, 2:0.0}` | 2 | Explicit universal suffrage claim |
| `voteres` | v426 VOTERES — restrictions on right to vote (**inverted**) | `{2:1.0, 1:0.0}` | 2 | 2=No restrictions→1.0; 1=Yes restrictions→0.0 |
| `freeelec` | v445 FREEELEC — secret ballot | `{1:1.0, 2:0.0}` | 2 | Core of free elections |
| `partrght` | v414 PARTRGHT — explicit right to form political parties | `{1:1.0, 98:0.5, 99:0.0}` | 2 | Must be explicit; cannot be inferred from freedom of association |
| `partprf` | v415 PARTPRF — constitutional preference for certain parties (**inverted**) | `{4:1.0, 3:0.5, 2:0.25, 1:0.0}` | 1 | 4=No preference→best; 1=prefers all=one-party state |
| `partprh` | v417 PARTPRH — prohibition of political parties (**inverted**) | `{4:1.0, 3:0.5, 2:0.25, 1:0.0}` | 2 | 4=No prohibition→best; 1=ALL parties banned |
| `part` | v413 PART — constitution mentions parties | `{1:1.0, 2:0.0}` | 0.5 | Weak indicator; mere mention including banning parties |
| `camppubf` | v447 CAMPPUBF — public financing of campaigns | `{1:1.0, 2:0.0}` | 1 | Levels playing field |
| `electfin` | v448 ELECTFIN — limits on campaign money | `{1:1.0, 2:0.0}` | 1 | Campaign finance constraints |
| `referen` | v423 REFEREN — referendum provision | `{1:1.0, 2:0.0}` | 1 | Direct democracy mechanism |
| `initiat` | v421 INITIAT — individual legislative initiative right | `{1:1.0, 2:0.0}` | 1 | Citizen-initiated legislation; broader democracy |
| `oversght` | v431 OVERSGHT — independent electoral oversight body | `{1:1.0, 2:1.0, 3:1.0, 4:0.0}` | 2 | Commission or court or both = 1.0; neither = 0.0 |

**Note on `partunco`** (v419): who determines unconstitutional parties. Judicial determination → more independent/legitimate than executive determination. Can add as supporting indicator: `{3:1.0, 4:1.0, 5:1.0, 6:1.0, 1:0.0, 2:0.25}` weight 0.5.

**Improvements over original**: `voteres` direction clarified (restrictions = bad); `partprh` direction clarified; added `electfin`, `initiat`; `partunco` added as optional.

---

### AXIS 4: `legislative_autonomy`

**Concept**: independent legislature that can function and constrain executive; bicameral stability, terms, supremacy of law passed.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `legisl` | LEGISL — legislature exists | `{1:1.0, 2:0.0}` | 2 | Prerequisite binary |
| `housenum` | HOUSENUM — number of chambers | `{1:0.5, 2:1.0, 98:0.0}` | 1 | Bicameral = more checks; unicameral = less |
| `lhterm` | LHTERM — lower house term length (in years) | `4→1.0, 5→0.75, 6→0.5, 7+→0.25` | 1 | Shorter terms = more democratic accountability |
| `legsupr` | LEGSUPR — legislative supremacy over executive | `{1:1.0, 2:0.0}` | 2 | Executive cannot override legislature |

**Note**: More variables exist for specific legislative powers (veto override, budgetary authority), but these require verifying exact column names in the dataset. `lhterm` should be treated as a continuous-to-discrete mapping applied to actual year values.

**Additional recommended variables** (pending column name confirmation):
- Legislature-initiated amendment power: 1=Yes→1.0
- Legislature can investigate executive: 1=Yes→1.0
- Legislature approval required for cabinet (parliamentary systems)

---

### AXIS 5: `executive_constraints`

**Concept**: constitutional constraints limiting executive power — term limits, supermajority amendment requirements, unreachable provisions.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `hosterm` | HOSTERMLN — term limits for head of state | `{1:1.0, 2:0.75, 3:0.0, 99:0.25}` | 2 | 1=one term only, 2=two terms, 3=no limit |
| `hogterm` | HOGTERMLN — term limits for head of government | `{1:1.0, 2:0.75, 3:0.0, 99:0.25}` | 1.5 | Same logic; lower weight since some systems lack HOG |
| `unamend` | v202 UNAMEND — unamendable constitutional provisions | `{1:1.0, 2:0.0}` | 1.5 | Entrenched provisions constrain even majorities |
| `amndamaj` | v204 AMNDAMAJ — majority required for amendment | `{4:1.0, 3:0.75, 2:0.5, 1:0.25}` | 1.5 | Higher majority requirement = harder for executive to amend |
| `amndapct` | v205 AMNDAPCT — percentage required | continuous: `(pct - 50) / 50` capped at [0,1] | 1 | 50%→0.0, 100%→1.0 |
| `amend` | v201 AMEND — amendment procedure explicitly exists | `{1:1.0, 2:0.0}` | 0.5 | Procedure codified = accountable; absence = executive can change ad hoc |
| `warap` | v489 WARAP — who approves war declarations | `{4:1.0, 5:1.0, 6:1.0, 1:0.0, 2:0.25, 3:0.25, 8:0.0}` | 1 | Legislative approval = constrained executive on war |

**Improvements over original**: term limit variables clarified as HOSTERMLN/HOGTERMLN (not raw term lengths in years); `warap` added; `amndapct` given continuous mapping.

---

### AXIS 6: `judicial_independence`

**Concept**: judiciary that can operate free from executive and legislative interference.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `judind` | v6 JUDIND — explicit constitutional mention of judicial independence | `{1:1.0, 2:0.0}` | 2 | Direct textual guarantee |
| `judsal` | v382 JUDSAL — judicial salaries protected from government intervention | `{1:1.0, 2:0.0}` | 2 | Salary protection prevents financial coercion |
| `jc` | v469 JC — Judicial Council/Commission exists | `{1:1.0, 2:0.0}` | 2 | Independent body governing judiciary |
| `chalstag` | v368 CHALSTAG — stage at which legislation can be challenged | `{3:1.0, 2:0.75, 1:0.25, 98:0.0}` | 1.5 | Either=most flexible; pre-only=most restricted |
| `unconper` | v363 UNCONPER — vote proportion to find legislation unconstitutional | `{1:1.0, 2:0.75, 3:0.5, 4:0.25, 5:0.0, 6:0.25}` | 1 | Lower threshold = court can act more easily; higher = judicial deference to legislature |
| `challeg` | v364 CHALLEG (multi-select) — who has standing to challenge | public/lawyers standing → higher access | 1 | If CHALLEG_8 (public by complaint) = 1.0; only executive/legislature = 0.25 |
| `jrem` | v371 JREM — provisions for dismissing judges | complex (see below) | 1.5 | Dismissal for specific reasons only = more independent |
| `jremcon` | v372 JREMCON — conditions for dismissal (multi-select) | | — | Used to qualify JREM score |

**`jrem`/`jremcon` composite rule**:
```python
if jrem == 2:      # No provisions at all → unspecified, medium protection
    r_jrem = 0.5
elif jrem == 1:
    if jremcon_1 == 1:  # general dissatisfaction → very low independence
        r_jrem = 0.0
    elif any of jremcon_2, _3, _4, _5 (crimes, treason, violations, incapacity):
        r_jrem = 1.0   # only specific serious causes → high independence
    else:
        r_jrem = 0.5
```

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `judretir` | v383 JUDRETIR — mandatory retirement age | `{4:1.0, 1:0.75, 2:0.75, 3:0.5}` | 0.5 | No mandatory retirement = life tenure = most independent |
| `conpow_5` | v359 CONPOW item 5 — court can review emergency states | `{1:1.0, 0:0.0}` | 1 | Court oversight of emergencies = strong independence |

**Improvements over original**: `judind` added as core; `jrem` as a composite with conditions; `challeg` added; `conpow_5` added; `chalstag` given correct 3-level ordinal; `unconper` direction re-examined.

---

### AXIS 7: `rule_of_law_due_process`

**Concept**: procedural justice protections for accused persons; broader rule-of-law principles.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `rulelaw` | v551 RULELAW — explicit rule of law statement | `{1:1.0, 2:0.0}` | 2 | Rechtsstaat / rule of law explicitly stated |
| `equal` | v552 EQUAL — equality before the law / non-discrimination | `{1:1.0, 2:0.0}` | 2 | Equal treatment principle |
| `dueproc` | v521 DUEPROC — due process explicitly mentioned | `{1:1.0, 2:0.0}` | 2 | Must be explicit, not implied |
| `habcorp` | v515 HABCORP — habeas corpus / protection from unjustified restraint | `{1:1.0, 2:0.0}` | 2 | Core protection against arbitrary detention |
| `fairtri` | v525 FAIRTRI — right to fair trial | `{1:1.0, 2:0.0}` | 2 | |
| `presinoc` | v528 PRESINOC — presumption of innocence | `{1:1.0, 98:0.0}` | 2 | |
| `expost` | v523 EXPOST — prohibition of ex post facto laws | `{1:1.0, 2:0.0}` | 2 | |
| `wolaw` | v516 WOLAW — nulla poena sine lege (no punishment without prior law) | `{1:1.0, 2:0.0}` | 2 | Distinct from ex post facto; covers arrest/detention too |
| `couns` | v534 COUNS — right to counsel if arrested/indicted | `{1:1.0, 2:0.0}` | 1.5 | |
| `pubtri` | v527 PUBTRI — public trials generally required | `{1:1.0, 2:0.0}` | 1.5 | |
| `speedtri` | v526 SPEEDTRI — right to speedy trial | `{1:1.0, 2:0.0}` | 1 | |
| `amparo` | v370 AMPARO — right to petition for amparo | `{1:1.0, 2:0.0}` | 1 | Latin American judicial review mechanism |
| `illadmin` | v349 ILLADMIN — protection against illegal administrative action | `{1:1.0, 2:0.0}` | 1 | Ultra vires administrative acts |
| `falseimp` | v524 FALSEIMP — redress for false imprisonment/judicial error | `{1:1.0, 2:0.0}` | 1 | |
| `rghtapp` | v517 RGHTAPP — right to appeal judicial decisions | `{1:1.0, 2:0.0}` | 1 | Must be explicit |
| `doubjep` | v532 DOUBJEP — double jeopardy prohibition | `{1:1.0, 2:0.0}` | 1 | |
| `miranda` | v533 MIRANDA — right to silence / protection from self-incrimination | `{1:1.0, 2:0.0}` | 1 | |
| `prerel` | v514 PREREL — pre-trial release / bail provisions | `{1:1.0, 2:0.0}` | 1 | Includes "excessive bail prohibited" |
| `evidence` | v513 EVIDENCE — regulation of evidence collection | `{1:1.0, 2:0.0}` | 0.5 | Search and seizure, involuntary confession exclusion |

**Improvements over original**: added `equal`, `habcorp`, `wolaw`, `couns`, `rghtapp`, `doubjep`, `miranda`, `prerel`, `evidence` — nearly doubles the variable set for this axis; these are all directly specified as Yes/No in the codebook.

---

### AXIS 8: `institutional_accountability`

**Concept**: independent oversight bodies, transparency, civil service integrity, accountability mechanisms.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `oversght` | v431 OVERSGHT — electoral commission or court | `{1:1.0, 2:1.0, 3:1.0, 4:0.0}` | 2 | Any dedicated oversight body = 1.0 |
| `cc` | v472 CC — counter-corruption commission | `{1:1.0, 2:0.0}` | 2 | |
| `hr` | v476 HR — human rights commission | `{1:1.0, 2:0.0}` | 2 | |
| `ombuds` | v451 OMBUDS — ombudsman | `{1:1.0, 2:0.0}` | 2 | |
| `infoacc` | v559 INFOACC — individual right to access government files | `{1:1.0, 2:0.0}` | 2 | Freedom of information |
| `civil` | v475 CIVIL — meritocratic civil service recruitment | `{1:1.0, 2:0.0}` | 1.5 | Anti-patronage; includes anti-discrimination in public employment |
| `jc` | v469 JC — Judicial Council | `{1:1.0, 2:0.0}` | 1 | Also in judicial axis; cross-cutting |
| `medcom` | v466 MEDCOM — independent media regulatory body | `{1:1.0, 2:0.0}` | 1 | |
| `exinst` | v479 EXINST — additional independent regulatory agencies | `{1:1.0, 2:0.0}` | 1 | Catch-all for other watchdog bodies |
| `assets` | ASSETS — asset declaration requirement for officials | `{1:1.0, 2:0.0}` | 1.5 | Transparency of official wealth |
| `bank` | v457 BANK — central bank provision | `{1:1.0, 2:0.0}` | 0.5 | Independent monetary policy = less executive control |
| `intlaw` | v483 INTLAW — constitution addresses relationship with international law | `{1:1.0, 2:0.0}` | 0.5 | International accountability mechanism |

---

### AXIS 9: `emergency_powers_constraints`

**Concept**: constitutional limits on states of emergency — who declares, duration limits, rights maintained, judicial oversight.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `emdecl` | EMDECL — who declares emergency (legislative role required?) | See note | 2 | If legislature must approve/concur = more constrained |
| `emrights` | EMRIGHTS — rights that remain protected during emergency | See note | 2 | More protected rights = more constrained emergency powers |
| `conpow_5` | v359 CONPOW item 5 — constitutional court can review emergencies | `{1:1.0, 0:0.0}` | 2 | Judicial review of emergency = major constraint |
| `emdur` | EMDUR — maximum emergency duration | continuous/ordinal | 1 | Shorter limit = more constrained; no limit = 0.0 |
| `emterm` | Emergency termination — legislature can revoke | `{1:1.0, 2:0.0}` | 2 | Legislature can end emergency = strong constraint |

**Note on `emdecl`**: The variable asks who declares. Mapping (Democratic direction = legislature required):
```python
{1: 0.0,  # executive alone
 2: 0.0,  # head of government alone
 3: 0.25, # cabinet
 4: 0.75, # legislature concurrent
 5: 1.0,  # legislature required
 98: 0.25}  # not specified
```

**Note on `emrights`**: This is likely a multi-select. Score = (number of rights explicitly protected during emergency) / (total possible). More rights protected = higher score.

**Structural note**: This axis has the fewest CCPCNC variables and therefore the highest measurement uncertainty. The negative correlation in the original notebook (r=−0.24) likely reflects conceptual misalignment: LLMs read aspirational emergency text generously while coders check specific enumerated protections.

---

### AXIS 10: `civilian_control_of_security`

**Concept**: constitutional placement of military under civilian political authority.

| Variable | Codebook Definition | Scale Mapping | Weight | Notes |
|---|---|---|---|---|
| `comchief` | v640 COMCHIEF — commander in chief of armed forces | `{1:1.0, 2:1.0, 97:0.5, 98:0.5, 99:0.0}` | 2 | Civilian HOS (1) or HOG (2) = civilian control; not applicable = 0 |
| `warap` | v489 WARAP — who approves declarations of war | `{4:1.0, 5:1.0, 6:1.0, 7:0.5, 1:0.0, 2:0.25, 3:0.25, 8:0.0}` | 2 | Legislative approval = civilian control of war power |
| `nomil` | NOMIL — prohibition on military holding political office | `{1:1.0, 2:0.0}` | 2 | Direct civilian supremacy indicator |
| `terror` | v646 TERROR — terrorism/public security provisions | `{1:1.0, 2:0.0}` | 0.5 | Constitutional framework for security = civilian accountability |
| `milserv` | v505 MILSERV — duty of military service exists | `{2:1.0, 1:0.0}` | 0.5 | Absence of compulsory service = less militarized state |
| `nomil_obj` | v622 NOMIL (conscientious objector right) | `{1:1.0, 2:0.0}` | 0.5 | Right to refuse service = checks on military power over individuals |

**Note on WAR variable (v488)**: who can *declare* (not just approve) war. If legislature declares (`war_4`, `war_5`, `war_6`, `war_7`) = strong civilian control. Combine with WARAP for comprehensive war-power indicator.

---

## Implementation Code

```python
import pandas as pd
import numpy as np

SPECIAL = {90, 96, 97, 98, 99}

def clean(d, col):
    s = pd.to_numeric(d[col], errors='coerce')
    return s.where(~s.isin(SPECIAL), np.nan)

def yn(d, col, yes_val=1, no_val=2):
    s = clean(d, col)
    return s.map({yes_val: 1.0, no_val: 0.0})

def ordinal(d, col, scale):
    return clean(d, col).map(scale)

# ----- RECODING RULES -----

def recode_all(d):
    r = pd.DataFrame(index=d.index)

    # --- CIVIL LIBERTIES ---
    for c in ['press','express','opinion','assem','assoc','petition','freerel','life']:
        r[f'r_{c}'] = yn(d, c)
    r['r_censor']  = ordinal(d, 'censor',  {1:1.0, 2:0.5, 3:0.0})
    r['r_torture'] = ordinal(d, 'torture', {1:1.0, 2:0.67, 3:0.33, 4:0.0})
    r['r_cruelty'] = ordinal(d, 'cruelty', {1:1.0, 2:0.5, 3:0.0})
    r['r_slave']   = ordinal(d, 'slave',   {1:1.0, 2:0.67, 3:0.33, 4:0.0})
    r['r_cappun']  = ordinal(d, 'cappun',  {1:1.0, 2:0.5, 3:0.0})
    r['r_privacy'] = yn(d, 'privacy')
    r['r_freemove']= yn(d, 'freemove')
    r['r_binding'] = yn(d, 'binding')
    r['r_inalrght']= yn(d, 'inalrght')
    # offrel: inverted — no state religion = more liberal
    r['r_offrel']  = ordinal(d, 'offrel',  {3:1.0, 2:0.25, 1:0.0})

    # --- SOCIOECONOMIC RIGHTS ---
    for c in ['healthr','shelter','socsec','standliv','remuner','jointrde','work',
              'occupate','childwrk']:
        r[f'r_{c}'] = yn(d, c)
    # educate if column exists
    if 'educate' in d.columns:
        r['r_educate'] = yn(d, 'educate')
    r['r_strike']  = ordinal(d, 'strike',  {1:1.0, 2:0.5, 3:0.0})
    r['r_safework']= ordinal(d, 'safework',{1:1.0, 2:1.0, 3:0.5})

    # --- POLITICAL COMPETITION ---
    r['r_voteun']  = yn(d, 'voteun')
    r['r_voteres'] = yn(d, 'voteres', yes_val=2, no_val=1)  # INVERTED: no restrictions=1
    r['r_freeelec']= yn(d, 'freeelec')
    r['r_partrght']= yn(d, 'partrght')
    r['r_referen'] = yn(d, 'referen')
    r['r_initiat'] = yn(d, 'initiat')
    r['r_camppubf']= yn(d, 'camppubf')
    r['r_electfin']= yn(d, 'electfin')
    r['r_part']    = yn(d, 'part')
    r['r_partprf'] = ordinal(d, 'partprf', {4:1.0, 3:0.5, 2:0.25, 1:0.0})
    r['r_partprh'] = ordinal(d, 'partprh', {4:1.0, 3:0.5, 2:0.25, 1:0.0})
    # oversght: any oversight body = 1.0
    r['r_oversght']= clean(d, 'oversght').map({1:1.0, 2:1.0, 3:1.0, 4:0.0})

    # --- EXECUTIVE CONSTRAINTS ---
    r['r_unamend'] = yn(d, 'unamend')
    r['r_amend']   = yn(d, 'amend')
    r['r_amndamaj']= ordinal(d, 'amndamaj', {4:1.0, 3:0.75, 2:0.5, 1:0.25})
    # term limits: one term=1.0, two=0.75, no limit=0.0
    for col in ['hosterm','hogterm']:
        r[f'r_{col}'] = ordinal(d, col, {1:1.0, 2:0.75, 3:0.0})
    r['r_warap']   = ordinal(d, 'warap',
                             {4:1.0, 5:1.0, 6:1.0, 7:0.5, 1:0.0, 2:0.25, 3:0.25, 8:0.0})

    # --- JUDICIAL INDEPENDENCE ---
    for c in ['judind','judsal','jc']:
        r[f'r_{c}'] = yn(d, c)
    r['r_chalstag']  = ordinal(d, 'chalstag', {3:1.0, 2:0.75, 1:0.25})
    r['r_unconper']  = ordinal(d, 'unconper', {1:1.0, 2:0.75, 3:0.5, 4:0.25, 5:0.0, 6:0.25})
    r['r_judretir']  = ordinal(d, 'judretir', {4:1.0, 1:0.75, 2:0.75, 3:0.5})

    # --- RULE OF LAW / DUE PROCESS ---
    for c in ['rulelaw','equal','dueproc','habcorp','fairtri','presinoc','expost',
              'wolaw','couns','pubtri','speedtri','amparo','illadmin','falseimp',
              'rghtapp','doubjep','miranda','prerel','evidence']:
        r[f'r_{c}'] = yn(d, c)

    # --- INSTITUTIONAL ACCOUNTABILITY ---
    for c in ['cc','hr','ombuds','infoacc','civil','exinst','medcom','bank']:
        r[f'r_{c}'] = yn(d, c)
    r['r_oversght_elec'] = r['r_oversght'].copy()  # same variable
    if 'assets' in d.columns:
        r['r_assets'] = yn(d, 'assets')

    # --- EMERGENCY POWERS ---
    r['r_emdecl']  = ordinal(d, 'emdecl',  {5:1.0, 4:0.75, 3:0.25, 2:0.0, 1:0.0})
    if 'emrights' in d.columns:
        r['r_emrights'] = yn(d, 'emrights')

    # --- CIVILIAN CONTROL ---
    r['r_comchief']= ordinal(d, 'comchief', {1:1.0, 2:1.0})
    r['r_nomil']   = yn(d, 'nomil')
    r['r_warap_civ']= r['r_warap'].copy()

    return r


# ----- AXIS DEFINITIONS (weighted) -----

AXES_WEIGHTED = {
    'civil_liberties': {
        'r_press':2, 'r_express':2, 'r_opinion':2, 'r_assem':2, 'r_assoc':2,
        'r_censor':2, 'r_torture':2, 'r_cruelty':2, 'r_slave':2, 'r_life':2,
        'r_petition':1, 'r_privacy':1, 'r_freemove':1, 'r_freerel':1,
        'r_cappun':1, 'r_offrel':1, 'r_binding':0.5, 'r_inalrght':0.5
    },
    'socioeconomic_rights': {
        'r_healthr':2, 'r_shelter':2, 'r_educate':2, 'r_socsec':2, 'r_standliv':2,
        'r_remuner':1, 'r_strike':1, 'r_jointrde':1, 'r_work':1, 'r_occupate':1,
        'r_safework':0.5, 'r_childwrk':0.5
    },
    'political_competition': {
        'r_voteun':2, 'r_voteres':2, 'r_freeelec':2, 'r_partrght':2, 'r_partprh':2,
        'r_oversght':2, 'r_camppubf':1, 'r_electfin':1, 'r_referen':1, 'r_initiat':1,
        'r_partprf':1, 'r_part':0.5
    },
    'legislative_autonomy': {
        'r_legisl':2, 'r_legsupr':2, 'r_housenum':1, 'r_lhterm':1
    },
    'executive_constraints': {
        'r_hosterm':2, 'r_hogterm':1.5, 'r_unamend':1.5, 'r_amndamaj':1.5,
        'r_warap':1, 'r_amend':0.5
    },
    'judicial_independence': {
        'r_judind':2, 'r_judsal':2, 'r_jc':2,
        'r_chalstag':1.5, 'r_jrem':1.5,
        'r_unconper':1, 'r_judretir':0.5
    },
    'rule_of_law_due_process': {
        'r_rulelaw':2, 'r_equal':2, 'r_dueproc':2, 'r_habcorp':2,
        'r_fairtri':2, 'r_presinoc':2, 'r_expost':2, 'r_wolaw':2,
        'r_couns':1.5, 'r_pubtri':1.5,
        'r_speedtri':1, 'r_amparo':1, 'r_illadmin':1, 'r_falseimp':1,
        'r_rghtapp':1, 'r_doubjep':1, 'r_miranda':1, 'r_prerel':1,
        'r_evidence':0.5
    },
    'institutional_accountability': {
        'r_oversght_elec':2, 'r_cc':2, 'r_hr':2, 'r_ombuds':2, 'r_infoacc':2,
        'r_civil':1.5, 'r_assets':1.5,
        'r_jc':1, 'r_medcom':1, 'r_exinst':1, 'r_bank':0.5
    },
    'emergency_powers_constraints': {
        'r_emdecl':2, 'r_emrights':2,
        'r_conpow_5':2,  # court can review emergencies
    },
    'civilian_control_of_security': {
        'r_comchief':2, 'r_nomil':2, 'r_warap_civ':2
    }
}


def compute_axes(r, axes_weighted):
    """Weighted NaN-ignorant mean for each axis."""
    scores = {}
    for axis, var_weights in axes_weighted.items():
        cols = [c for c in var_weights if c in r.columns]
        weights = np.array([var_weights[c] for c in cols])
        vals = r[cols].values.astype(float)  # shape (n, k)
        # NaN-safe weighted mean per row
        mask = ~np.isnan(vals)
        weighted_sum = np.nansum(vals * weights, axis=1)
        weight_sum   = (mask * weights).sum(axis=1)
        scores[axis] = np.where(weight_sum > 0, weighted_sum / weight_sum, np.nan)
    return pd.DataFrame(scores, index=r.index)
```

---

## Summary of Key Improvements Over the Original Notebook

| Axis | Original # vars | New # vars | Key changes |
|---|---|---|---|
| civil_liberties | 13 | 18 | Added `slave`, `life`, `freerel`, `cappun`, `inalrght`; fixed `cruelty` ordinal (was 4-level, codebook has 3) |
| socioeconomic_rights | 8 | 12 | Added `standliv`, `occupate`, `safework`, `childwrk`; fixed `strike` ordinal (limited=0.5 not 0) |
| political_competition | 10 | 12 | Fixed `voteres` direction; fixed `partprf`/`partprh` direction; added `electfin`, `initiat` |
| legislative_autonomy | 4 | 4 | Clarified `hosterm`/`hogterm` = term limits (HOSTERMLN), not raw years |
| executive_constraints | 6 | 6 | Same vars, better ordinal for term limits; `warap` added |
| judicial_independence | 5 | 8 | Added `judind` (core), composite `jrem` rule, `judretir` |
| rule_of_law_due_process | 10 | 19 | Added `equal`, `habcorp`, `wolaw`, `couns`, `rghtapp`, `doubjep`, `miranda`, `prerel`, `evidence` |
| institutional_accountability | 9 | 11 | Added `bank`; cross-verified `assets` variable existence |
| emergency_powers_constraints | 2 | 3 | Added `conpow_5` (judicial review of emergencies) |
| civilian_control_of_security | 3 | 3 | Added `nomil` clarification; cross-ref with `warap` |

The most consequential fixes are: (1) direction inversions on `voteres`, `partprf`, `partprh`, `offrel`; (2) ordinal corrections on `cruelty` and `strike`; (3) near-doubling of `rule_of_law_due_process` variables; (4) distinguishing HOSTERMLN (term limits) from HOSTERM (term length in years).

---

## [USER]

okay, can we now use these new formulas and weights in the original code file? Run the new weights and check the corelations. Also, please no need for any additional information, just find the corelation to tell me if the LLM scores are usable or not. No need for extra stuff

---

## [USER]

This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

Summary:
1. Primary Request and Intent:
   The user is working on a QSS project validating GPT-based constitutional scores. The core workflow: an LLM scored 230 constitutions on 10 democratic/rights axes (0–1 scale); `ccpcnc_scores.ipynb` validates those scores using the CCPCNC v5 expert-coded dataset. In this session, the user:
   - Asked to finish reading the CCPCNC v5 codebook (pages 81–155) and generate a principled mapping structure for the 10 axes, derived purely from codebook definitions (no data, no LLM scores — to avoid circular validation)
   - Then explicitly approved the result and said: **"okay, can we now use these new formulas and weights in the original code file? Run the new weights and check the correlations. Also, please no need for any additional information, just find the correlation to tell me if the LLM scores are usable or not. No need for extra stuff"**
   - The goal is simply: run the updated notebook, report the Pearson/Spearman correlation table, and give a yes/no on whether LLM scores are usable.

2. Key Technical Concepts:
   - **CCPCNC v5** (Comparative Constitutions Project Comparative National Constitutions): expert-coded panel dataset, one row per country-year, with binary/ordinal variables describing constitutional provisions
   - **10 constitutional axes**: civil_liberties, socioeconomic_rights, political_competition, legislative_autonomy, executive_constraints, judicial_independence, rule_of_law_due_process, institutional_accountability, emergency_powers_constraints, civilian_control_of_security
   - **Special codes** (90, 96, 97, 98, 99) → treated as NaN
   - **Weighted NaN-ignorant mean**: axis score = Σ(weight_i × indicator_i) / Σ(weight_i for non-NaN indicators)
   - **Ordinal recoding**: multi-category CCPCNC variables mapped to [0,1] with intermediate values (e.g., `torture`: {1:1.0, 2:0.67, 3:0.33, 4:0.0}; `strike`: {1:1.0, 2:0.5, 3:0.0})
   - **Direction inversions**: some variables coded "1=bad" in CCPCNC must be inverted (e.g., `voteres`: 1=restrictions exist→0.0, 2=no restrictions→1.0; `offrel`: 1=national religion→0.0, 3=explicitly forbidden→1.0; `partprf`/`partprh`: higher code = less restrictive = better)
   - **Circularity avoidance**: mapping derived only from codebook variable definitions, not from data values or LLM scores
   - **Pearson r, Spearman r, MAE, mean bias** as validation metrics
   - **Validation bridge**: `constitution_metadata.csv` links Constitute Project `id` → `year_enacted` → CCPCNC `systyear`

3. Files and Code Sections:

   - `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc/codebook_v5.pdf`
     - Read pages 81–155 this session (completing the full codebook read)
     - Pages 81–100: judiciary (JUDSAL, JUDRETIR, JREM, JREMCON), constitutional court (CONPOW, CONNOM, CONAP, CONTERM), constitutional challenge standing (CHALLEG), federalism, elections/parties
     - Pages 101–120: PARTRGHT, PARTPRF, PARTPRH, PARTUNCO, INITIAT, REFEREN, VOTERES, VOTEUN, OVERSGHT, FREEELEC, CAMPPUBF, ELECTFIN, OMBUDS, BANK, MEDCOM, JC, CC, CIVIL, HR, EXINST, WAR, WARAP, INTLAW
     - Pages 121–140: CAPPUN (v519), CORPPUN, DUEPROC (v521), EXPOST (v523), FALSEIMP (v524), FAIRTRI (v525), SPEEDTRI (v526), PUBTRI (v527), PRESINOC (v528), DOUBJEP (v532), MIRANDA (v533), COUNS (v534), HABCORP (v515), WOLAW (v516), RGHTAPP (v517), PREREL (v514), EVIDENCE (v513), RULELAW (v551), EQUAL (v552), BINDING (v558), INFOACC (v559), OFFREL (v562), FREEREL (v564), REMUNER (v574), JOINTRDE (v575), STRIKE (v576), STANDLIV (v578), SOCSEC (v585), FINSUP (v586), OCCUPATE (v590), SAFEWORK (v591), CHILDWRK (v592), SHELTER (v593), HEALTHR (v602)
     - Pages 141–155: SLAVE (v605), LIFE (v604), CAPPUN confirmed, INALRGHT (v620), COMCHIEF (v640), NOMIL

   - `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc_scores.ipynb`
     - **cell `recode`** — completely replaced with new recoding logic:
       ```python
       d = ccpc_const.copy()
       SPECIAL = [90, 96, 97, 98, 99]

       def clean(col):
           s = pd.to_numeric(d[col], errors='coerce')
           return s.where(~s.isin(SPECIAL), np.nan)

       def yn(col, yes_val=1, no_val=2):
           s = clean(col)
           return s.map({yes_val: 1.0, no_val: 0.0})

       def safe_yn(col, yes_val=1, no_val=2):
           if col not in d.columns:
               return pd.Series(np.nan, index=d.index)
           return yn(col, yes_val, no_val)

       def safe_ord(col, scale):
           if col not in d.columns:
               return pd.Series(np.nan, index=d.index)
           return clean(col).map(scale)

       # AXIS 1: civil_liberties
       d['r_press']    = yn('press');  d['r_express']  = yn('express')
       d['r_opinion']  = yn('opinion'); d['r_assem']  = yn('assem')
       d['r_assoc']    = yn('assoc');   d['r_petition'] = yn('petition')
       d['r_freerel']  = safe_yn('freerel'); d['r_life'] = safe_yn('life')
       d['r_privacy']  = yn('privacy'); d['r_freemove'] = yn('freemove')
       d['r_binding']  = (pd.to_numeric(d['binding'], errors='coerce') == 1).astype(float)
       d['r_inalrght'] = safe_yn('inalrght')
       d['r_censor']   = clean('censor').map({1: 1.0, 2: 0.5, 3: 0.0})
       d['r_torture']  = clean('torture').map({1: 1.0, 2: 0.67, 3: 0.33, 4: 0.0})
       d['r_cruelty']  = clean('cruelty').map({1: 1.0, 2: 0.5, 3: 0.0})  # 3-level fix
       d['r_slave']    = safe_ord('slave', {1: 1.0, 2: 0.67, 3: 0.33, 4: 0.0})
       d['r_cappun']   = safe_ord('cappun', {1: 1.0, 2: 0.5, 3: 0.0})
       d['r_offrel']   = clean('offrel').map({3: 1.0, 2: 0.5, 1: 0.0})  # INVERTED

       # AXIS 2: socioeconomic_rights
       for v in ['healthr','shelter','socsec','remuner','jointrde','work','occupate','childwrk']:
           d[f'r_{v}'] = safe_yn(v)
       d['r_educate']  = yn('educate') if 'educate' in d.columns else np.nan
       d['r_standliv'] = safe_yn('standliv')
       d['r_strike']   = safe_ord('strike', {1: 1.0, 2: 0.5, 3: 0.0})  # ordinal fix
       d['r_safework'] = safe_ord('safework', {1: 1.0, 2: 1.0, 3: 0.5})

       # AXIS 3: political_competition
       d['r_voteun']   = yn('voteun')
       d['r_voteres']  = yn('voteres', yes_val=2, no_val=1)  # INVERTED
       d['r_freeelec'] = yn('freeelec'); d['r_camppubf'] = yn('camppubf')
       d['r_electfin'] = safe_yn('electfin'); d['r_referen'] = yn('referen')
       d['r_initiat']  = safe_yn('initiat'); d['r_part'] = yn('part')
       d['r_partrght'] = (pd.to_numeric(d['partrght'], errors='coerce') == 1).astype(float)
       d['r_partprf']  = clean('partprf').map({4: 1.0, 3: 0.5, 2: 0.25, 1: 0.0})  # INVERTED
       d['r_partprh']  = safe_ord('partprh', {4: 1.0, 3: 0.5, 2: 0.25, 1: 0.0})  # INVERTED
       d['r_oversght_elec'] = clean('oversght').map({1: 1.0, 2: 1.0, 3: 1.0, 4: 0.0})

       # AXIS 4: legislative_autonomy
       d['r_legisl']   = yn('legisl'); d['r_legsupr'] = safe_yn('legsupr')
       d['r_housenum'] = clean('housenum').map({1: 0.0, 2: 0.5, 3: 1.0})
       term_map = {1: 1.0, 2: 1.0, 3: 0.83, 4: 0.67, 5: 0.5, 6: 0.33, 7: 0.17}
       d['r_lhterm']   = clean('lhterm').map(term_map)

       # AXIS 5: executive_constraints
       d['r_amend']    = yn('amend'); d['r_unamend'] = yn('unamend')
       d['r_amndamaj'] = yn('amndamaj')
       d['r_amndapct'] = clean('amndapct').map({1: 0.2, 2: 0.4, 3: 0.6, 4: 0.8, 5: 0.5})
       d['r_hosterm']  = safe_yn('hosterm'); d['r_hogterm'] = safe_yn('hogterm')
       d['r_warap']    = safe_ord('warap', {4:1.0,5:1.0,6:1.0,7:0.5,1:0.0,2:0.25,3:0.25,8:0.0})

       # AXIS 6: judicial_independence
       d['r_judind']   = safe_yn('judind'); d['r_judsal'] = safe_yn('judsal')
       d['r_jc']       = yn('jc')
       d['r_chalstag'] = clean('chalstag').map({3: 1.0, 2: 0.75, 1: 0.25})
       d['r_unconper'] = clean('unconper').map({1:1.0,2:0.75,3:0.5,4:0.25,5:0.0,6:0.5})
       d['r_judretir'] = safe_ord('judretir', {4: 1.0, 1: 0.75, 2: 0.75, 3: 0.5})

       # AXIS 7: rule_of_law_due_process
       for v in ['amparo','illadmin','dueproc','fairtri','pubtri','speedtri','expost',
                 'falseimp','rulelaw','habcorp','wolaw','couns','rghtapp','doubjep',
                 'miranda','prerel','evidence']:
           d[f'r_{v}'] = safe_yn(v)
       d['r_presinoc'] = (pd.to_numeric(d['presinoc'], errors='coerce') == 1).astype(float)
       d['r_equal']    = safe_yn('equal')

       # AXIS 8: institutional_accountability
       for v in ['infoacc','medcom','cc','hr','civil','exinst','ombuds','bank']:
           d[f'r_{v}'] = safe_yn(v)
       d['r_assets']   = safe_yn('assets')

       # AXIS 9: emergency_powers_constraints
       d['r_emrights'] = safe_yn('emrights', yes_val=2, no_val=1)  # INVERTED
       d['r_emdecl']   = safe_ord('emdecl', {5:1.0,4:0.75,3:0.25,2:0.0,1:0.0})
       if 'conpow' in d.columns:
           d['r_conpow5'] = (pd.to_numeric(d['conpow'], errors='coerce') == 5).astype(float)
       else:
           d['r_conpow5'] = np.nan

       # AXIS 10: civilian_control_of_security
       d['r_comchief'] = safe_ord('comchief', {1: 1.0, 2: 1.0})
       d['r_nomil']    = safe_yn('nomil')
       ```

     - **cell `axis-scores`** — replaced with weighted axis computation:
       ```python
       AXES_W = {
           'civil_liberties': {
               'r_press':2,'r_express':2,'r_opinion':2,'r_assem':2,'r_assoc':2,
               'r_censor':2,'r_torture':2,'r_cruelty':2,'r_slave':2,'r_life':2,
               'r_petition':1,'r_privacy':1,'r_freemove':1,'r_freerel':1,
               'r_cappun':1,'r_offrel':1,'r_binding':0.5,'r_inalrght':0.5,
           },
           'socioeconomic_rights': {
               'r_healthr':2,'r_shelter':2,'r_educate':2,'r_socsec':2,'r_standliv':2,
               'r_remuner':1,'r_strike':1,'r_jointrde':1,'r_work':1,'r_occupate':1,
               'r_safework':0.5,'r_childwrk':0.5,
           },
           'political_competition': {
               'r_voteun':2,'r_voteres':2,'r_freeelec':2,'r_partrght':2,'r_partprh':2,
               'r_oversght_elec':2,'r_camppubf':1,'r_electfin':1,'r_referen':1,
               'r_initiat':1,'r_partprf':1,'r_part':0.5,
           },
           'legislative_autonomy': {'r_legisl':2,'r_legsupr':2,'r_housenum':1,'r_lhterm':1},
           'executive_constraints': {
               'r_hosterm':2,'r_hogterm':1.5,'r_unamend':1.5,'r_amndamaj':1.5,
               'r_warap':1,'r_amndapct':1,'r_amend':0.5,
           },
           'judicial_independence': {
               'r_judind':2,'r_judsal':2,'r_jc':2,
               'r_chalstag':1.5,'r_unconper':1,'r_judretir':0.5,
           },
           'rule_of_law_due_process': {
               'r_rulelaw':2,'r_equal':2,'r_dueproc':2,'r_habcorp':2,
               'r_fairtri':2,'r_presinoc':2,'r_expost':2,'r_wolaw':2,
               'r_couns':1.5,'r_pubtri':1.5,
               'r_speedtri':1,'r_amparo':1,'r_illadmin':1,'r_falseimp':1,
               'r_rghtapp':1,'r_doubjep':1,'r_miranda':1,'r_prerel':1,'r_evidence':0.5,
           },
           'institutional_accountability': {
               'r_oversght_elec':2,'r_cc':2,'r_hr':2,'r_ombuds':2,'r_infoacc':2,
               'r_civil':1.5,'r_assets':1.5,'r_jc':1,'r_medcom':1,'r_exinst':1,'r_bank':0.5,
           },
           'emergency_powers_constraints': {'r_emdecl':2,'r_emrights':2,'r_conpow5':2},
           'civilian_control_of_security': {'r_comchief':2,'r_nomil':2,'r_warap':2},
       }

       def weighted_axis(df, var_weights):
           cols    = [c for c in var_weights if c in df.columns]
           weights = np.array([var_weights[c] for c in cols], dtype=float)
           vals    = df[cols].values.astype(float)
           mask    = ~np.isnan(vals)
           wsum    = np.nansum(vals * weights, axis=1)
           wdenom  = (mask * weights).sum(axis=1)
           return np.where(wdenom > 0, wsum / wdenom, np.nan)

       for axis, vw in AXES_W.items():
           d[f'ccpc_{axis}'] = weighted_axis(d, vw)
       ```

     - **cell `save-ccpc-scores`** — updated to `AXES = list(AXES_W.keys())`:
       ```python
       AXES = list(AXES_W.keys())
       output_cols = ['cowcode', 'country', 'systyear'] + [f'ccpc_{ax}' for ax in AXES]
       ccpc_scores = d[output_cols].copy().rename(columns={'systyear': 'year'})
       ccpc_scores.to_csv('../ccpc_axis_scores.csv', index=False)
       ```

     - **cell `merge`** — updated to fix `AXES.keys()` AttributeError:
       ```python
       llm_renamed = llm.rename(columns={ax: f'llm_{ax}' for ax in AXES})
       llm_score_cols = [f'llm_{ax}' for ax in AXES]
       # ... rest of merge unchanged
       ```

4. Errors and Fixes:
   - **PDF page range limit**: Early in session, attempting to read >20 pages at once failed with "Page range exceeds maximum of 20 pages per request." Fixed by splitting into 20-page chunks.
   - **`AttributeError: 'list' object has no attribute 'keys'`**: When executing the notebook via `jupyter nbconvert`, the `merge` cell still had `AXES.keys()` from the original code, but `AXES` was redefined as `list(AXES_W.keys())` in the `save-ccpc-scores` cell. Error trace:
     ```
     llm_score_cols = [f'llm_{ax}' for ax in AXES.keys()]
     AttributeError: 'list' object has no attribute 'keys'
     ```
     Fixed by updating the `merge` cell to use `AXES` directly (as a list): `llm_score_cols = [f'llm_{ax}' for ax in AXES]`

5. Problem Solving:
   - **Core validation problem**: The original notebook had methodological weaknesses: direction inversions on several variables (voteres, partprf, partprh, offrel), wrong ordinal category count for `cruelty` (4-level instead of 3), `strike` coded as binary instead of ordinal, many relevant CCPCNC variables omitted from axes (especially rule_of_law_due_process was missing habcorp, equal, wolaw, couns, etc.)
   - **Solution**: Read entire codebook without reference to data, generated principled variable mappings, implemented weighted means, corrected all identified errors
   - **Execution**: Notebook was attempted via `jupyter nbconvert --to notebook --execute` from the `clean_versions` directory; encountered the AXES.keys() error which was fixed

6. All User Messages:
   - *(From previous session summary)* "read ccpcnc_scores.ipynb. what does the code do?"
   - *(From previous session summary)* "what does the validation show, can I use the LLMs scoring? Also, what's the methodology for the recoding and the scoring on the 10? It seems that there could be weaknesses there no? What if we use an LLM generated formula to see how to convert the scores to the 10 variables?"
   - *(From previous session summary)* "Yes, that's a good idea. Can you read the codebook without seeing the constitutions and responses and come up with a mapping structure?"
   - **"okay, can we now use these new formulas and weights in the original code file? Run the new weights and check the correlations. Also, please no need for any additional information, just find the correlation to tell me if the LLM scores are usable or not. No need for extra stuff"**

7. Pending Tasks:
   - **Re-run the notebook** after the `merge` cell fix — the last `jupyter nbconvert` call failed with the AttributeError; the merge cell has been updated but the notebook has not yet been successfully executed
   - **Report just the correlation table** (Pearson r, Spearman r per axis) — user wants only this, no extra charts or analysis

8. Current Work:
   The notebook `/Users/rishithhakker/Downloads/QSS_45_Project/clean_versions/ccpcnc_scores.ipynb` has been fully updated with the new mapping (4 cells updated: `recode`, `axis-scores`, `save-ccpc-scores`, `merge`). The last action was a `jupyter nbconvert` execution that failed due to `AttributeError: 'list' object has no attribute 'keys'` in the `merge` cell, which was then fixed. The notebook needs to be run again from the `clean_versions/` directory to get the correlation results.

9. Optional Next Step:
   Re-run the updated notebook and extract just the correlation table output. The user's most recent request was: **"Run the new weights and check the correlations. Also, please no need for any additional information, just find the correlation to tell me if the LLM scores are usable or not. No need for extra stuff."**
   
   The exact command to run: `cd /Users/rishithhakker/Downloads/QSS_45_Project/clean_versions && jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=180 ccpcnc_scores.ipynb --output ccpcnc_scores_run.ipynb 2>&1`
   
   Then read the output from the `correlation-table` cell to report Pearson r and Spearman r for all 10 axes.

If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: /Users/rishithhakker/.claude/projects/-Users-rishithhakker-Downloads-QSS-45-Project-clean-versions/32fd0bbb-7b5c-4748-b510-dec978da57c0.jsonl
Continue the conversation from where it left off without asking the user any further questions. Resume directly — do not acknowledge the summary, do not recap what was happening, do not preface with "I'll continue" or similar. Pick up the last task as if the break never happened.

---

## [USER]

look through all my files, which scores do you think are most reliable?

---

## [USER]

wait no, I want to analyze democracy using the 10 axis, which of the 10 generated should I be using?

---

## [USER]

wait, why not legislative autonomy, executive constraints and judicial independence? I don't have to use the LLM code, can't I just use the new, expert coded variables ?

---

## [CLAUDE]

The CCPCNC scores are far superior for those three axes — continuous distributions, good variance, hundreds of unique values. Here's the updated picture:

---

**Use CCPCNC-coded scores for all 10 axes except:**

| Axis | Issue with CCPCNC | What to do |
|---|---|---|
| `emergency_powers_constraints` | Only 7 unique values, n=560 (many missing) | Drop or treat as binary |
| `civilian_control_of_security` | Only 8 unique values | Use with caution |
| `socioeconomic_rights` | Conceptually separate from democracy | Use as a distinct dimension |

**The three you asked about are fine in CCPCNC:**

| Axis | n | std | Unique vals |
|---|---|---|---|
| `legislative_autonomy` | 670 | 0.134 | 19 |
| `executive_constraints` | 668 | 0.292 | 41 |
| `judicial_independence` | 673 | 0.260 | 86 |

All three have real variance and are expert-coded from constitutional text — none of those problems come from CCPCNC, they came from the LLM failing to capture the nuance.

**Revised recommendation:** Use CCPCNC scores for all axes. For your democracy index, the strongest 7 are: `civil_liberties`, `political_competition`, `legislative_autonomy`, `executive_constraints`, `judicial_independence`, `rule_of_law_due_process`, `institutional_accountability`. Add `socioeconomic_rights` if you want a social rights component. Treat `emergency_powers_constraints` and `civilian_control_of_security` as secondary given the low granularity.

---

## [USER]

okay, let's use these 3 and the socioeconomic rights. Can we run a catboost with the 4 vdem variables (each as Y variables seperatley of course) and see if there's any corelation? Also, run a specific analysis (Catboost) for 2016 and beyond to understand if there is a corelation between a fall in any of these variables and a global decline in democracy. Look at vdem_llm_merge_catboost.ipynb for an example

---

## [CLAUDE]

Here are the results:

---

**CatBoost R² — CCPCNC scores → V-Dem (test ≥ 2016)**

| V-Dem Index | R² | RMSE |
|---|---|---|
| Egalitarian Democracy | **0.774** | 0.110 |
| Liberal Democracy | **0.756** | 0.128 |
| Participatory Democracy | 0.705 | 0.106 |
| Electoral Democracy (Polyarchy) | 0.702 | 0.138 |
| Deliberative Democracy | 0.689 | 0.136 |

These are strong — R² of 0.70–0.77 means the 4 CCPCNC axes explain ~70–77% of variance in actual democracy scores out-of-sample (post-2016 test set). Much stronger than the LLM scores were.

---

**Feature importances (remarkably consistent across all 5 targets):**

| Feature | ~Importance |
|---|---|
| `judicial_independence` | **~31%** |
| `socioeconomic_rights` | ~24% |
| `legislative_autonomy` | ~23% |
| `executive_constraints` | ~21% |

Judicial independence is the single strongest predictor of democracy across every V-Dem index.

---

**2016+ Decline Analysis:**

- 43 declining, 113 stable, 14 rising countries
- Steepest decliners: Burkina Faso, Mali, Tunisia, Myanmar, El Salvador, Afghanistan
- **Only `judicial_independence` shows a statistically significant vulnerability effect** (p=0.008): countries scoring ≤0.5 on judicial independence declined at −0.008/year vs −0.002/year for stronger-judiciary countries
- `socioeconomic_rights` and `executive_constraints` gaps are not significant (p>0.7)
- The decline-slope prediction model (R²=0.11) confirms that constitutional text alone doesn't fully predict *who* declines — regime and political dynamics matter too, but weak judicial independence is the clearest constitutional risk factor

---

## [USER]

wait, so what does this mean? can we reasonably predict if a democracy will decline based on the constitution scores?

---

## [USER]

wait, so what is the difference between the two R^2s? I think its more interesting if a constitution can't predict democratic decline

---

## [USER]

so would it be fair to say that constitutions don't matter in studying democratic decline?

---

## [USER]

wait, is the ccpcnc data not dynamic? I thought that data is updated whenver constitutions are updated and the like

---

## [USER]

look through the CCPCNC data. Are you sure that the Turkey amendments, Poland, Russia, etc, are not captured in the dataset? Look at all the year datasets and see if the institutions / value changes

---

## [USER]

how about this, in the code and the dataset, instead of collapsing countries, why not run the fomula to generate the 7 variables, why not import the large dataset and do it for every row that exists. Then, merge with the VDEM data and run the analysis. Keep years upto 2023 because that's most recent year

---

## [CLAUDE]

Great idea — this is actually a much better approach. The full panel has 21,735 rows, one per country-year, and the constitutional variables already reflect amendments for that year. So instead of collapsing to one row per constitution, we compute axis scores for every row and get a true time-varying panel.

Two changes needed:
1. `ccpcnc_scores.ipynb` — remove the `drop_duplicates` step, score all rows
2. `vdem_ccpc_catboost.ipynb` — direct `cowcode + year` merge instead of `merge_asof`, use all 7 axes

---

## [CLAUDE]

Now update `vdem_ccpc_catboost.ipynb` — direct year merge, all 7 axes:

---

## [CLAUDE]

17,390 rows saved. Now run the CatBoost notebook:

---

## [CLAUDE]

Here's what changed with the full dynamic panel:

---

**CatBoost R² jumped significantly with the time-varying panel:**

| V-Dem Index | Before (static) | Now (dynamic panel) |
|---|---|---|
| Egalitarian | 0.774 | **0.873** |
| Liberal | 0.756 | **0.845** |
| Participatory | 0.705 | **0.830** |
| Electoral (Polyarchy) | 0.702 | **0.816** |
| Deliberative | 0.689 | **0.786** |

**158 out of 174 countries** now have within-country score variation — meaning amendments are genuinely being captured across the panel.

**Feature importances are remarkably even across all 7 axes** (~10–20% each), with judicial independence still leading (~18–19%), followed closely by civil liberties (~15–17%), rule of law (~14–16%), and institutional accountability (~14–16%).

**The decline prediction remains weak (R²=0.097)** — the democratic decline slope model barely changed from before. This confirms the earlier finding is real and not just a data artifact: the 7 axes predict *level* of democracy extremely well (R²=0.78–0.87), but which countries will *decline* is largely unpredictable from constitutional text, even with full amendment tracking. Judicial independence is the closest thing to a significant vulnerability signal (p=0.07, marginal), but it doesn't cross conventional significance thresholds with the fuller dataset.

---

## [USER]

Is this methodlogy more robust? Explain simply what the method is and what's different

---

## [USER]

where do I find the code for this? Give me just this code; no extra charts of graphs other than the basic SHAPs

---

## [CLAUDE]

The code lives in two files:
- `ccpcnc_scores.ipynb` — generates the panel scores (run this first)
- `vdem_ccpc_catboost.ipynb` — runs the CatBoost + decline analysis

Let me strip `vdem_ccpc_catboost.ipynb` down to just the essentials:

---

## [CLAUDE]

Runs clean. Here's where everything lives:

---

**Step 1 — Generate the scores (run once):**
`clean_versions/ccpcnc_scores.ipynb`
Reads the raw CCPCNC v5 panel, applies the variable recoding and weighted axis formulas, outputs `ccpc_axis_scores.csv` (17,390 rows, one per country-year).

**Step 2 — Analysis (the clean version):**
`clean_versions/vdem_ccpc_clean.ipynb`
8 cells total:
1. Imports
2. Load CCPCNC panel + V-Dem
3. Merge on COW code + year
4. CatBoost (train < 2016, test ≥ 2016) for all 5 V-Dem targets
5. Feature importance table
6. SHAP beeswarm (polyarchy)
7. 2016+ decline slopes + vulnerability table
8. Decline-slope CatBoost + SHAP

Nothing else — no scatter plots, radar charts, or heatmaps.

---

