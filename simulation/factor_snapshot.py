"""Factor snapshot of the five-ETF portfolio as of the trade date (17 Sep 2026), from Bloomberg USD prices.

Factors measured on each ETF and on the portfolio (3119 HK 25%, EWY 15%, EWT 15%, 2644 JP 25%, 00878 TT 20%):
  momentum (1M/3M/6M/1Y/3Y/5Y price return), volatility (realised 3M vs 5Y average),
  drawdown (from 52-week high; worst 5Y), correlation (average pairwise, 3M vs 5Y), regime percentiles.
Run: python3 simulation/factor_snapshot.py  (writes simulation/factor_snapshot.json and mc_factor_*.png)
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import portfolio_mc as pm

SLOTS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"]   # dataviz categorical order


def ret(s, days):
    d = s.index[-1] - pd.Timedelta(days=days)
    base = s[s.index <= d]
    return float(s.iloc[-1] / base.iloc[-1] - 1) if len(base) else None


if __name__ == "__main__":
    px = pm.load(os.path.join(pm.ROOT, "data", "Stock.xlsx")).ffill().dropna()
    port = (px / px.iloc[0]) @ pm.W
    allp = pd.concat([px, port.rename("Portfolio")], axis=1)
    wk = np.log(allp.resample("W-FRI").last()).diff().dropna()
    out = {"as_of": str(px.index[-1].date()), "etfs": {}}
    for k in allp.columns:
        s = allp[k]
        dly = np.log(s).diff().dropna()
        rv = dly.rolling(63).std() * np.sqrt(252)
        dd = s / s.cummax() - 1
        hi52 = s[s.index > s.index[-1] - pd.Timedelta(days=365)].max()
        out["etfs"][k] = {
            "ret_1m": ret(s, 30), "ret_3m": ret(s, 91), "ret_6m": ret(s, 182), "ret_1y": ret(s, 365),
            "cagr_3y": (1 + ret(s, 3 * 365)) ** (1 / 3) - 1, "cagr_5y": float((s.iloc[-1] / s.iloc[0]) ** (365.25 / (s.index[-1] - s.index[0]).days) - 1),
            "vol_3m": float(rv.iloc[-1]), "vol_5y_weekly": float(wk[k].std() * np.sqrt(52)),
            "vol_3m_percentile": float((rv.dropna() <= rv.iloc[-1]).mean()),
            "from_52w_high": float(s.iloc[-1] / hi52 - 1), "max_dd_5y": float(dd.min()),
            "pct_above_200d": float(s.iloc[-1] / s.rolling(200).mean().iloc[-1] - 1)}
    # average pairwise correlation, rolling 13 weeks vs full
    w5 = wk[px.columns]
    iu = np.triu_indices(5, 1)
    roll = [w5.iloc[i - 13:i].corr().values[iu].mean() for i in range(13, len(w5) + 1)]
    out["avg_corr_5y"] = float(w5.corr().values[iu].mean())
    out["avg_corr_3m"] = float(roll[-1])
    out["avg_corr_3m_percentile"] = float((np.array(roll) <= roll[-1]).mean())
    json.dump(out, open(os.path.join(pm.HERE, "factor_snapshot.json"), "w"), indent=1)
    for k, v in out["etfs"].items():
        print(f"{k:9s} " + " ".join(f"{a}={b:+.1%}" if a != "vol_3m_percentile" else f"{a}={b:.0%}" for a, b in v.items()))
    print("avg corr 5y", round(out["avg_corr_5y"], 2), "3m", round(out["avg_corr_3m"], 2), "pct", round(out["avg_corr_3m_percentile"], 2))

    # Chart A: rebased prices (log scale), five ETFs + portfolio
    fig, ax = plt.subplots(figsize=(12, 5.6), dpi=200)
    fig.patch.set_facecolor(pm.SURF)
    pm.style(ax)
    reb = 100 * allp / allp.iloc[0]
    order = ["3119 HK", "2644 JP", "00878 TT", "EWY US", "EWT US"]
    ends = []
    for i, k in enumerate(order):
        ax.plot(reb.index, reb[k], color=SLOTS[i], linewidth=1.5, label=pm.NAMES[k])
        ends.append((reb[k].iloc[-1], f"{k}  {reb[k].iloc[-1]:.0f}", SLOTS[i]))
    ax.plot(reb.index, reb["Portfolio"], color=pm.TEXT, linewidth=2.6, label="Portfolio (our weights)")
    ends.append((reb["Portfolio"].iloc[-1], f"Portfolio  {reb['Portfolio'].iloc[-1]:.0f}", pm.TEXT))
    ends.sort()
    ypos, last = [], -1e9
    for v, *_ in ends:                                   # de-collide end labels in log space
        y = max(np.log(v), last + 0.065); ypos.append(y); last = y
    for (v, lab, c), y in zip(ends, ypos):
        ax.text(reb.index[-1] + pd.Timedelta(days=12), np.exp(y), lab, color=pm.TEXT, fontsize=9, va="center",
                fontweight="bold" if lab.startswith("Portfolio") else "normal")
        ax.plot([reb.index[-1] + pd.Timedelta(days=12)], [np.exp(y)], marker="s", markersize=0)
    ax.set_yscale("log")
    ax.yaxis.set_minor_formatter(matplotlib.ticker.NullFormatter())
    ax.set_yticks([50, 100, 200, 300, 400])
    ax.set_yticklabels(["50", "100", "200", "300", "400"])
    ax.set_xlim(reb.index[0], reb.index[-1] + pd.Timedelta(days=260))
    ax.set_ylabel("Price in USD, Sep 2021 = 100 (log scale)", color=pm.TEXT2, fontsize=10)
    ax.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=pm.TEXT2)
    fig.suptitle("Five years of the five ETFs: one AI-hardware cycle, down 2022, up 2–3× since", x=0.06, ha="left",
                 fontsize=14, fontweight="bold", color=pm.TEXT)
    fig.text(0.06, 0.015, "Source: Bloomberg PX_LAST in USD, 29 Sep 2021 to 17 Sep 2026 (price only). Portfolio: buy and hold at "
             "3119 HK 25%, 2644 JP 25%, 00878 TT 20%, EWY 15%, EWT 15%.", fontsize=8, color=pm.MUTED)
    fig.tight_layout(rect=(0, 0.04, 1, 0.95))
    fig.savefig(os.path.join(pm.HERE, "mc_factor_prices.png"), facecolor=pm.SURF)
    plt.close(fig)

    # Chart B: portfolio realised vol and average correlation through time
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(13, 4.6), dpi=200)
    fig.patch.set_facecolor(pm.SURF)
    pv = np.log(port).diff().rolling(63).std().dropna() * np.sqrt(252) * 100
    pm.style(a1)
    a1.plot(pv.index, pv, color=SLOTS[0], linewidth=1.8)
    a1.axhline(pv.mean(), color=pm.MUTED, linewidth=1, linestyle=":")
    a1.text(pv.index[5], pv.mean() - 3.2, f"5Y average {pv.mean():.0f}%", color=pm.TEXT2, fontsize=9)
    a1.plot(pv.index[-1], pv.iloc[-1], marker="o", markersize=8, color=SLOTS[0], markeredgecolor=pm.SURF, markeredgewidth=2)
    a1.text(pv.index[-1] + pd.Timedelta(days=25), pv.iloc[-1], f"Now\n{pv.iloc[-1]:.0f}%", color=pm.TEXT, fontsize=9.5, va="center", fontweight="bold")
    a1.set_xlim(pv.index[0], pv.index[-1] + pd.Timedelta(days=150))
    a1.set_ylim(0, None)
    a1.set_title("Portfolio realised volatility (3-month, % a year)", loc="left", fontsize=11.5, color=pm.TEXT, fontweight="bold")
    pm.style(a2)
    rc = pd.Series(roll, index=w5.index[12:])
    a2.plot(rc.index, rc, color=SLOTS[1], linewidth=1.8)
    a2.axhline(out["avg_corr_5y"], color=pm.MUTED, linewidth=1, linestyle=":")
    a2.text(rc.index[3], 0.06, f"Dotted line: 5Y average {out['avg_corr_5y']:.2f}", color=pm.TEXT2, fontsize=9)
    a2.plot(rc.index[-1], rc.iloc[-1], marker="o", markersize=8, color=SLOTS[1], markeredgecolor=pm.SURF, markeredgewidth=2)
    a2.text(rc.index[-1] + pd.Timedelta(days=25), rc.iloc[-1], f"Now\n{rc.iloc[-1]:.2f}", color=pm.TEXT, fontsize=9.5, va="center", fontweight="bold")
    a2.set_xlim(rc.index[0], rc.index[-1] + pd.Timedelta(days=150))
    a2.set_ylim(0, 1)
    a2.set_title("Average correlation between the five ETFs (13-week)", loc="left", fontsize=11.5, color=pm.TEXT, fontweight="bold")
    fig.suptitle("Risk regime at the trade date", x=0.01, ha="left", fontsize=14, fontweight="bold", color=pm.TEXT)
    fig.text(0.01, 0.01, "Source: Bloomberg USD prices; weekly returns for correlation to avoid the Asia/US close mismatch.",
             fontsize=8, color=pm.MUTED)
    fig.tight_layout(rect=(0, 0.04, 1, 0.94))
    fig.savefig(os.path.join(pm.HERE, "mc_factor_regime.png"), facecolor=pm.SURF)
    plt.close(fig)
