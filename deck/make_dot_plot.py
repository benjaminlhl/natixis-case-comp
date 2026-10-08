"""Recreate the FOMC dot plot (SEP, 16 Sep 2026) in the team blue style for the investment-thesis deck.
Dot counts are read from the Fed's Figure 2 and stored in deck/thesis_market_data.json.
Run: python3 deck/make_dot_plot.py  (writes deck/fomc_dot_plot.png and prints the medians)"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "thesis_market_data.json")))["fomc_dots_sep2026"]
COLS = ["2026", "2027", "2028", "2029", "Longer run"]
BLUE, DARK, TXT, MUTED, GRID, BAND = "#2C5F82", "#0B2A3D", "#262626", "#595959", "#E3E3E3", "#E8EFF5"


def median(col):
    vals = sorted(v for k, n in D[col].items() for v in [float(k)] * n)
    m = len(vals)
    return (vals[(m - 1) // 2] + vals[m // 2]) / 2, m


if __name__ == "__main__":
    fig, ax = plt.subplots(figsize=(8.6, 5.4), dpi=220)
    fig.patch.set_facecolor("white")
    ax.axhspan(3.75, 4.00, color=BAND, zorder=0)
    ax.text(-0.45, 3.735, "Shaded: current target range 3.75–4.00%\n(after the 16 Sep 2026 hike)", fontsize=8.5, color=MUTED, va="top")
    meds = {}
    for i, c in enumerate(COLS):
        for lvl, n in D[c].items():
            xs = i + (np.arange(n) - (n - 1) / 2) * 0.055
            ax.scatter(xs, [float(lvl)] * n, s=26, color=BLUE, zorder=3, linewidths=0)
        m, cnt = median(c)
        meds[c] = (m, cnt)
        ax.plot([i - 0.44, i + 0.44], [m, m], color=DARK, linewidth=1.6, zorder=2)
    ax.axvline(3.5, color=MUTED, linewidth=0.8, linestyle="--")
    ax.set_xticks(range(len(COLS)))
    ax.set_xticklabels([f"{c}\nmedian {meds[c][0]:g}%" for c in COLS], fontsize=9.5, color=TXT)
    ax.set_xlim(-0.5, 4.5)
    ax.set_ylim(2.5, 4.75)
    ax.set_yticks(np.arange(2.5, 4.76, 0.25))
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.2f}%"))
    ax.tick_params(colors=MUTED, labelsize=9, length=0)
    ax.grid(axis="y", color=GRID, linewidth=0.7)
    for sp in ("top", "right", "left"):
        ax.spines[sp].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.set_axisbelow(True)
    ax.scatter([], [], s=26, color=BLUE, label="One FOMC participant (midpoint of target range)")
    ax.plot([], [], color=DARK, linewidth=2.2, label="Median")
    ax.legend(loc="lower left", frameon=False, fontsize=8.5, labelcolor=MUTED)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "fomc_dot_plot.png"), facecolor="white")
    for c, (m, n) in meds.items():
        print(c, round(m, 3), n, "participants")
