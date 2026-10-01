"""Historical backtest for the Asia Digital Bridge Note (Scenario 2).

Input: data/scenario2_prices.csv exported from Bloomberg (daily, total-return or price in
local currency), first column 'date', one column per ticker, e.g.
    date,2330 TT,005930 KS,000660 KS,2454 TT,8035 JT,6857 JT,6758 JT,6501 JT,9984 JT,6861 JT,700 HK,9988 HK,1810 HK
Bloomberg: BDH(tickers, "TOT_RETURN_INDEX_GROSS_DVDS", "1/1/2005", "9/17/2026", "Days=W")  (weekdays)
Names with short histories (e.g. 9988 HK, 1810 HK) simply join the basket when they list.
Optional column 'USD_RATE' (annualised, e.g. US0003M / SOFR) for the cash leg; else 3.75% flat.

What it does (same index rules as scenario2_vt_note.py):
  1. builds the equal-weight basket (rebalanced daily, quanto, so local returns are used);
  2. builds the 10% vol-target index (max(rv20, rv60), 1-day lag, 150% cap, 1% p.a. decrement);
  3. runs every rolling 7Y window (monthly start dates) and pays 100% + participation x max(0, perf);
  4. reports the payoff distribution and named stress windows.

Usage: python pricing/scenario2_backtest.py [path/to/prices.csv] [participation]
"""
import sys
import numpy as np
import pandas as pd

TARGET, MAX_LEV, DECR, YEARS = 0.10, 1.50, 0.01, 7
PART_DEFAULT = 1.64   # from scenario2_vt_note.py; pass the re-priced number on the command line
STRESS = {"GFC": ("2007-10-01", "2009-03-31"), "China devaluation": ("2015-06-01", "2016-02-29"),
          "Trade war": ("2018-01-26", "2018-12-31"), "COVID": ("2020-01-17", "2020-03-23"),
          "Tech/rates 2022": ("2021-02-17", "2022-10-31")}


def build(prices: pd.DataFrame):
    px = prices.drop(columns=[c for c in ["USD_RATE"] if c in prices]).ffill()
    rets = px.pct_change().where(px.notna() & px.shift().notna())
    basket = rets.mean(axis=1, skipna=True).fillna(0.0)           # equal weight of live names
    r = (prices["USD_RATE"].ffill() / 100 if "USD_RATE" in prices else pd.Series(0.0375, prices.index))
    dt = 1 / 252
    rv20 = basket.rolling(20).std() * np.sqrt(252)
    rv60 = basket.rolling(60).std() * np.sqrt(252)
    w = (TARGET / np.maximum(rv20, rv60)).clip(upper=MAX_LEV).shift(1).fillna(TARGET / 0.22)
    vt = w * (basket - r * dt) + r * dt - DECR * dt
    return (1 + basket).cumprod(), (1 + vt).cumprod(), w


def rolling_windows(level: pd.Series, part: float):
    starts = level.resample("MS").first().index
    rows = []
    for s in starts:
        e = s + pd.DateOffset(years=YEARS)
        if e > level.index[-1]:
            break
        a = level.loc[s:].iloc[0]; b = level.loc[:e].iloc[-1]
        rows.append((s, b / a - 1))
    df = pd.DataFrame(rows, columns=["start", "perf"]).set_index("start")
    df["note"] = 1 + part * df["perf"].clip(lower=0)
    return df


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/scenario2_prices.csv"
    part = float(sys.argv[2]) if len(sys.argv) > 2 else PART_DEFAULT
    try:
        prices = pd.read_csv(path, parse_dates=["date"], index_col="date").sort_index()
    except FileNotFoundError:
        sys.exit(f"{path} not found. Export the basket from Bloomberg (see the docstring) and re-run.")
    basket, vt, w = build(prices)
    print(f"Data {prices.index[0].date()} -> {prices.index[-1].date()}, {prices.shape[1]} columns")
    ann = lambda x: x.pct_change().std() * np.sqrt(252)
    print(f"Basket vol {ann(basket):.1%} | VT index vol {ann(vt):.1%} | mean exposure {w.mean():.0%}")
    for name, lvl in [("Basket", basket), ("VT index", vt)]:
        dd = (lvl / lvl.cummax() - 1).min()
        print(f"{name:<9} CAGR {(lvl.iloc[-1]) ** (252 / len(lvl)) - 1:6.1%} | max drawdown {dd:6.1%}")

    win = rolling_windows(vt, part)
    raw = rolling_windows(basket, 1.0)
    if win.empty:
        sys.exit("History shorter than 7Y: no complete windows.")
    print(f"\nRolling {YEARS}Y windows: {len(win)} (monthly starts {win.index[0].date()} -> {win.index[-1].date()})")
    for label, x in [("VT note", win["note"]), ("Direct basket", 1 + raw["perf"])]:
        print(f"{label:<14} min {x.min():.2f} p10 {x.quantile(.1):.2f} median {x.median():.2f}"
              f" p90 {x.quantile(.9):.2f} max {x.max():.2f} | P(below 100) {(x < 0.9999).mean():.0%}"
              f" | P(100 or less) {(x < 1.0001).mean():.0%}")
    print("\nStress windows: return of basket vs VT index")
    for k, (a, b) in STRESS.items():
        if pd.Timestamp(a) < basket.index[0]:
            continue
        sl = slice(a, b)
        print(f"{k:<18} basket {basket[sl].iloc[-1] / basket[sl].iloc[0] - 1:+7.1%}"
              f" | VT {vt[sl].iloc[-1] / vt[sl].iloc[0] - 1:+7.1%} | avg exposure {w[sl].mean():.0%}")
    out = pd.DataFrame({"basket": basket, "vt_index": vt, "exposure": w})
    out.to_csv("pricing/scenario2_backtest_levels.csv")
    win.join(raw["perf"].rename("basket_perf")).to_csv("pricing/scenario2_backtest_windows.csv")
    print("\nSaved pricing/scenario2_backtest_levels.csv and pricing/scenario2_backtest_windows.csv")


if __name__ == "__main__":
    main()
