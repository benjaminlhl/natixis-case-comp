"""Scenario 2 (NKE Private Wealth / Chak family): Asian Digital Transformation Snowball Autocallable Note.

Monte Carlo pricer, coupon solver, design comparison, sensitivities and scenario statistics.
Market inputs (vols, dividends, correlations) are ASSUMPTIONS, to be refreshed with Bloomberg
data as of the 17 Sep 2026 trade date. Discounting uses the USD funding grid from the game rules.

Recommended product (USD, quanto, 5Y, quarterly observations):
  - Autocall: from Q4 (1Y) onwards, if basket >= 100% of initial -> 100% + 9.0% p.a. x years elapsed
  - Maturity (not called): basket >= 65% -> 100%; basket < 65% -> basket level (1:1 loss from initial)
  - Basket = weighted sum of index performances (not worst-of)
Run:  python3 pricing/scenario2_autocall_mc.py   (writes pricing/scenario2_results.json)
"""
import json
import numpy as np

rng = np.random.default_rng(2026)

NAMES = ["HSTECH Index", "NKY Index", "TWSE Index", "MXAP0UT Index"]
LABELS = ["Hang Seng TECH", "Nikkei 225", "Taiwan TAIEX", "MSCI AC Asia Pacific Utilities"]
W = np.array([0.30, 0.30, 0.25, 0.15])
VOL = np.array([0.32, 0.22, 0.22, 0.14])          # assumed 5Y implied vols
DIV = np.array([0.010, 0.018, 0.028, 0.035])      # assumed dividend yields
CORR = np.array([[1.00, 0.45, 0.55, 0.35],
                 [0.45, 1.00, 0.60, 0.35],
                 [0.55, 0.60, 1.00, 0.35],
                 [0.35, 0.35, 0.35, 1.00]])

# USD funding grid (game rules), linear interpolation on tenor
GRID_T = np.array([1, 2, 3, 5, 7, 10, 20])
GRID_R = np.array([4.78, 5.30, 5.52, 5.69, 5.75, 5.82, 6.04]) / 100
def fund(t): return float(np.interp(t, GRID_T, GRID_R))
def df(t): return (1 + fund(t)) ** (-t)

FREQ, N_OBS = 4, 20
TIMES = np.arange(1, N_OBS + 1) / FREQ
DFS = np.array([df(t) for t in TIMES])
CUM_DF = np.concatenate([[0], np.cumsum(DFS)])
DT = 1 / FREQ
N_PATHS = 200_000
ISSUE_PRICE = 0.98            # Natixis margin + hedging costs = 2% upfront

COUPON, BARRIER, AC, FIRST = 0.09, 0.65, 1.00, 4


def simulate(vol=VOL, corr=CORR, n=N_PATHS, real_world=False, eq_drift=0.07):
    """Quarterly basket levels (n x N_OBS). Risk-neutral drift = USD funding - dividend
    (quanto adjustment ignored: FX overlay run by the desk). Real-world: eq_drift p.a. total return."""
    L = np.linalg.cholesky(corr)
    z = np.einsum("ij,tjn->tin", L, rng.standard_normal((N_OBS, 4, n)))
    r = np.array([fund(t) for t in TIMES])
    mu = np.full((N_OBS, 4), eq_drift) - DIV[None, :] if real_world else r[:, None] - DIV[None, :]
    logret = (mu - 0.5 * vol ** 2)[:, :, None] * DT + vol[None, :, None] * np.sqrt(DT) * z
    basket = np.einsum("j,tjn->tn", W, np.exp(np.cumsum(logret, axis=0)))
    return basket.T


def call_quarter(B, ac=AC, first=FIRST, stepdown=0.0):
    n = B.shape[0]
    cq = np.zeros(n, dtype=int)
    alive = np.ones(n, dtype=bool)
    for q in range(first, N_OBS + 1):
        hit = alive & (B[:, q - 1] >= ac - stepdown * (q - first) / FREQ)
        cq[hit] = q
        alive &= ~hit
    return cq


def snowball(B, c, barrier=BARRIER, **kw):
    """Coupon accrues and is paid only on autocall: 100% + c * years. Returns pv, call quarter, payout."""
    cq = call_quarter(B, **kw)
    f = B[:, -1]
    payout = np.where(cq > 0, 1 + c * cq / FREQ, np.where(f >= barrier, 1.0, f))
    lq = np.where(cq > 0, cq, N_OBS)
    return payout * DFS[lq - 1], cq, payout


def fixed_coupon(B, c, barrier=BARRIER, **kw):
    """Draft design: unconditional coupon paid quarterly until call/maturity."""
    cq = call_quarter(B, **kw)
    f = B[:, -1]
    lq = np.where(cq > 0, cq, N_OBS)
    red = np.where(cq > 0, 1.0, np.where(f >= barrier, 1.0, f))
    return c / FREQ * CUM_DF[lq] + red * DFS[lq - 1], cq, red + c * lq / FREQ


def phoenix(B, c, barrier=BARRIER, cpn_barrier=0.70, **kw):
    """Quarterly memory coupon paid if basket >= cpn_barrier; autocall from Q4."""
    n = B.shape[0]
    cq = call_quarter(B, **kw)
    lq = np.where(cq > 0, cq, N_OBS)
    pv, owed = np.zeros(n), np.zeros(n)
    for q in range(1, N_OBS + 1):
        alive = lq >= q
        owed[alive] += c / FREQ
        pay = alive & (B[:, q - 1] >= cpn_barrier)
        pv[pay] += owed[pay] * DFS[q - 1]
        owed[pay] = 0
    f = B[:, -1]
    pv += np.where(cq > 0, 1.0, np.where(f >= barrier, 1.0, f)) * DFS[lq - 1]
    return pv, cq, None


def solve(fn, B, price=ISSUE_PRICE, **kw):
    lo, hi = 0.0, 0.5
    for _ in range(45):
        m = 0.5 * (lo + hi)
        lo, hi = (m, hi) if fn(B, m, **kw)[0].mean() < price else (lo, m)
    return round(m, 4)


def stats(B, c=COUPON, barrier=BARRIER):
    pv, cq, pay = snowball(B, c, barrier)
    lq = np.where(cq > 0, cq, N_OBS)
    yrs = lq / FREQ
    irr = pay ** (1 / yrs) - 1
    return {
        "pv": round(float(pv.mean()), 4),
        "p_called": round(float((cq > 0).mean()), 4),
        "p_call_by_year": [round(float(((cq > 0) & (cq <= 4 * y)).mean()), 4) for y in range(1, 6)],
        "p_par_no_coupon": round(float(((cq == 0) & (pay == 1)).mean()), 4),
        "p_loss": round(float((pay < 1).mean()), 4),
        "avg_loss_given_loss": round(float(1 - pay[pay < 1].mean()), 4) if (pay < 1).any() else 0.0,
        "exp_life_y": round(float(yrs.mean()), 2),
        "exp_payout": round(float(pay.mean()), 4),
        "irr_mean": round(float(irr.mean()), 4),
        "irr_p5": round(float(np.percentile(irr, 5)), 4),
        "irr_p1": round(float(np.percentile(irr, 1)), 4),
        "es95_loss": round(float(1 - np.sort(pay)[: len(pay) // 20].mean()), 4),
    }


def stress_paths():
    """Deterministic, hypothetical quarterly basket paths (levels at Q1..Q20)."""
    def lin(points):  # points: {quarter: level}, linear in between, Q0 = 1.0
        qs = [0] + sorted(points); lv = [1.0] + [points[k] for k in sorted(points)]
        return np.interp(np.arange(1, 21), qs, lv)
    return {
        "AI capex boom": lin({4: 1.18, 20: 1.80}),
        "Range-bound Asia": lin({4: 0.96, 6: 1.01, 20: 1.03}),
        "2022-style tech drawdown, slow recovery": lin({3: 0.70, 8: 0.78, 14: 0.95, 15: 1.02, 20: 1.10}),
        "Lost decade (sideways below par)": lin({4: 0.85, 10: 0.80, 20: 0.88}),
        "Geopolitical shock, no recovery": lin({2: 0.60, 8: 0.50, 20: 0.55}),
    }


if __name__ == "__main__":
    res = {"inputs": {"underlyings": dict(zip(NAMES, LABELS)), "weights": W.tolist(), "vols": VOL.tolist(),
                      "divs": DIV.tolist(), "corr": CORR.tolist(), "issue_price": ISSUE_PRICE,
                      "coupon": COUPON, "barrier": BARRIER, "zcb_5y": round(df(5), 4)}}
    B = simulate()
    res["basket_vol"] = round(float(np.std(np.log(B[:, 3]))), 4)

    # 1. Design comparison (fair coupon at 98% issue price, same basket / autocall / barrier)
    res["design_fair_coupon"] = {
        "fixed_unconditional_70": solve(fixed_coupon, B, barrier=0.70),
        "fixed_unconditional_65": solve(fixed_coupon, B, barrier=0.65),
        "phoenix_memory_cb70_65": solve(phoenix, B, barrier=0.65),
        "snowball_70": solve(snowball, B, barrier=0.70),
        "snowball_65": solve(snowball, B, barrier=0.65),
        "snowball_60": solve(snowball, B, barrier=0.60),
    }
    pv = snowball(B, COUPON)[0].mean()
    res["recommended"] = {"pv": round(float(pv), 4), "natixis_margin": round(float(1 - pv), 4)}
    res["draft_8_5_fixed_70_pv"] = round(float(fixed_coupon(B, 0.085, barrier=0.70)[0].mean()), 4)

    # 2. Risk-neutral statistics and call profile
    res["rn"] = stats(B)
    cq = snowball(B, COUPON)[1]
    res["call_profile"] = [round(float((cq == q).mean()), 4) for q in range(4, 21)] + [round(float((cq == 0).mean()), 4)]

    # 3. Sensitivities of fair snowball coupon
    sens = {"base": res["design_fair_coupon"]["snowball_65"]}
    for tag, v, c in [("vol +3pts", VOL + 0.03, CORR), ("vol -3pts", VOL - 0.03, CORR),
                      ("corr +0.15", VOL, CORR + 0.15 * (1 - np.eye(4))),
                      ("corr -0.15", VOL, CORR - 0.15 * (1 - np.eye(4)))]:
        sens[tag] = solve(snowball, simulate(v, c, n=100_000))
    sens["stepdown 5%/yr"] = solve(snowball, B, stepdown=0.05)
    sens["first call Y2"] = solve(snowball, B, first=8)
    res["coupon_sens"] = sens

    # 4. Real-world outcome distributions (equity total-return drift scenarios)
    res["real_world"] = {f"{int(d*100)}%": stats(simulate(real_world=True, eq_drift=d, n=100_000))
                         for d in [0.00, 0.04, 0.08]}

    # 5. Fan chart percentiles (risk-neutral)
    res["fan"] = {p: [round(float(np.percentile(B[:, q - 1], p)), 3) for q in range(1, 21)] for p in [5, 25, 50, 75, 95]}

    # 6. Hypothetical stress paths
    st = {}
    for name, path in stress_paths().items():
        pv_, cq_, pay_ = snowball(path[None, :], COUPON)
        q = int(cq_[0])
        st[name] = {"path": [round(float(x), 3) for x in path], "call_q": q,
                    "payout": round(float(pay_[0]), 4), "years": (q if q else 20) / 4,
                    "irr": round(float(pay_[0] ** (1 / ((q if q else 20) / 4)) - 1), 4)}
    res["stress"] = st

    # 7. 100% principal-protected alternative (for comparison)
    zcb = df(5)
    call_pv = zcb * np.maximum(B[:, -1] - 1, 0).mean()
    res["ppn"] = {"zcb": round(zcb, 4), "option_budget": round(ISSUE_PRICE - zcb, 4),
                  "atm_call_pv": round(float(call_pv), 4), "participation": round(float((ISSUE_PRICE - zcb) / call_pv), 3),
                  "exp_payout": round(float(1 + (ISSUE_PRICE - zcb) / call_pv * np.maximum(B[:, -1] - 1, 0).mean()), 4)}

    print(json.dumps({k: v for k, v in res.items() if k not in ("fan", "stress")}, indent=1))
    print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "path"} for k, v in res["stress"].items()}, indent=1))
    with open("pricing/scenario2_results.json", "w") as f:
        json.dump(res, f, indent=1)
