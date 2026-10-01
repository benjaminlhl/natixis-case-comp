"""All numbers used in the Scenario 2 deck (Asia Digital Bridge Legacy Note).

Run:  python3 analysis.py            -> prints a summary and writes results.json
Inputs live in model.py and are PLACEHOLDERS until refreshed with Bloomberg data (17 Sep 2026).
"""
import json
import numpy as np
from scipy.stats import norm

import model as M
from model import (simulate, redemption, option_pv, option_budget, solve_participation, zcb,
                   usd_funding, TENOR, PROTECTION, LOCK_LADDER, PARTICIPATION, MU_P, VOL, CORR, DIV)

out = {}
Q = simulate()                      # risk-neutral annual paths, common random numbers
P_FAIR = solve_participation(Q)
out["pricing"] = {
    "tenor": TENOR,
    "usd_funding": usd_funding(TENOR),
    "zcb": zcb(TENOR),
    "fees": M.FEE_PA * TENOR,
    "budget": option_budget(),
    "participation_fair": P_FAIR,
    "participation_quoted": PARTICIPATION,
    "upside_call_pv": option_pv(Q, PARTICIPATION, ladder=[]),
    "lockin_pv": option_pv(Q, PARTICIPATION) - option_pv(Q, PARTICIPATION, ladder=[]),
    "option_pv_quoted": option_pv(Q, PARTICIPATION),
}
out["pricing"]["model_reserve"] = out["pricing"]["budget"] - out["pricing"]["option_pv_quoted"]

# ---- Structuring dials -----------------------------------------------------------------
tenor_rows = []
for T in [3, 5, 7, 10]:
    q = simulate(tenor=T)
    tenor_rows.append({"tenor": T, "funding": usd_funding(T), "zcb": zcb(T), "budget": option_budget(T),
                       "participation": solve_participation(q, tenor=T)})
out["tenor_dial"] = tenor_rows

prot_rows = []
for prot in [1.00, 0.95, 0.90]:
    lad = [(t, max(l, prot)) for t, l in LOCK_LADDER]
    prot_rows.append({"protection": prot, "budget": option_budget(prot=prot),
                      "participation": solve_participation(Q, prot=prot, ladder=lad)})
out["protection_dial"] = prot_rows

out["design_variants"] = {
    "equal_weight_with_ladder": P_FAIR,
    "equal_weight_no_ladder": solve_participation(Q, ladder=[]),
    "rainbow_40_30_20_10_with_ladder": solve_participation(Q, w=[0.4, 0.3, 0.2, 0.1]),
}

# ---- Pricing sensitivities (fair participation) --------------------------------------
def p_with(vol=VOL, corr=CORR, r_shift=0.0):
    q = simulate(vol=vol, corr=corr)
    if r_shift:
        f0 = M.GRID_USD.copy(); M.GRID_USD = f0 + r_shift
        p = solve_participation(q)
        M.GRID_USD = f0
        return p
    return solve_participation(q)

def shift_corr(c, d):
    c2 = np.clip(c + d, -0.99, 0.99); np.fill_diagonal(c2, 1.0); return c2

out["sensitivity"] = {
    "base": P_FAIR,
    "vol_+3": p_with(vol=VOL + 0.03), "vol_-3": p_with(vol=VOL - 0.03),
    "corr_+0.15": p_with(corr=shift_corr(CORR, 0.15)), "corr_-0.15": p_with(corr=shift_corr(CORR, -0.15)),
    "rates_+50bp": p_with(r_shift=0.005), "rates_-50bp": p_with(r_shift=-0.005),
}

# ---- Forward-looking real-world simulation (fat tails, monthly steps) -------------------
def simulate_rw(n=100_000, months=TENOR * 12, df=5, seed=23):
    rng = np.random.default_rng(seed)
    L = np.linalg.cholesky(CORR)
    z = rng.standard_normal((n, months, 4)) @ L.T
    chi = rng.chisquare(df, size=(n, months, 1))
    z = z / np.sqrt(chi / df) * np.sqrt((df - 2) / df)      # multivariate t: joint crashes
    dt = 1 / 12
    inc = (MU_P - 0.5 * VOL ** 2) * dt + VOL * np.sqrt(dt) * z
    return np.exp(np.cumsum(inc, axis=1))

RW = simulate_rw()
annual = RW[:, 11::12, :]                         # years 1..7
red, floor, bsk = redemption(annual, PARTICIPATION)
direct = bsk[:, -1] * (1 + DIV.mean()) ** TENOR   # equal-weight basket incl. dividends
ust = (1 + usd_funding(TENOR) - M.OIS_SPREAD) ** TENOR
irr = red ** (1 / TENOR) - 1

edges = [1.0, 1.0001, 1.15, 1.30, 1.50, 2.00, np.inf]
labels = ["100% (floor)", "100-115%", "115-130%", "130-150%", "150-200%", ">200%"]
hist = [float(np.mean((red >= lo) & (red < hi))) for lo, hi in zip(edges[:-1], edges[1:])]
peak = bsk[:, :-1].max(axis=1)
out["simulation"] = {
    "paths": int(RW.shape[0]),
    "mean_redemption": float(red.mean()), "median_redemption": float(np.median(red)),
    "p5": float(np.percentile(red, 5)), "p95": float(np.percentile(red, 95)),
    "mean_irr": float(np.mean(irr)), "median_irr": float(np.median(irr)),
    "prob_floor_only": float(np.mean(red < 1.0001)),
    "prob_lock_115": float(np.mean(peak >= 1.30)), "prob_lock_130": float(np.mean(peak >= 1.60)),
    "prob_lock_150": float(np.mean(peak >= 2.00)),
    "prob_beats_ust": float(np.mean(red > ust)), "ust_7y_multiple": ust,
    "direct_mean": float(direct.mean()), "direct_p5": float(np.percentile(direct, 5)),
    "direct_prob_loss": float(np.mean(direct < 1.0)),
    "lockin_saved": float(np.mean(floor > np.maximum(PROTECTION, PROTECTION + PARTICIPATION * np.maximum(bsk[:, -1] - 1, 0)))),
    "hist_labels": labels, "hist": hist,
}
pct = [5, 25, 50, 75, 95]
fan = np.vstack([np.ones((1, 5)), np.percentile(bsk, pct, axis=0).T])
out["fan"] = {"years": list(range(TENOR + 1)), "pct": pct, "levels": fan.tolist()}

# ---- Deterministic stress replays (stylised, per-index annual paths) -----------------
def path(*levels):
    return np.array(levels, dtype=float)

idx = lambda nky, twse, ks, hst: np.stack([nky, twse, ks, hst], axis=-1)[None, ...]
SCEN = {
    "Steady AI build-out (+7% p.a. each)": idx(*(path(*(1.07 ** np.arange(1, 8))),) * 4),
    "AI boom then bust (2000-style)": idx(*(path(1.25, 1.50, 1.68, 1.25, 0.95, 0.88, 0.92),) * 4),
    "Lost decade (Japan 1990s-style)": idx(*(path(0.95, 0.90, 1.00, 0.92, 0.88, 0.93, 0.90),) * 4),
    "Early crash, slow recovery (2008-style)": idx(*(path(0.55, 0.72, 0.88, 1.02, 1.12, 1.22, 1.30),) * 4),
    "China tech decoupling": idx(path(1.05, 1.12, 1.20, 1.28, 1.36, 1.45, 1.52), path(1.08, 1.16, 1.25, 1.33, 1.42, 1.50, 1.58),
                                 path(1.06, 1.13, 1.20, 1.28, 1.35, 1.42, 1.50), path(0.80, 0.62, 0.55, 0.48, 0.45, 0.42, 0.40)),
    "Taiwan Strait shock in year 2": idx(path(1.05, 0.75, 0.80, 0.86, 0.90, 0.94, 0.98), path(1.06, 0.50, 0.58, 0.66, 0.72, 0.78, 0.82),
                                         path(1.05, 0.65, 0.72, 0.78, 0.84, 0.88, 0.92), path(1.04, 0.60, 0.66, 0.70, 0.74, 0.78, 0.80)),
}
stress = []
for name, pth in SCEN.items():
    r, f, b = redemption(pth, PARTICIPATION)
    stress.append({"scenario": name, "basket_final": float(b[0, -1]), "peak": float(b[0, :-1].max()),
                   "floor": float(f[0]), "note": float(r[0]),
                   "direct": float(b[0, -1] * (1 + DIV.mean()) ** TENOR)})
out["stress"] = stress
out["fan_note"] = "Percentiles of the equal-weight basket (price return), real-world fat-tailed MC"

# ---- Risk metrics at issue (Unit 15): Greeks, VaR/ES, joint spot-vol-rate stress -------
def note_pv(spot=1.0, vol=VOL, dr=0.0, corr=CORR):
    q = simulate(vol=vol, corr=corr, spot=np.full(4, spot))
    f0 = M.GRID_USD.copy(); M.GRID_USD = f0 + dr
    pv = zcb(TENOR) + option_pv(q, PARTICIPATION)
    M.GRID_USD = f0
    return pv

pv0 = note_pv()
delta = (note_pv(spot=1.01) - note_pv(spot=0.99)) / 2          # per 1% basket move
vega = (note_pv(vol=VOL + 0.01) - pv0)                          # per +1 vol pt
dv01 = (note_pv(dr=0.0001) - pv0)                               # per +1bp
basket_vol = float(np.sqrt(np.full(4, 0.25) @ (np.outer(VOL, VOL) * CORR) @ np.full(4, 0.25)))
s_eq = delta * 100 * basket_vol * np.sqrt(10 / 252)             # 10-day 1-sigma P&L from equity
s_ir = dv01 * 100 * np.sqrt(10 / 252)                          # 100bp p.a. normal rate vol
s_tot = np.sqrt(s_eq ** 2 + s_ir ** 2)
out["risk"] = {
    "pv_at_issue": pv0, "delta_per_1pct": delta, "vega_per_volpt": vega, "dv01_per_bp": dv01,
    "basket_vol": basket_vol,
    "var99_10d": 2.326 * s_tot, "es99_10d": s_tot * norm.pdf(2.326) / 0.01,
    "stress_crash_volup_ratesdown": note_pv(spot=0.70, vol=VOL + 0.10, dr=-0.005) - pv0,
    "stress_crash_volup_ratesup": note_pv(spot=0.70, vol=VOL + 0.10, dr=0.010) - pv0,
    "stress_rates_up_200": note_pv(dr=0.02) - pv0,
}
# Sizing identity (Unit 15): risk budget / loss per unit in the defined bad case
NW, BUDGET, LGD = 2_000e6, 0.03, 0.60
out["sizing"] = {"net_worth": NW, "risk_budget_pct": BUDGET, "risk_budget": NW * BUDGET,
                 "bad_case": "Issuer default, 40% recovery (contractual floor lost)", "lgd": LGD,
                 "max_size": NW * BUDGET / LGD}

json.dump(out, open("results.json", "w"), indent=1, default=float)

p = out["pricing"]; s = out["simulation"]; r = out["risk"]
print(f"ZCB {p['zcb']:.2%}  fees {p['fees']:.2%}  budget {p['budget']:.2%}  fair P {p['participation_fair']:.1%}  quoted {PARTICIPATION:.0%}")
print(f"  upside call {p['upside_call_pv']:.2%}  lock-in ladder {p['lockin_pv']:.2%}  reserve {p['model_reserve']:.2%}")
print("tenor dial", [(t['tenor'], round(t['budget'], 4), round(t['participation'], 3)) for t in tenor_rows])
print("protection dial", [(x['protection'], round(x['budget'], 4), round(x['participation'], 3)) for x in prot_rows])
print("variants", {k: round(v, 3) for k, v in out["design_variants"].items()})
print("sensitivity", {k: round(v, 3) for k, v in out["sensitivity"].items()})
print(f"sim mean {s['mean_redemption']:.1%} median {s['median_redemption']:.1%} p5 {s['p5']:.1%} p95 {s['p95']:.1%} "
      f"mean IRR {s['mean_irr']:.2%} median IRR {s['median_irr']:.2%}")
print(f"  P(floor only) {s['prob_floor_only']:.1%}  lock115 {s['prob_lock_115']:.1%}  lock130 {s['prob_lock_130']:.1%} "
      f"lock150 {s['prob_lock_150']:.1%}  P(>UST {s['ust_7y_multiple']:.3f}) {s['prob_beats_ust']:.1%}  lock saved {s['lockin_saved']:.1%}")
print(f"  direct basket mean {s['direct_mean']:.1%} p5 {s['direct_p5']:.1%} P(loss) {s['direct_prob_loss']:.1%}")
print("  hist", dict(zip(s["hist_labels"], [round(h, 3) for h in s["hist"]])))
print("fan", [[round(v, 2) for v in row] for row in out["fan"]["levels"]])
for x in stress:
    print(f"  {x['scenario']:<42} basket {x['basket_final']:.2f} peak {x['peak']:.2f} note {x['note']:.1%} direct {x['direct']:.1%}")
print(f"risk: pv {r['pv_at_issue']:.4f} delta/1% {r['delta_per_1pct']:.4%} vega {r['vega_per_volpt']:.4%} dv01 {r['dv01_per_bp']:.4%}")
print(f"  VaR99 10d {r['var99_10d']:.2%} ES {r['es99_10d']:.2%} | crash+vol+rates-50 {r['stress_crash_volup_ratesdown']:.2%} "
      f"crash+vol+rates+100 {r['stress_crash_volup_ratesup']:.2%} rates+200 {r['stress_rates_up_200']:.2%}")
print("sizing max", out["sizing"]["max_size"] / 1e6, "USD mn")
