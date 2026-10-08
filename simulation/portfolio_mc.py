"""Monte Carlo simulation of the five-ETF portfolio over the next 5 years.

Portfolio (buy and hold from 17 Sep 2026, USD): 3119 HK 25%, EWY US 15%, EWT US 15%, 2644 JP 25%, 00878 TT 20%.
Calibration: Bloomberg daily USD prices (data/Stock.xlsx, 2021-09 to 2026-09).
  - Volatility and correlation from weekly log returns (weekly avoids the Asia/US closing-time mismatch).
  - Correlated geometric Brownian motion, monthly steps, 20,000 paths.
Drift scenarios (annual expected price return per ETF):
  - Base: 8% total return minus each ETF's dividend yield (same assumption as the pricing deck)
  - Bear: 0% total return minus dividend yield
  - Historical: each ETF's own 2021-26 average return (the AI boom; optimistic)
Prices are price-only (PX_LAST), so dividends are not reinvested.
Run: python3 simulation/portfolio_mc.py  (writes simulation/*.png and simulation/portfolio_mc_results.json)
"""
import json
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from load_prices import TICKERS, load

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAMES = {"3119 HK": "Asia Semiconductor (3119 HK)", "EWY US": "MSCI South Korea (EWY)", "EWT US": "MSCI Taiwan (EWT)",
         "2644 JP": "Japan Semiconductor (2644 JP)", "00878 TT": "Taiwan ESG High Dividend (00878 TT)"}
W = np.array([0.25, 0.15, 0.15, 0.25, 0.20])
DIV = np.array([0.010, 0.012, 0.026, 0.008, 0.076])     # dividend yields, as in pricing/scenario2_autocall_mc.py
YEARS, STEPS_PER_YEAR, N = 5, 12, 20_000
INVEST = 100.0                                           # USD mn

# Palette (dataviz reference, light mode)
BLUE, TEXT, TEXT2, MUTED, GRID, SURF = "#2a78d6", "#0b0b0b", "#52514e", "#8a8984", "#e6e5e1", "#fcfcfb"
ORANGE, AQUA = "#eb6834", "#1baf7a"


def calibrate(px):
    wk = np.log(px.ffill().dropna().resample("W-FRI").last()).diff().dropna()
    vol = wk.std().values * np.sqrt(52)
    corr = wk.corr().values
    hist_mu = wk.mean().values * 52 + vol ** 2 / 2        # arithmetic annual expected return
    return vol, corr, hist_mu


def simulate(mu, vol, corr, seed=7):
    rng = np.random.default_rng(seed)
    dt = 1 / STEPS_PER_YEAR
    L = np.linalg.cholesky(corr)
    z = rng.standard_normal((N, YEARS * STEPS_PER_YEAR, len(W))) @ L.T
    logret = (mu - vol ** 2 / 2) * dt + vol * np.sqrt(dt) * z
    rel = np.exp(np.cumsum(logret, axis=1))               # price relative to today, per ETF
    rel = np.concatenate([np.ones((N, 1, len(W))), rel], axis=1)
    return rel                                            # (paths, months+1, ETFs)


def summarise(port):
    end = port[:, -1]
    cagr = (end / INVEST) ** (1 / YEARS) - 1
    pct = lambda q: float(np.percentile(end, q))
    return {"p5": pct(5), "p25": pct(25), "median": pct(50), "p75": pct(75), "p95": pct(95), "mean": float(end.mean()),
            "median_cagr": float(np.median(cagr)), "p_loss": float((end < INVEST).mean()),
            "p_below_70": float((end < 0.7 * INVEST).mean()), "p_double": float((end >= 2 * INVEST).mean()),
            "median_max_drawdown": float(np.median(1 - (port / np.maximum.accumulate(port, axis=1)).min(axis=1)))}


def style(ax):
    ax.set_facecolor(SURF)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color(GRID)
    ax.tick_params(colors=TEXT2, labelsize=9, length=0)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)


def fan_chart(px, months, port, scen_medians, s, path):
    fig, ax = plt.subplots(figsize=(12, 6.2), dpi=200)
    fig.patch.set_facecolor(SURF)
    style(ax)
    # History: the same weights bought 5 years earlier, scaled so today = USD 100mn
    hist = px.ffill().dropna()
    hist_port = (hist / hist.iloc[0]) @ W
    hist_port = hist_port / hist_port.iloc[-1] * INVEST
    t_hist = (hist.index - hist.index[-1]).days / 365.25
    ax.plot(t_hist, hist_port.values, color=TEXT2, linewidth=1.6)
    ax.text(t_hist[0] + 0.1, hist_port.values[0] * 1.15 + 6, "History (Bloomberg)\nsame weights", color=TEXT2, fontsize=9, va="bottom")
    t = months / STEPS_PER_YEAR
    q = {k: np.percentile(port, k, axis=0) for k in (5, 25, 50, 75, 95)}
    ax.fill_between(t, q[5], q[95], color=BLUE, alpha=0.13, linewidth=0, label="5th–95th percentile")
    ax.fill_between(t, q[25], q[75], color=BLUE, alpha=0.28, linewidth=0, label="25th–75th percentile")
    rng = np.random.default_rng(3)
    for i in rng.choice(N, 25, replace=False):
        ax.plot(t, port[i], color=BLUE, alpha=0.22, linewidth=0.6)
    ax.plot(t, q[50], color=BLUE, linewidth=2.2, label="Median (base case)")
    for name, (med, color) in scen_medians.items():
        ax.plot(t, med, color=color, linewidth=1.6, linestyle="--")
        j = 3 * STEPS_PER_YEAR
        up = name == "Historical"
        ax.text(t[j], med[j] + (8 if up else -8), f"{name} median → {med[-1]:.0f}", color=TEXT, fontsize=9,
                ha="right" if up else "left", va="bottom" if up else "top")
    ax.axhline(INVEST, color=MUTED, linewidth=1, linestyle=":")
    ax.axvline(0, color=MUTED, linewidth=1)
    for k, lab in ((95, "95th"), (75, "75th"), (50, "Median"), (25, "25th"), (5, "5th")):
        ax.text(t[-1] + 0.08, q[k][-1], f"{lab}  {q[k][-1]:.0f}", color=TEXT, fontsize=9, va="center",
                fontweight="bold" if k == 50 else "normal")
    ax.text(0.05, 8, "Trade date 17 Sep 2026", color=TEXT2, fontsize=9)
    ax.set_ylim(0, max(q[95][-1] * 1.08, hist_port.max() * 1.1))
    ax.set_xticks(range(-5, 6))
    ax.set_xticklabels([f"{2026 + k}" for k in range(-5, 6)])
    ax.set_ylabel("Portfolio value (USD mn)", color=TEXT2, fontsize=10)
    fig.suptitle("Monte Carlo: USD 100mn in the five-ETF portfolio, next 5 years", x=0.06, ha="left", fontsize=15,
                 fontweight="bold", color=TEXT, y=0.98)
    ax.set_title(f"3119 HK 25% · 2644 JP 25% · 00878 TT 20% · EWY 15% · EWT 15%   |   {N:,} paths, vol and correlation "
                 f"from 5Y weekly Bloomberg data   |   portfolio vol {s['port_vol']:.0%}",
                 loc="left", fontsize=9.5, color=TEXT2, pad=10)
    ax.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=TEXT2)
    ax.set_xlim(t_hist[0], 6.3)
    fig.text(0.06, 0.015, f"Base case: 8% a year expected total return per ETF, minus its dividend yield (price only, dividends not "
             f"reinvested). Dashed lines: medians with each ETF's 2021–26 average return (historical) and with 0% total return (bear). "
             f"Buy and hold, no rebalancing.", fontsize=8, color=MUTED, wrap=True)
    fig.tight_layout(rect=(0, 0.04, 0.97, 0.97))
    fig.savefig(path, facecolor=SURF)
    plt.close(fig)


def etf_panels(rel, path):
    fig, axes = plt.subplots(1, 5, figsize=(14, 3.8), dpi=200, sharey=True)
    fig.patch.set_facecolor(SURF)
    t = np.arange(rel.shape[1]) / STEPS_PER_YEAR
    for i, ax in enumerate(axes):
        style(ax)
        v = rel[:, :, i] * 100
        q = {k: np.percentile(v, k, axis=0) for k in (5, 25, 50, 75, 95)}
        ax.fill_between(t, q[5], q[95], color=BLUE, alpha=0.13, linewidth=0)
        ax.fill_between(t, q[25], q[75], color=BLUE, alpha=0.28, linewidth=0)
        ax.plot(t, q[50], color=BLUE, linewidth=2)
        ax.axhline(100, color=MUTED, linewidth=1, linestyle=":")
        ax.set_title(f"{NAMES[TICKERS[i]]}\nweight {W[i]:.0%}", fontsize=9.5, color=TEXT, loc="left")
        ax.text(5, q[50][-1], f"{q[50][-1]:.0f}", color=TEXT, fontsize=9, ha="right", va="bottom", fontweight="bold")
        ax.text(5, q[95][-1], f"95th {q[95][-1]:.0f}", color=TEXT2, fontsize=8, ha="right", va="bottom")
        ax.text(5, q[5][-1], f"5th {q[5][-1]:.0f}", color=TEXT2, fontsize=8, ha="right", va="top")
        ax.set_xticks(range(0, 6))
        ax.set_xticklabels([f"Y{k}" for k in range(6)])
    axes[0].set_ylabel("Price, today = 100", color=TEXT2, fontsize=9.5)
    axes[0].set_ylim(0, None)
    fig.suptitle("Each ETF on its own: median and 25–75 / 5–95 percentile bands (base case)", x=0.01, ha="left",
                 fontsize=13, fontweight="bold", color=TEXT)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(path, facecolor=SURF)
    plt.close(fig)


def end_histogram(port, s, path):
    fig, ax = plt.subplots(figsize=(10, 4.8), dpi=200)
    fig.patch.set_facecolor(SURF)
    style(ax)
    end = port[:, -1]
    bins = np.arange(0, min(end.max(), 400) + 10, 10)
    h, e = np.histogram(np.clip(end, 0, bins[-1] - 1e-6), bins=bins)
    share = h / len(end) * 100
    ax.bar(e[:-1], share, width=9, align="edge", color=[ORANGE if x < INVEST else BLUE for x in e[:-1]], linewidth=0)
    ax.axvline(INVEST, color=TEXT2, linewidth=1, linestyle=":")
    ax.axvline(s["median"], color=TEXT, linewidth=1.4)
    ax.text(s["median"] + 3, share.max() * 1.25, f"Median {s['median']:.0f}", color=TEXT, fontsize=9.5, fontweight="bold")
    ax.text(INVEST - 3, share.max() * 1.25, f"Below 100: {s['p_loss']:.0%} of paths", color=TEXT, fontsize=9.5, ha="right")
    ax.text(INVEST - 3, share.max() * 1.15, f"Below 70: {s['p_below_70']:.0%}", color=TEXT2, fontsize=9, ha="right")
    ax.text(s["median"] + 3, share.max() * 1.15, f"Doubles (≥200): {s['p_double']:.0%}", color=TEXT2, fontsize=9)
    ax.set_ylim(0, share.max() * 1.35)
    ticks = list(range(0, int(bins[-1]) + 1, 50))
    ax.set_xticks(ticks)
    ax.set_xticklabels([str(x) for x in ticks[:-1]] + [f"{ticks[-1]}+"])
    ax.set_xlabel("Portfolio value after 5 years (USD mn)", color=TEXT2, fontsize=10)
    ax.set_ylabel("Share of paths (%)", color=TEXT2, fontsize=10)
    fig.suptitle("Where USD 100mn ends after 5 years (base case)", x=0.06, ha="left", fontsize=13, fontweight="bold", color=TEXT)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(path, facecolor=SURF)
    plt.close(fig)


if __name__ == "__main__":
    px = load(os.path.join(ROOT, "data", "Stock.xlsx"))
    vol, corr, hist_mu = calibrate(px)
    scen = {"Base": 0.08 - DIV, "Bear": 0.0 - DIV, "Historical": hist_mu}
    out = {"inputs": {"weights": dict(zip(TICKERS, W.tolist())), "vol": dict(zip(TICKERS, vol.round(4).tolist())),
                      "corr": corr.round(3).tolist(), "div": dict(zip(TICKERS, DIV.tolist())),
                      "data": f"{px.ffill().dropna().index[0].date()} to {px.index[-1].date()}", "paths": N}}
    sims = {}
    for k, mu in scen.items():
        rel = simulate(mu, vol, corr)
        port = INVEST * rel @ W
        sims[k] = (rel, port)
        out[k] = {"drift": dict(zip(TICKERS, mu.round(4).tolist())), **{a: round(b, 4) for a, b in summarise(port).items()}}
    s = out["Base"]
    s["port_vol"] = float(np.sqrt(W @ (np.outer(vol, vol) * corr) @ W))
    months = np.arange(YEARS * STEPS_PER_YEAR + 1)
    meds = {"Historical": (np.median(sims["Historical"][1], axis=0), AQUA), "Bear": (np.median(sims["Bear"][1], axis=0), ORANGE)}
    fan_chart(px, months, sims["Base"][1], meds, s, os.path.join(HERE, "mc_portfolio_fan.png"))
    etf_panels(sims["Base"][0], os.path.join(HERE, "mc_etf_panels.png"))
    end_histogram(sims["Base"][1], s, os.path.join(HERE, "mc_year5_distribution.png"))
    json.dump(out, open(os.path.join(HERE, "portfolio_mc_results.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in out.items() if k != "inputs"}, indent=1))
    print(out["inputs"]["vol"])
