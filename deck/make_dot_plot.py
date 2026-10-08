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
BLUE, TXT, MUTED, GRID, BAND = "#2C5F82", "#262626", "#595959", "#E3E3E3", "#E8EFF5"


def median(col):
    vals = sorted(v for k, n in D[col].items() for v in [float(k)] * n)
    m = len(vals)
    return (vals[(m - 1) // 2] + vals[m // 2]) / 2, m


def draw(fname, figsize, compact=False):
    fig, ax = plt.subplots(figsize=figsize, dpi=220)
    fig.patch.set_facecolor("white")
    ax.axhspan(3.75, 4.00, color=BAND, zorder=0)
    if not compact:
        ax.text(-0.45, 3.735, "Shaded: current target range 3.75–4.00%\n(after the 16 Sep 2026 hike)", fontsize=8.5, color=MUTED, va="top")
    sz, gap = (14, 0.045) if compact else (26, 0.055)
    meds = {}
    for i, c in enumerate(COLS):
        for lvl, n in D[c].items():
            xs = i + (np.arange(n) - (n - 1) / 2) * gap
            ax.scatter(xs, [float(lvl)] * n, s=sz, color=BLUE, zorder=3, linewidths=0)
        m, cnt = median(c)
        meds[c] = (m, cnt)
    ax.axvline(3.5, color=MUTED, linewidth=0.8, linestyle="--")
    ax.set_xticks(range(len(COLS)))
    ax.set_xticklabels([f"{c}\nmedian {meds[c][0]:g}%" for c in COLS], fontsize=11 if compact else 9.5, color=TXT)
    ax.set_xlim(-0.5, 4.5)
    ax.set_ylim(2.75 if compact else 2.5, 4.5 if compact else 4.75)
    ax.set_yticks(np.arange(3.0, 4.51, 0.5) if compact else np.arange(2.5, 4.76, 0.25))
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.1f}%" if compact else f"{v:.2f}%"))
    ax.tick_params(colors=MUTED, labelsize=11 if compact else 9, length=0)
    ax.grid(axis="y", color=GRID, linewidth=0.7)
    for sp in ("top", "right", "left"):
        ax.spines[sp].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.set_axisbelow(True)
    if not compact:
        ax.scatter([], [], s=26, color=BLUE, label="One FOMC participant (midpoint of target range)")
        ax.legend(loc="lower left", frameon=False, fontsize=8.5, labelcolor=MUTED)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, fname), facecolor="white")
    plt.close(fig)
    return meds


if __name__ == "__main__":
    meds = draw("fomc_dot_plot.png", (8.6, 5.4))
    draw("fomc_dot_plot_compact.png", (8.2, 2.9), compact=True)   # panel size on the one-slide thesis
    for c, (m, n) in meds.items():
        print(c, round(m, 3), n, "participants")
