"""Zero-cost collar on the five-ETF portfolio: worst 1% after 5 years held at ~70% of initial.

Overlay (bought from Natixis OTC on the custom basket, 5Y European, settled at maturity):
  - long a put struck at 70% of the initial basket level
  - short a call whose strike is solved so the call premium pays for the put (net cost zero)
Pricing: risk-neutral Monte Carlo on the same five correlated ETFs (drift = 5Y USD funding 5.69% minus
dividends, discounted on the case grid). Mark-to-market before maturity uses Black-Scholes on the basket
(basket vol and dividend yield). No volatility skew, so real put quotes will be dearer (see notes).
Run: python3 simulation/collar_overlay.py  (writes simulation/mc_collar_*.png and collar_results.json)
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from math import erf, sqrt

import portfolio_mc as pm

PUT_K = 0.70
R5 = 0.0569                      # 5Y USD funding rate (case grid)
DF5 = 0.7583                     # 5Y discount factor used by the pricer
GRAY = "#a3a29c"


def ncdf(x):
    return 0.5 * (1 + np.vectorize(erf)(np.asarray(x) / sqrt(2)))


def bs(S, K, tau, vol, q, kind):
    """Black-Scholes value per unit of basket; tau may be an array (0 handled as intrinsic)."""
    S, tau = np.asarray(S, float), np.maximum(np.asarray(tau, float), 1e-9)
    d1 = (np.log(S / K) + (R5 - q + vol ** 2 / 2) * tau) / (vol * np.sqrt(tau))
    d2 = d1 - vol * np.sqrt(tau)
    if kind == "call":
        return S * np.exp(-q * tau) * ncdf(d1) - K * np.exp(-R5 * tau) * ncdf(d2)
    return K * np.exp(-R5 * tau) * ncdf(-d2) - S * np.exp(-q * tau) * ncdf(-d1)


def solve_call_strike(payoff_mean_fn, target):
    lo, hi = 1.0, 6.0
    for _ in range(60):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if payoff_mean_fn(m) > target else (lo, m)
    return m


if __name__ == "__main__":
    px = pm.load(os.path.join(pm.ROOT, "data", "Stock.xlsx"))
    vol, corr, _ = pm.calibrate(px)
    W, q_div = pm.W, float(pm.W @ pm.DIV)
    bvol = float(np.sqrt(W @ (np.outer(vol, vol) * corr) @ W))

    # 1. Price the collar on the actual 5-ETF basket (risk-neutral MC)
    rn = pm.simulate(R5 - pm.DIV, vol, corr, seed=11) @ W
    put_mc = DF5 * np.maximum(PUT_K - rn[:, -1], 0).mean()
    call_k = solve_call_strike(lambda k: DF5 * np.maximum(rn[:, -1] - k, 0).mean(), put_mc)
    # Black-Scholes cross-check on the basket as one asset
    put_bs = float(bs(1.0, PUT_K, 5, bvol, q_div, "put"))
    call_k_bs = solve_call_strike(lambda k: float(bs(1.0, k, 5, bvol, q_div, "call")), put_bs)

    # 2. Apply to the real-world base-case paths
    rel = pm.simulate(0.08 - pm.DIV, vol, corr)
    P = rel @ W                                         # basket relative, (paths, months+1)
    unhedged = pm.INVEST * P
    t = np.arange(P.shape[1]) / pm.STEPS_PER_YEAR
    tau = pm.YEARS - t
    # MTM of the collar along the path (BS); at maturity it is exactly the clip
    mtm = bs(P, PUT_K, tau, bvol, q_div, "put") - bs(P, call_k, tau, bvol, q_div, "call")
    mtm -= mtm[:, :1]                                  # zero at inception (net premium zero)
    hedged = pm.INVEST * (P + mtm)
    hedged[:, -1] = pm.INVEST * np.clip(P[:, -1], PUT_K, call_k)

    su, sh = pm.summarise(unhedged), pm.summarise(hedged)
    pcts = (1, 5, 25, 50, 75, 95)
    end_u = {p: float(np.percentile(unhedged[:, -1], p)) for p in pcts}
    end_h = {p: float(np.percentile(hedged[:, -1], p)) for p in pcts}
    out = {"put_strike": PUT_K, "call_strike_mc": round(call_k, 4), "call_strike_bs": round(call_k_bs, 4),
           "put_premium_mc": round(float(put_mc), 4), "put_premium_bs": round(put_bs, 4), "basket_vol": round(bvol, 4),
           "p_put_pays": round(float((P[:, -1] < PUT_K).mean()), 4), "p_call_caps": round(float((P[:, -1] > call_k).mean()), 4),
           "year5_percentiles_unhedged": {str(k): round(v, 1) for k, v in end_u.items()},
           "year5_percentiles_collared": {str(k): round(v, 1) for k, v in end_h.items()},
           "unhedged": {k: round(v, 4) for k, v in su.items()}, "collared": {k: round(v, 4) for k, v in sh.items()}}
    json.dump(out, open(os.path.join(pm.HERE, "collar_results.json"), "w"), indent=1)
    print(json.dumps(out, indent=1))

    # ---- Chart 1: fan, unhedged vs collared
    fig, ax = plt.subplots(figsize=(12, 6.2), dpi=200)
    fig.patch.set_facecolor(pm.SURF)
    pm.style(ax)
    qu = {k: np.percentile(unhedged, k, axis=0) for k in (1, 5, 50, 95)}
    qh = {k: np.percentile(hedged, k, axis=0) for k in (1, 5, 25, 50, 75, 95)}
    ax.fill_between(t, qu[1], qu[95], color=GRAY, alpha=0.18, linewidth=0, label="ETFs only: 1st–95th percentile")
    ax.plot(t, qu[1], color=GRAY, linewidth=1.2, linestyle="--")
    ax.fill_between(t, qh[1], qh[95], color=pm.BLUE, alpha=0.16, linewidth=0, label="With collar: 1st–95th percentile")
    ax.fill_between(t, qh[25], qh[75], color=pm.BLUE, alpha=0.30, linewidth=0, label="With collar: 25th–75th percentile")
    ax.plot(t, qh[50], color=pm.BLUE, linewidth=2.2, label="With collar: median")
    ax.plot(t, qh[1], color=pm.BLUE, linewidth=1.6)
    ax.axhline(pm.INVEST, color=pm.MUTED, linewidth=1, linestyle=":")
    ax.axhline(100 * PUT_K, color=pm.ORANGE, linewidth=1.2)
    ax.text(0.05, 100 * PUT_K - 3, f"Put floor {PUT_K:.0%}", color=pm.TEXT, fontsize=9, va="top")
    for k, lab in ((95, "95th"), (50, "Median"), (1, "1st & 5th")):
        ax.text(5.08, qh[k][-1], f"{lab}  {qh[k][-1]:.0f}", color=pm.TEXT, fontsize=9, va="center",
                fontweight="bold" if k in (50, 1) else "normal")
    ax.text(5.08, qu[1][-1], f"1st, ETFs only  {qu[1][-1]:.0f}", color=pm.TEXT2, fontsize=9, va="center")
    ax.annotate("", xy=(4.6, qh[1][-1] - 1), xytext=(4.6, qu[1][-1] + 1),
                arrowprops=dict(arrowstyle="->", color=pm.TEXT, lw=1.2))
    ax.text(4.55, (qh[1][-1] + qu[1][-1]) / 2, "Collar lifts the\nworst 1%", color=pm.TEXT, fontsize=9, ha="right", va="center")
    ax.set_xlim(0, 5.9)
    ax.set_ylim(0, max(qh[95].max(), qu[95].max()) * 1.05)
    ax.set_xticks(range(6))
    ax.set_xticklabels(["17 Sep 2026"] + [f"Year {k}" for k in range(1, 6)])
    ax.set_ylabel("Portfolio value (USD mn)", color=pm.TEXT2, fontsize=10)
    ax.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=pm.TEXT2)
    fig.suptitle("Zero-cost collar: the five-ETF portfolio with its worst 1% held at USD 70mn", x=0.06, ha="left",
                 fontsize=15, fontweight="bold", color=pm.TEXT, y=0.98)
    ax.set_title(f"Buy a 5-year put at {PUT_K:.0%}, sell a 5-year call at {call_k:.0%} on the basket (net premium zero)   |   "
                 f"{pm.N:,} paths, base case, vol and correlation from Bloomberg 2021–26", loc="left", fontsize=9.5, color=pm.TEXT2, pad=10)
    fig.text(0.06, 0.015, "Before maturity the collar is marked to market (Black-Scholes on the basket), so the portfolio can dip "
             "below 70 along the way; the floor is guaranteed at year 5. No volatility skew: real put quotes are dearer, "
             "which would lower the call strike.", fontsize=8, color=pm.MUTED, wrap=True)
    fig.tight_layout(rect=(0, 0.04, 0.97, 0.97))
    fig.savefig(os.path.join(pm.HERE, "mc_collar_fan.png"), facecolor=pm.SURF)
    plt.close(fig)

    # ---- Chart 2: payoff at year 5 + percentile comparison
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(13, 5), dpi=200, gridspec_kw={"width_ratios": [1, 1.15]})
    fig.patch.set_facecolor(pm.SURF)
    pm.style(a1)
    x = np.linspace(0, 3.0, 400)
    a1.plot(100 * x, 100 * x, color=GRAY, linewidth=2, linestyle="--", label="ETFs only")
    a1.plot(100 * x, 100 * np.clip(x, PUT_K, call_k), color=pm.BLUE, linewidth=2.4, label="With collar")
    a1.axvline(100 * PUT_K, color=pm.GRID, linewidth=1)
    a1.axvline(100 * call_k, color=pm.GRID, linewidth=1)
    a1.text(100 * PUT_K + 3, 8, f"Put {PUT_K:.0%}", color=pm.TEXT2, fontsize=9)
    a1.text(100 * call_k - 3, 8, f"Call {call_k:.0%}", color=pm.TEXT2, fontsize=9, ha="right")
    a1.text(100 * PUT_K / 2, 100 * PUT_K + 6, "Floor: 70", color=pm.TEXT, fontsize=9.5, ha="center", fontweight="bold")
    a1.text(100 * call_k - 8, 100 * call_k + 6, f"Cap: {100 * call_k:.0f}", color=pm.TEXT, fontsize=9.5,
            ha="right", fontweight="bold")
    a1.text(100 * call_k + 4, 100 * call_k - 12, f"Capped in\n{out['p_call_caps']:.1%} of paths",
            color=pm.TEXT2, fontsize=8.5, va="top")
    a1.text(3, 100 * PUT_K + 30, f"Put pays in\n{out['p_put_pays']:.0%} of paths", color=pm.TEXT2, fontsize=8.5)
    a1.set_xlim(0, 300)
    a1.set_ylim(0, 300)
    a1.set_xlabel("Basket at year 5 (% of initial)", color=pm.TEXT2, fontsize=10)
    a1.set_ylabel("Portfolio value at year 5 (USD mn)", color=pm.TEXT2, fontsize=10)
    a1.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=pm.TEXT2)
    a1.set_title("Payoff at year 5", loc="left", fontsize=11.5, color=pm.TEXT, fontweight="bold")

    pm.style(a2)
    labels = ["Worst 1%", "Worst 5%", "25th", "Median", "75th", "95th"]
    xs = np.arange(len(pcts))
    bw = 0.38
    bu = a2.bar(xs - bw / 2 - 0.01, [end_u[p] for p in pcts], bw, color=GRAY, label="ETFs only")
    bh = a2.bar(xs + bw / 2 + 0.01, [end_h[p] for p in pcts], bw, color=pm.BLUE, label="With collar")
    for bars in (bu, bh):
        for b in bars:
            a2.text(b.get_x() + b.get_width() / 2, b.get_height() + 3, f"{b.get_height():.0f}", ha="center",
                    fontsize=8.5, color=pm.TEXT)
    a2.axhline(pm.INVEST, color=pm.MUTED, linewidth=1, linestyle=":")
    a2.set_xticks(xs)
    a2.set_xticklabels(labels)
    a2.set_ylabel("USD mn at year 5", color=pm.TEXT2, fontsize=10)
    a2.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=pm.TEXT2)
    a2.set_title("Outcomes after 5 years (base case)", loc="left", fontsize=11.5, color=pm.TEXT, fontweight="bold")
    fig.suptitle("What the collar does: gives up the far upside to guarantee 70 at maturity", x=0.01, ha="left",
                 fontsize=14, fontweight="bold", color=pm.TEXT)
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    fig.savefig(os.path.join(pm.HERE, "mc_collar_payoff.png"), facecolor=pm.SURF)
    plt.close(fig)
