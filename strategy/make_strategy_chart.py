"""Redraw the team app's Monte Carlo result (annual checkpoints) for the strategy slides, with every year,
including Year 5, labelled on the time axis.
Run: python3 strategy/make_strategy_chart.py  (reads strategy/app_simulation_results.json, writes strategy/mc_checkpoints.png)"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "app_simulation_results.json")))
C, S0, TGT = R["checkpoints"], R["start_value"], R["target"]
GREEN, BLUE, RED, ORANGE, TXT, MUTED, GRID = "#2E9E44", "#2C5F82", "#C0392B", "#E67E22", "#262626", "#595959", "#E3E3E3"

x = list(range(6))
series = {k: [S0] + C[k] for k in ("p95", "median", "p5")}
fig, ax = plt.subplots(figsize=(8.6, 4.9), dpi=220)
ax.fill_between(x, series["p5"], series["p95"], color=BLUE, alpha=0.07, linewidth=0, label="5th–95th percentile range")
ax.plot(x, series["p95"], color=GREEN, linewidth=2.2, linestyle=(0, (5, 3)), marker="o", markersize=4, label="Bullish (95th percentile)")
ax.plot(x, series["median"], color=BLUE, linewidth=2.8, marker="o", markersize=5, label="Median (50th percentile)")
ax.plot(x, series["p5"], color=RED, linewidth=2.2, linestyle=(0, (5, 3)), marker="o", markersize=4, label="Bearish (5th percentile)")
ax.plot([0, 5], [TGT, TGT], color=ORANGE, linewidth=2, linestyle=(0, (1, 1.5)), label="Target USD 70,000 (1st percentile)")
for k, c in (("p95", GREEN), ("median", BLUE), ("p5", RED)):
    v = series[k][-1]
    ax.annotate(f"${v / 1000:,.1f}k", (5, v), xytext=(8, 0), textcoords="offset points", va="center", fontsize=10, fontweight="bold", color=c)
ax.annotate("$70.0k", (5, TGT), xytext=(8, -9), textcoords="offset points", va="center", fontsize=9, color=ORANGE)
ax.set_xticks(x)
ax.set_xticklabels(["Start"] + C["labels"], fontsize=10, color=TXT)
ax.set_xlim(-0.15, 5.6)
ax.set_ylim(0, 850000)
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: "$0" if v == 0 else f"${v / 1e6:.1f}M" if v >= 1e6 else f"${v / 1000:.0f}k"))
ax.set_ylabel("Portfolio value (USD, per 100,000 invested)", color=MUTED, fontsize=9.5)
ax.tick_params(colors=MUTED, length=0)
ax.grid(axis="y", color=GRID, linewidth=0.7)
for sp in ("top", "right", "left"):
    ax.spines[sp].set_visible(False)
ax.spines["bottom"].set_color(GRID)
ax.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=TXT)
fig.tight_layout()
fig.savefig(os.path.join(HERE, "mc_checkpoints.png"), facecolor="white")
