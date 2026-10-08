"""Scenario 2 (NKE Private Wealth / Chak family): Asian Digital Transformation Capital-Protected Autocallable Note.

Monte Carlo pricer, coupon solver, design comparison, sensitivities and scenario statistics.
Market inputs (vols, dividends, correlations) are ASSUMPTIONS, to be refreshed with Bloomberg
data as of the 17 Sep 2026 trade date. Discounting uses the USD funding grid from the game rules.

Recommended product (USD, quanto, 5Y, quarterly observations):
  - Conditional memory coupon: 6.5% p.a. (1.625% per quarter), paid on each quarterly date the
    basket is >= 100% of initial, together with any coupons missed on earlier dates
  - Autocall: from Q4 (1Y) onwards, if basket >= 100% -> 100% + coupons due, note ends
  - Maturity (not called): 100% of principal (capital protected, subject to Natixis credit)
  - Basket = weighted sum of index performances (not worst-of)
Earlier designs (snowball, fixed coupon, phoenix with barrier) are kept for comparison.
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

COUPON, CPN_BARRIER, AC, FIRST = 0.065, 1.00, 1.00, 4
BARRIER = 0.65               # default capital barrier for the at-risk comparison designs


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


def protected_cf(B, c=COUPON, cpn_barrier=CPN_BARRIER, **kw):
    """Cash flows (n x N_OBS, % of notional) of the capital-protected memory-coupon autocall."""
    n = B.shape[0]
    cq = call_quarter(B, **kw)
    lq = np.where(cq > 0, cq, N_OBS)
    cf, owed = np.zeros((n, N_OBS)), np.zeros(n)
    for q in range(1, N_OBS + 1):
        alive = lq >= q
        owed[alive] += c / FREQ
        pay = alive & (B[:, q - 1] >= cpn_barrier)
        cf[pay, q - 1] += owed[pay]
        owed[pay] = 0
    cf[np.arange(n), lq - 1] += 1.0
    return cf, cq


def protected(B, c=COUPON, cpn_barrier=CPN_BARRIER, **kw):
    cf, cq = protected_cf(B, c, cpn_barrier, **kw)
    return cf @ DFS, cq, cf.sum(axis=1)


def irr(cf):
    """Quarterly cash flows per path -> annual IRR (vectorised bisection), price = 100%."""
    lo, hi = np.full(cf.shape[0], -0.5), np.full(cf.shape[0], 0.5)
    for _ in range(60):
        r = 0.5 * (lo + hi)
        v = (cf * (1 + r[:, None]) ** (-TIMES[None, :])).sum(axis=1)
        up = v > 1
        lo, hi = np.where(up, r, lo), np.where(up, hi, r)
    return 0.5 * (lo + hi)


def stats(B, c=COUPON):
    cf, cq = protected_cf(B, c)
    lq = np.where(cq > 0, cq, N_OBS)
    cpn = cf.sum(axis=1) - 1
    r = irr(cf)
    return {
        "pv": round(float((cf @ DFS).mean()), 4),
        "p_called": round(float((cq > 0).mean()), 4),
        "p_call_by_year": [round(float(((cq > 0) & (cq <= 4 * y)).mean()), 4) for y in range(1, 6)],
        "p_zero_return": round(float((cpn < 1e-9).mean()), 4),
        "p_not_called_some_cpn": round(float(((cq == 0) & (cpn > 1e-9)).mean()), 4),
        "p_loss": 0.0,
        "exp_life_y": round(float((lq / FREQ).mean()), 2),
        "exp_total_coupons": round(float(cpn.mean()), 4),
        "irr_mean": round(float(r.mean()), 4),
        "irr_p5": round(float(np.percentile(r, 5)), 4),
        "irr_p50": round(float(np.percentile(r, 50)), 4),
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


def p_breach(fn, B, c, barrier, **kw):
    cq = fn(B, c, barrier=barrier, **kw)[1]
    return round(float(((cq == 0) & (B[:, -1] < barrier)).mean()), 4)


if __name__ == "__main__":
    res = {"inputs": {"underlyings": dict(zip(NAMES, LABELS)), "weights": W.tolist(), "vols": VOL.tolist(),
                      "divs": DIV.tolist(), "corr": CORR.tolist(), "issue_price": ISSUE_PRICE,
                      "coupon": COUPON, "cpn_barrier": CPN_BARRIER, "zcb_5y": round(df(5), 4)}}
    B = simulate()
    res["basket_vol"] = round(float(np.std(np.log(B[:, 3]))), 4)

    # 1. Recommended product: value, margin and decomposition
    cf, cq = protected_cf(B)
    lq = np.where(cq > 0, cq, N_OBS)
    pv_principal = float(DFS[lq - 1].mean())
    pv = float((cf @ DFS).mean())
    res["recommended"] = {"pv": round(pv, 4), "natixis_margin": round(1 - pv, 4),
                          "fair_coupon": solve(protected, B), "pv_principal": round(pv_principal, 4),
                          "pv_coupons": round(pv - pv_principal, 4)}

    # 2. Design comparison: fair coupon at 98% and probability of capital loss
    C10 = np.full((4, 4), 0.999); np.fill_diagonal(C10, 1.0)
    B10 = simulate(vol=np.full(4, 0.10), corr=C10)
    designs = {}
    c = solve(fixed_coupon, B, barrier=0.70); designs["Classic: fixed coupon, 70% barrier"] = [c, p_breach(fixed_coupon, B, c, 0.70)]
    c = solve(phoenix, B, barrier=0.70, cpn_barrier=0.80); designs["Phoenix memory (80% cpn barrier), 70% barrier"] = [c, p_breach(phoenix, B, c, 0.70, cpn_barrier=0.80)]
    c = solve(snowball, B, barrier=0.65); designs["Snowball, 65% barrier"] = [c, p_breach(snowball, B, c, 0.65)]
    c = solve(fixed_coupon, B10, barrier=0.70); designs["Classic, 70% barrier, 10%-vol basket"] = [c, p_breach(fixed_coupon, B10, c, 0.70)]
    designs["Capital protected, memory coupon"] = [res["recommended"]["fair_coupon"], 0.0]
    res["designs"] = {k: {"fair_coupon": round(v[0], 4), "p_loss": v[1]} for k, v in designs.items()}
    res["draft_8_5_fixed_70_pv"] = round(float(fixed_coupon(B, 0.085, barrier=0.70)[0].mean()), 4)
    res["snowball_alt"] = {"coupon": 0.09, "barrier": 0.65, "p_loss": p_breach(snowball, B, 0.09, 0.65),
                           "fair_coupon": designs["Snowball, 65% barrier"][0]}

    # 3. Risk-neutral statistics and call profile
    res["rn"] = stats(B)
    res["call_profile"] = [round(float((cq == q).mean()), 4) for q in range(4, 21)] + [round(float((cq == 0).mean()), 4)]

    # 4. Sensitivities of the fair coupon
    sens = {"base": res["recommended"]["fair_coupon"]}
    for tag, v, cr in [("vol +3pts", VOL + 0.03, CORR), ("vol -3pts", VOL - 0.03, CORR),
                       ("corr +0.15", VOL, CORR + 0.15 * (1 - np.eye(4))),
                       ("corr -0.15", VOL, CORR - 0.15 * (1 - np.eye(4)))]:
        sens[tag] = solve(protected, simulate(v, cr, n=100_000))
    for cb in (0.90, 0.95):
        sens[f"cpn barrier {int(cb*100)}%"] = solve(protected, B, cpn_barrier=cb)
    sens["first call Y2"] = solve(protected, B, first=8)
    _fund = fund
    for sh in (0.01, 0.02):
        globals()["fund"] = lambda t, s=sh: _fund(t) - s      # equity drift only; DFS already fixed
        sens[f"drift -{int(sh*100)}%"] = solve(protected, simulate(n=100_000))
    globals()["fund"] = _fund
    res["coupon_sens"] = sens

    # 5. Real-world outcome distributions (equity total-return drift scenarios)
    res["real_world"] = {f"{int(d*100)}%": stats(simulate(real_world=True, eq_drift=d, n=100_000))
                         for d in [0.00, 0.04, 0.08]}

    # 6. Fan chart percentiles (risk-neutral)
    res["fan"] = {p: [round(float(np.percentile(B[:, q - 1], p)), 3) for q in range(1, 21)] for p in [5, 25, 50, 75, 95]}

    # 7. Hypothetical stress paths
    st = {}
    for name, path in stress_paths().items():
        cfp, cqp = protected_cf(path[None, :])
        q = int(cqp[0])
        cpn_dates = cfp[0].copy(); cpn_dates[(q if q else 20) - 1] -= 1.0
        st[name] = {"path": [round(float(x), 3) for x in path], "call_q": q, "years": (q if q else 20) / 4,
                    "coupons": round(float(cfp.sum() - 1), 4), "cpn_quarters": [i + 1 for i, x in enumerate(cpn_dates) if x > 1e-9],
                    "total": round(float(cfp.sum()), 4), "irr": round(float(irr(cfp)[0]), 4)}
    res["stress"] = st

    # 8. 100% principal-protected participation note (comparison)
    zcb = df(5)
    call_pv = zcb * np.maximum(B[:, -1] - 1, 0).mean()
    res["ppn"] = {"zcb": round(zcb, 4), "option_budget": round(ISSUE_PRICE - zcb, 4),
                  "atm_call_pv": round(float(call_pv), 4), "participation": round(float((ISSUE_PRICE - zcb) / call_pv), 3)}

    print(json.dumps({k: v for k, v in res.items() if k not in ("fan", "stress", "inputs")}, indent=1))
    print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "path"} for k, v in res["stress"].items()}, indent=1))
    with open(__file__.replace("scenario2_autocall_mc.py", "scenario2_results.json"), "w") as f:
        json.dump(res, f, indent=1)
