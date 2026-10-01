"""Historical back-test of the Asia Digital Bridge Legacy Note on real Bloomberg data.

Export month-end closes from Bloomberg (BDH, PX_LAST, monthly) for
    NKY Index, TWSE Index, KOSPI2 Index, HSTECH Index
into a CSV with columns: Date,NKY,TWSE,KOSPI2,HSTECH   (local-currency price index levels;
the note is quanto, so no FX conversion is needed). Then run:

    python3 backtest_bloomberg.py data/bbg_monthly.csv

It reports
  1. Rolling issuance: a note struck at every month-end with a full history to maturity.
     For tenors longer than the data allows, it falls back to 5Y windows and says so.
  2. Block bootstrap (12-month blocks, preserves cross-index correlation and crisis clustering):
     10,000 synthetic 7Y histories, as in last year's winning deck but without destroying the
     joint structure of the four markets.
HSTECH is back-filled by Hang Seng Indexes only to Dec 2014; for older windows the script
substitutes HSI Index if a column named HSI is present.
"""
import sys
import numpy as np
import pandas as pd

from model import redemption, PARTICIPATION, TENOR, DIV

COLS = ["NKY", "TWSE", "KOSPI2", "HSTECH"]


def load(path):
    df = pd.read_csv(path, parse_dates=["Date"]).set_index("Date").sort_index()
    if "HSI" in df.columns:                          # splice HSI before HSTECH starts
        first = df["HSTECH"].first_valid_index()
        scale = df.loc[first, "HSTECH"] / df.loc[first, "HSI"]
        df.loc[:first, "HSTECH"] = df.loc[:first, "HSI"] * scale
    return df[COLS].dropna()


def rolling(df, tenor):
    m = tenor * 12
    rows = []
    for i in range(len(df) - m):
        win = df.iloc[i:i + m + 1].to_numpy()
        perf = win[12::12] / win[0]                  # annual dates 1..tenor
        r, f, b = redemption(perf[None, ...], PARTICIPATION)
        rows.append({"strike": df.index[i].date(), "basket": b[0, -1], "note": r[0],
                     "direct": b[0, -1] * (1 + DIV.mean()) ** tenor, "floor": f[0]})
    return pd.DataFrame(rows)


def bootstrap(df, n=10_000, block=12, tenor=TENOR, seed=5):
    rets = np.log(df).diff().dropna().to_numpy()
    rng = np.random.default_rng(seed)
    nb = tenor * 12 // block
    starts = rng.integers(0, len(rets) - block, size=(n, nb))
    paths = np.stack([np.concatenate([rets[s:s + block] for s in row]) for row in starts])
    perf = np.exp(np.cumsum(paths, axis=1))[:, 11::12, :]
    r, f, b = redemption(perf, PARTICIPATION)
    return r, b


def summary(name, note, direct):
    print(f"{name}: n={len(note)}  note mean {np.mean(note):.1%}  median {np.median(note):.1%}  "
          f"P(floor only) {np.mean(note < 1.0001):.1%}  | direct mean {np.mean(direct):.1%}  "
          f"p5 {np.percentile(direct, 5):.1%}  P(loss) {np.mean(direct < 1):.1%}")


if __name__ == "__main__":
    df = load(sys.argv[1] if len(sys.argv) > 1 else "data/bbg_monthly.csv")
    tenor = TENOR if len(df) > TENOR * 12 + 24 else 5
    if tenor != TENOR:
        print(f"History too short for {TENOR}Y rolling windows, using {tenor}Y")
    roll = rolling(df, tenor)
    roll.to_csv("rolling_backtest.csv", index=False)
    summary(f"Rolling {tenor}Y issuance", roll["note"], roll["direct"])
    r, b = bootstrap(df)
    summary("Block bootstrap 7Y", r, b[:, -1] * (1 + DIV.mean()) ** TENOR)
