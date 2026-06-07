"""
Step 11 — Erosion/Surge → Constitutional Score Feedback Loop

Questions:
1. Does democratic erosion lead to weakening constitutional dimension scores in following years?
2. If constitutional scores erode after democratic erosion, does that reduce the chance of a rebound?
3. Symmetric: does a democratic surge lead to strengthening constitutional scores?
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from scipy import stats
import os

os.makedirs('outputs/11_feedback', exist_ok=True)

# ── 1. Load & Merge ──────────────────────────────────────────────────────────
scores = pd.read_csv('ccpc_axis_scores_llm.csv')
vdem   = pd.read_csv('data/vdem/vdem_data.csv',
                     usecols=['COWcode', 'year', 'v2x_polyarchy'])
vdem   = vdem.rename(columns={'COWcode': 'cowcode'})

DIMS = [c for c in scores.columns if c.startswith('ccpc_')]
DIM_LABELS = {d: d.replace('ccpc_', '').replace('_', ' ').title() for d in DIMS}

df = scores.merge(vdem, on=['cowcode', 'year'], how='inner')
df = df.sort_values(['cowcode', 'year']).reset_index(drop=True)
print(f"Merged: {len(df):,} country-years, {df['cowcode'].nunique()} countries, "
      f"{df['year'].min():.0f}–{df['year'].max():.0f}")

# ── 2. Define episodes ───────────────────────────────────────────────────────
# For each country compute 3-year rolling change in polyarchy.
# Erosion episode: ≥0.05 decline over 3 years (start of sustained drop).
# Surge  episode: ≥0.05 gain  over 3 years.
# To avoid counting every year of a prolonged trend, keep only the first year
# of each episode (no new episode for 5 years in same country).

THRESHOLD   = 0.05   # minimum 3-yr change magnitude
MIN_GAP_YRS = 5      # minimum years between episodes in same country
HORIZONS    = [1, 2, 3, 5, 7]  # years after episode to track

def find_episodes(group, direction='erosion'):
    group = group.sort_values('year').copy()
    group['poly_change_3yr'] = group['v2x_polyarchy'].diff(3)
    episodes = []
    last_ep_year = -999
    for _, row in group.iterrows():
        if pd.isna(row['poly_change_3yr']):
            continue
        change = row['poly_change_3yr']
        qualifies = (change <= -THRESHOLD) if direction == 'erosion' else (change >= THRESHOLD)
        if qualifies and (row['year'] - last_ep_year) >= MIN_GAP_YRS:
            episodes.append({'cowcode': row['cowcode'],
                             'country': row['country'],
                             'year':    int(row['year']),
                             'poly_start': row['v2x_polyarchy'],
                             'poly_change_3yr': change})
            last_ep_year = row['year']
    return pd.DataFrame(episodes)

erosion_eps = df.groupby('cowcode', group_keys=False).apply(find_episodes, direction='erosion')
surge_eps   = df.groupby('cowcode', group_keys=False).apply(find_episodes, direction='surge')

print(f"Erosion episodes: {len(erosion_eps)}")
print(f"Surge   episodes: {len(surge_eps)}")

# ── 3. Helper: track dimension change after episode ──────────────────────────
def track_dim_changes(episodes, df, horizons=HORIZONS):
    """
    For each episode, compute the change in each dimension score
    at t+h relative to the episode start year.
    Returns long-form dataframe.
    """
    records = []
    for _, ep in episodes.iterrows():
        cc, yr = ep['cowcode'], ep['year']
        country_df = df[df['cowcode'] == cc].set_index('year')
        if yr not in country_df.index:
            continue
        base_scores = country_df.loc[yr, DIMS]
        for h in horizons:
            fut_yr = yr + h
            if fut_yr not in country_df.index:
                continue
            fut_scores = country_df.loc[fut_yr, DIMS]
            dim_changes = (fut_scores - base_scores).to_dict()
            dim_changes['cowcode']   = cc
            dim_changes['country']   = ep['country']
            dim_changes['ep_year']   = yr
            dim_changes['horizon']   = h
            dim_changes['poly_start'] = ep['poly_start']
            dim_changes['poly_change_3yr'] = ep['poly_change_3yr']
            # future polyarchy at t+h
            if fut_yr in country_df.index:
                dim_changes['poly_future'] = country_df.loc[fut_yr, 'v2x_polyarchy']
            records.append(dim_changes)
    return pd.DataFrame(records)

erosion_track = track_dim_changes(erosion_eps, df)
surge_track   = track_dim_changes(surge_eps,   df)

print(f"Erosion tracking rows: {len(erosion_track)}")
print(f"Surge   tracking rows: {len(surge_track)}")

# ── 4. Q1: Does erosion weaken constitutional scores? ────────────────────────
# Mean dimension change at each horizon after erosion/surge episodes
def mean_dim_change_by_horizon(track_df, dims=DIMS):
    return track_df.groupby('horizon')[dims].mean()

erosion_mean = mean_dim_change_by_horizon(erosion_track)
surge_mean   = mean_dim_change_by_horizon(surge_track)

print("\n=== Mean Dimension Change After EROSION (top 5 dims by avg change at t+5) ===")
if 5 in erosion_mean.index:
    row = erosion_mean.loc[5].sort_values()
    print(row.head(14).to_string())

print("\n=== Mean Dimension Change After SURGE (top 5 dims by avg change at t+5) ===")
if 5 in surge_mean.index:
    row = surge_mean.loc[5].sort_values(ascending=False)
    print(row.head(14).to_string())

# Statistical test: is each dimension's change after erosion significantly negative?
print("\n=== t-tests: Is dimension change after erosion significantly ≠ 0? (horizon=5) ===")
h5_erosion = erosion_track[erosion_track['horizon'] == 5]
sig_results = []
for d in DIMS:
    vals = h5_erosion[d].dropna()
    if len(vals) < 10:
        continue
    t, p = stats.ttest_1samp(vals, 0)
    sig_results.append({'dim': DIM_LABELS[d], 'mean_change': vals.mean(),
                        't': t, 'p': p, 'n': len(vals)})
sig_df = pd.DataFrame(sig_results).sort_values('mean_change')
print(sig_df[['dim','mean_change','t','p','n']].to_string(index=False))

# ── 5. Q2: Does constitutional erosion after democratic erosion kill rebound? ─
# Define rebound: at t+5, polyarchy is ≥ 50% recovered relative to the 3yr drop
# (or recovered to within 0.02 of starting value)

h5_erosion = erosion_track[erosion_track['horizon'] == 5].copy()
h5_erosion = h5_erosion.dropna(subset=['poly_future', 'poly_start', 'poly_change_3yr'])

h5_erosion['poly_trough_est']  = h5_erosion['poly_start'] + h5_erosion['poly_change_3yr']
h5_erosion['total_drop']       = -h5_erosion['poly_change_3yr']  # positive = more erosion
h5_erosion['recovered']        = h5_erosion['poly_future'] - h5_erosion['poly_trough_est']
h5_erosion['recovery_pct']     = h5_erosion['recovered'] / h5_erosion['total_drop'].clip(lower=0.001)
h5_erosion['rebound']          = h5_erosion['recovery_pct'] >= 0.5

# Constitutional score change: aggregate across all 14 dims (mean of dim changes)
h5_erosion['const_score_change'] = h5_erosion[DIMS].mean(axis=1)

# Split into constitutional-eroded vs. constitutional-stable
# Threshold: bottom tertile of const_score_change = "eroded", top tertile = "stable/strengthened"
q33 = h5_erosion['const_score_change'].quantile(0.33)
q67 = h5_erosion['const_score_change'].quantile(0.67)

eroded_const  = h5_erosion[h5_erosion['const_score_change'] <= q33]
stable_const  = h5_erosion[h5_erosion['const_score_change'] >= q67]

rebound_rate_eroded = eroded_const['rebound'].mean()
rebound_rate_stable = stable_const['rebound'].mean()

print(f"\n=== Q2: Rebound Rates after Democratic Erosion ===")
print(f"Constitutional scores WEAKENED (bottom tertile): rebound rate = {rebound_rate_eroded:.1%}  (n={len(eroded_const)})")
print(f"Constitutional scores STABLE/STRENGTHENED (top tertile): rebound rate = {rebound_rate_stable:.1%}  (n={len(stable_const)})")
print(f"Difference: {rebound_rate_stable - rebound_rate_eroded:+.1%}")

# Chi-square test
from scipy.stats import chi2_contingency
contingency = np.array([
    [eroded_const['rebound'].sum(),  (~eroded_const['rebound']).sum()],
    [stable_const['rebound'].sum(),  (~stable_const['rebound']).sum()],
])
chi2, p_chi2, _, _ = chi2_contingency(contingency)
print(f"Chi-square: χ²={chi2:.3f}, p={p_chi2:.4f}")

# Also: correlation between const_score_change and recovery_pct
corr, p_corr = stats.pearsonr(h5_erosion['const_score_change'].dropna(),
                               h5_erosion['recovery_pct'].clip(upper=2).dropna()
                               [:len(h5_erosion['const_score_change'].dropna())])
print(f"\nCorr(const_score_change_5yr, recovery_pct): r={corr:.3f}, p={p_corr:.4f}")

# ── 6. Q3: Does surge strengthen constitutional scores? ──────────────────────
h5_surge = surge_track[surge_track['horizon'] == 5].copy()
h5_surge = h5_surge.dropna(subset=['poly_future', 'poly_start'])

h5_surge['const_score_change'] = h5_surge[DIMS].mean(axis=1)
h5_surge['poly_gain']          = h5_surge['poly_future'] - h5_surge['poly_start']

print("\n=== Q3: Constitutional Change After Democratic Surge ===")
print(f"Mean constitutional score change at t+5 after surge:   {h5_surge['const_score_change'].mean():+.4f}")
print(f"Mean constitutional score change at t+5 after erosion: {h5_erosion['const_score_change'].mean():+.4f}")

t_surge, p_surge = stats.ttest_1samp(h5_surge['const_score_change'].dropna(), 0)
print(f"t-test (surge, H0=0): t={t_surge:.3f}, p={p_surge:.4f}")

# ── 7. Which dimensions are most sensitive? ──────────────────────────────────
# Compare erosion vs. surge at t+5 for each dimension
print("\n=== Dimension Sensitivity: erosion t+5 vs. surge t+5 ===")
sensitivity = []
for d in DIMS:
    e_vals = h5_erosion[d].dropna()
    s_vals = h5_surge[d].dropna()
    t2, p2 = stats.ttest_ind(e_vals, s_vals)
    sensitivity.append({
        'dim': DIM_LABELS[d],
        'erosion_mean': e_vals.mean(),
        'surge_mean': s_vals.mean(),
        'diff': s_vals.mean() - e_vals.mean(),
        'p_ttest': p2
    })
sens_df = pd.DataFrame(sensitivity).sort_values('diff', ascending=False)
print(sens_df[['dim','erosion_mean','surge_mean','diff','p_ttest']].to_string(index=False))

# ── 8. Visualize ─────────────────────────────────────────────────────────────

# Fig A: Mean constitutional score change trajectory after erosion vs. surge
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

for ax, (track_df, label, color) in zip(axes, [
    (erosion_track, 'After Democratic Erosion', '#d73027'),
    (surge_track,   'After Democratic Surge',   '#1a9850'),
]):
    means = track_df.groupby('horizon')[DIMS].mean()
    overall = means.mean(axis=1)
    ci = track_df.groupby('horizon')[DIMS].std().mean(axis=1) / np.sqrt(
         track_df.groupby('horizon').size())

    ax.axhline(0, color='#888888', lw=0.8, ls='--')
    ax.fill_between(overall.index, overall - 1.96*ci, overall + 1.96*ci,
                    alpha=0.18, color=color)
    ax.plot(overall.index, overall.values, color=color, lw=2.5, marker='o', ms=6)

    ax.set_xlabel('Years after episode start', fontsize=11)
    ax.set_ylabel('Mean constitutional score change (Δ from episode year)', fontsize=10)
    ax.set_title(label, fontsize=12, fontweight='bold')
    ax.set_xticks(HORIZONS)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # annotate final value
    final_val = overall.iloc[-1]
    ax.annotate(f'{final_val:+.4f}',
                xy=(overall.index[-1], final_val),
                xytext=(8, 0), textcoords='offset points',
                fontsize=10, color=color, fontweight='bold')

plt.suptitle('Does Democratic Change Drive Constitutional Score Change?',
             fontsize=13, y=1.02)
plt.tight_layout()
plt.savefig('outputs/11_feedback/Q1_const_trajectory.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: Q1_const_trajectory.png")

# Fig B: Per-dimension erosion sensitivity heatmap
fig, ax = plt.subplots(figsize=(10, 6))
sens_pivot = sens_df.set_index('dim')[['erosion_mean', 'surge_mean']].T
im = ax.imshow(sens_pivot.values, cmap='RdYlGn', vmin=-0.015, vmax=0.015, aspect='auto')
ax.set_xticks(range(len(sens_pivot.columns)))
ax.set_xticklabels(sens_pivot.columns, rotation=40, ha='right', fontsize=8.5)
ax.set_yticks([0, 1])
ax.set_yticklabels(['After Erosion', 'After Surge'], fontsize=10)
plt.colorbar(im, ax=ax, label='Mean Δ score at t+5', shrink=0.6)
ax.set_title('Constitutional Dimension Change by Episode Type (t+5 horizon)', fontsize=12)
for i in range(2):
    for j in range(len(sens_pivot.columns)):
        val = sens_pivot.values[i, j]
        ax.text(j, i, f'{val:+.4f}', ha='center', va='center', fontsize=7,
                color='white' if abs(val) > 0.008 else 'black')
plt.tight_layout()
plt.savefig('outputs/11_feedback/Q1_dimension_heatmap.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: Q1_dimension_heatmap.png")

# Fig C: Rebound rates by constitutional score change tertile
fig, ax = plt.subplots(figsize=(7, 5))

tertile_labels = ['Constitutional\nScores Weakened\n(bottom ⅓)',
                  'Middle ⅓',
                  'Constitutional\nScores Held/Grew\n(top ⅓)']
q33_all = h5_erosion['const_score_change'].quantile(0.33)
q67_all = h5_erosion['const_score_change'].quantile(0.67)
t1 = h5_erosion[h5_erosion['const_score_change'] <= q33_all]
t2 = h5_erosion[(h5_erosion['const_score_change'] > q33_all) &
                 (h5_erosion['const_score_change'] < q67_all)]
t3 = h5_erosion[h5_erosion['const_score_change'] >= q67_all]

rates = [t1['rebound'].mean(), t2['rebound'].mean(), t3['rebound'].mean()]
ns    = [len(t1), len(t2), len(t3)]
colors_bar = ['#d73027', '#fdae61', '#1a9850']

bars = ax.bar(tertile_labels, [r * 100 for r in rates], color=colors_bar,
              edgecolor='white', width=0.55)
for bar, rate, n in zip(bars, rates, ns):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8,
            f'{rate:.0%}\n(n={n})', ha='center', va='bottom', fontsize=10, fontweight='bold')

ax.set_ylabel('Democratic Rebound Rate (%)\n(≥50% recovery at t+5)', fontsize=11)
ax.set_title('Constitutional Resilience Predicts Democratic Rebound\n'
             'After Erosion Episodes', fontsize=12)
ax.set_ylim(0, max(rates) * 140)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f'{y:.0f}%'))

ax.text(0.98, 0.02, f'χ²={chi2:.2f}, p={p_chi2:.3f}',
        transform=ax.transAxes, ha='right', fontsize=9, color='#555555')

plt.tight_layout()
plt.savefig('outputs/11_feedback/Q2_rebound_rates.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: Q2_rebound_rates.png")

# Fig D: Scatter - const score change vs. recovery pct after erosion
fig, ax = plt.subplots(figsize=(7, 5))
plot_df = h5_erosion[['const_score_change', 'recovery_pct', 'poly_start']].dropna()
plot_df = plot_df[plot_df['recovery_pct'].between(-1, 3)]

sc = ax.scatter(plot_df['const_score_change'], plot_df['recovery_pct'] * 100,
                c=plot_df['poly_start'], cmap='RdYlGn', s=30, alpha=0.55,
                vmin=0, vmax=1, edgecolors='none')
plt.colorbar(sc, ax=ax, label='Polyarchy at episode start', shrink=0.7)

# OLS fit line
x = plot_df['const_score_change']
y = plot_df['recovery_pct'] * 100
slope, intercept, r, p_fit, _ = stats.linregress(x, y)
xfit = np.linspace(x.min(), x.max(), 100)
ax.plot(xfit, intercept + slope * xfit, color='#333333', lw=2)
ax.axhline(50, color='#888888', lw=0.8, ls='--', label='50% recovery threshold')
ax.axvline(0,  color='#888888', lw=0.8, ls='--')

ax.set_xlabel('Constitutional score change at t+5 (Δ from erosion start)', fontsize=11)
ax.set_ylabel('Democratic recovery (% of drop recovered at t+5)', fontsize=11)
ax.set_title(f'Constitutional Resilience vs. Democratic Recovery\nr={r:.3f}, p={p_fit:.4f}',
             fontsize=12)
ax.legend(fontsize=9)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig('outputs/11_feedback/Q2_scatter_rebound.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: Q2_scatter_rebound.png")

print("\n=== DONE ===")
print(f"All outputs in outputs/11_feedback/")
