"""Risk metrics for the K-Dislocation Note (Unit 15 checklist): Greeks, delta-normal VaR/ES,
and instant stress revaluation with spot and vol shocked together.
All market inputs are PLACEHOLDERS - replace with Bloomberg data as of 17 Sep 2026."""
import numpy as np
from math import log, sqrt, exp
from scipy.stats import norm

N, T, STEPS = 100_000, 1.5, 378
rK, rU, q, rFund = 0.025, 0.0375, 0.018, 0.045        # KRW, USD, KOSPI div, KRW-equivalent funding
BASE = dict(vB=0.35, vK=0.22, vF=0.09, sB=1.0, sK=1.0, sF=1.0, dr=0.0)
RHO = np.array([[1, -0.2, 0.3], [-0.2, 1, -0.5], [0.3, -0.5, 1]])   # Brent, KOSPI, USDKRW
PART_A, PAY_B, PART_C, PROT = 1.2, 0.27, 0.65, 0.90
Z = np.random.default_rng(7).standard_normal((STEPS, 3, N))          # common random numbers
L = np.linalg.cholesky(RHO)

def bs_call(S, K, v, t, r):
    d1 = (log(S / K) + (r - q + 0.5 * v * v) * t) / (v * sqrt(t)); d2 = d1 - v * sqrt(t)
    return S * exp(-q * t) * norm.cdf(d1) - K * exp(-r * t) * norm.cdf(d2)

def value(p):
    """Note value (% notional) at t=0 after an instant shock p (spot multipliers vs initial fixing)."""
    vB, vK, vF, dt = p["vB"], p["vK"], p["vF"], T / STEPS
    r = rK + p["dr"]
    lB = np.full(N, log(p["sB"])); lK = np.full(N, log(p["sK"])); lF = np.full(N, log(p["sF"]))
    trig = np.exp(lB) >= 1.25; Kt = np.where(trig, np.exp(lK), 1.0)
    for i in range(STEPS):
        z = L @ Z[i]
        lB += -0.5 * vB**2 * dt + vB * sqrt(dt) * z[0]
        lK += (r - q - 0.5 * vK**2) * dt + vK * sqrt(dt) * z[1]
        lF += (r - rU - 0.5 * vF**2) * dt + vF * sqrt(dt) * z[2]
        if i < 252:
            new = (~trig) & (np.exp(lB) >= 1.25); Kt[new] = np.exp(lK[new]); trig |= new
    D = exp(-r * T); KT = np.exp(lK)
    A = PART_A * D * np.mean(np.where(trig, np.maximum(KT / Kt - 1, 0), 0))
    B = PAY_B * D * np.mean((np.exp(lB) >= 1.10) & (np.exp(lF) <= 0.97))
    skew = 0.035 * (p["vK"] / 0.22)                                  # 130% strike vol below ATM
    C = PART_C * (bs_call(p["sK"], 1.0, vK, T, r) - bs_call(p["sK"], 1.30, vK - skew, T, r))
    zcb = PROT / (1 + rFund + p["dr"]) ** T
    return 100 * (zcb + A + B + C), 100 * np.array([zcb, A, B, C])

def shocked(**kw):
    p = dict(BASE); p.update(kw); return p

if __name__ == "__main__":
    v0, parts = value(BASE)
    print(f"Fair value {v0:.2f}% | ZCB {parts[0]:.2f} A {parts[1]:.2f} B {parts[2]:.2f} C {parts[3]:.2f}")
    # Greeks by bump-and-reprice (per 1% spot, per 1 vol pt, per 1bp)
    g = {}
    for k in ["sB", "sK", "sF"]:
        up, _ = value(shocked(**{k: 1.01})); dn, _ = value(shocked(**{k: 0.99})); g[k] = (up - dn) / 2
    for k in ["vB", "vK", "vF"]:
        up, _ = value(shocked(**{k: BASE[k] + 0.01})); g[k] = up - v0
    up, _ = value(shocked(dr=0.0001)); g["dr"] = up - v0
    print("Greeks (% notional): " + ", ".join(f"{k} {v:+.3f}" for k, v in g.items()))
    # Delta-normal VaR, 10-day, 99%; rates 5bp/day independent
    dvol = np.array([BASE["vB"], BASE["vK"], BASE["vF"]]) / sqrt(252) * 100   # daily % moves
    d = np.array([g["sB"], g["sK"], g["sF"]]) * dvol
    sd1 = sqrt(d @ RHO @ d + (g["dr"] * 5) ** 2)
    sd10 = sd1 * sqrt(10)
    var, es = 2.326 * sd10, sd10 * norm.pdf(2.326) / 0.01
    print(f"10-day 99% VaR {var:.2f}% | ES {es:.2f}% of notional")
    # Stress: spot and vol shocked together
    S = {
        "Risk-off: KOSPI -20%, KRW -5%, vols +10pts, rates +50bp": shocked(sK=0.8, sF=1.05, vK=0.32, vB=0.45, vF=0.14, dr=0.005),
        "Oil shock: Brent +30%, KOSPI -10%, vols +8pts":            shocked(sB=1.3, sK=0.9, sF=1.03, vK=0.30, vB=0.43, vF=0.12),
        "Ceasefire: Brent -20%, KOSPI +10%, vols -3pts":            shocked(sB=0.8, sK=1.1, sF=0.98, vK=0.19, vB=0.32, vF=0.08),
    }
    for name, p in S.items():
        v, _ = value(p); print(f"{name}: MTM {v:.2f}% ({v - v0:+.2f})")
