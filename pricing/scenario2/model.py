"""Asia Digital Bridge Legacy Note: shared model and inputs (Scenario 2, NKE Private Wealth).

All market inputs below are PLACEHOLDERS calibrated to typical levels. Replace them with
Bloomberg data as of the 17 Sep 2026 trade date (OVDV vols, CORR matrix, BDVD dividends,
local swap curves) before quoting numbers externally.
"""
import numpy as np

# ---- Funding grid (game rules, USD column) -------------------------------------------
GRID_T = np.array([1, 2, 3, 5, 7, 10, 20], dtype=float)
GRID_USD = np.array([4.78, 5.30, 5.52, 5.69, 5.75, 5.82, 6.04]) / 100


def usd_funding(t):
    """Linear interpolation of the USD funding grid (footnote 1 of the rules)."""
    return float(np.interp(t, GRID_T, GRID_USD))


def zcb(t, prot=1.0):
    """Natixis zero-coupon bond paying `prot` at t, discounted at the USD funding rate (annual comp.)."""
    return prot / (1 + usd_funding(t)) ** t


OIS_SPREAD = 0.0045        # derivatives discounted at OIS, assumed ~45 bp below Natixis funding
FEE_PA = 0.0035            # Natixis structuring + hedging margin, 35 bp p.a. (USD 100Mn ticket)

# ---- Underlying basket: four Asian digital-transformation benchmarks -----------------
NAMES = ["Nikkei 225", "TAIEX", "KOSPI 200", "HS TECH"]
TICKERS = ["NKY Index", "TWSE Index", "KOSPI2 Index", "HSTECH Index"]
VOL = np.array([0.23, 0.26, 0.29, 0.33])        # long-dated ATM implied vols, elevated after the 2026 rally (placeholder)
# Quanto risk-neutral drift = local rate - dividend yield - quanto adjustment (placeholder)
LOCAL_R = np.array([0.0323, 0.0175, 0.0275, 0.0500])   # JPY grid 7Y; TWD, KRW, HKD assumed
DIV = np.array([0.017, 0.026, 0.019, 0.009])
QUANTO = np.array([-0.005, 0.002, 0.003, 0.000])        # -rho(S,FX)*volS*volFX, sign per pair
MU_Q = LOCAL_R - DIV - QUANTO
# Real-world expected price return in USD-quanto terms (for the forward-looking backtest)
MU_P = np.array([0.050, 0.055, 0.050, 0.060])
CORR = np.array([
    [1.00, 0.55, 0.60, 0.40],
    [0.55, 1.00, 0.65, 0.45],
    [0.60, 0.65, 1.00, 0.50],
    [0.40, 0.45, 0.50, 1.00],
])
BASKET_W = np.array([0.25, 0.25, 0.25, 0.25])   # equal weight (recommended)
RAINBOW_W = BASKET_W                              # weights by rank; set to [.4,.3,.2,.1] for the rainbow variant

# ---- Note terms (recommended) ---------------------------------------------------------
TENOR = 7
PROTECTION = 1.00
LOCK_LADDER = [(1.30, 1.15), (1.60, 1.30), (2.00, 1.50)]   # (basket trigger on an annual date, locked floor)
PARTICIPATION = 1.25       # quoted; solver gives ~132%, the gap is a skew / forward-vol model reserve


def simulate(n=200_000, tenor=TENOR, mu=MU_Q, vol=VOL, corr=CORR, seed=11, spot=None):
    """Annual-step GBM paths. Returns array (n, tenor, 4) of performance vs initial fixing."""
    rng = np.random.default_rng(seed)
    L = np.linalg.cholesky(corr)
    z = rng.standard_normal((n, tenor, 4)) @ L.T
    inc = (mu - 0.5 * vol ** 2) + vol * z
    perf = np.exp(np.cumsum(inc, axis=1))
    if spot is not None:
        perf = perf * np.asarray(spot)
    return perf


def rainbow(perf, w=None):
    """Basket level on each date. Weights apply by performance rank (equal weights = plain basket)."""
    w = RAINBOW_W if w is None else np.asarray(w)
    return np.sort(perf, axis=-1)[..., ::-1] @ w


def redemption(perf, part, prot=PROTECTION, ladder=LOCK_LADDER, w=None):
    """Redemption (% of notional, 1 = 100%) for each path."""
    b = rainbow(perf, w)                       # (n, dates)
    floor = np.full(b.shape[0], prot)
    peak = b[:, :-1].max(axis=1)               # annual lock-in dates: years 1..tenor-1
    for trig, lock in ladder:
        floor = np.where(peak >= trig, np.maximum(floor, lock), floor)
    upside = prot + part * np.maximum(b[:, -1] - 1.0, 0.0)
    return np.maximum(floor, upside), floor, b


def option_budget(tenor=TENOR, prot=PROTECTION, fee_pa=FEE_PA):
    return 1.0 - zcb(tenor, prot) - fee_pa * tenor


def option_pv(perf, part, tenor=TENOR, prot=PROTECTION, ladder=LOCK_LADDER, r_shift=0.0, w=None):
    red, _, _ = redemption(perf, part, prot, ladder, w)
    r = usd_funding(tenor) - OIS_SPREAD + r_shift
    return np.exp(-r * tenor) * np.mean(red - prot)


def solve_participation(perf, tenor=TENOR, prot=PROTECTION, ladder=LOCK_LADDER, budget=None, w=None):
    """Participation that spends exactly the option budget (bisection, PV is monotone in part)."""
    budget = option_budget(tenor, prot) if budget is None else budget
    lo, hi = 0.0, 5.0
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        if option_pv(perf, mid, tenor, prot, ladder, w=w) > budget:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)
