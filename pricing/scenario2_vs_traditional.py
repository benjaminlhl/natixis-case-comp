"""Scenario 2: the recommended protected autocallable vs traditional alternatives.

Compares, on the same simulated basket paths (real-world equity total-return drifts):
  - Our note: capital-protected autocallable with memory coupon (pricing/scenario2_autocall_mc.py)
  - Direct basket: buy and hold the basket for 5 years (total return, dividends reinvested)
  - 5Y USD bond at the case funding rate (5.69%)
  - Principal-protected note (PPN): 100% + participation x basket price gain at Y5
Reports mean IRR, downside statistics, and the winner by market regime.
Run: python3 pricing/scenario2_vs_traditional.py  (writes pricing/scenario2_vs_traditional.json)
"""
import json
import numpy as np
import scenario2_autocall_mc as m

BOND = m.fund(5)
N = 100_000


def compare(drift):
    B = m.simulate(real_world=True, eq_drift=drift, n=N)
    cf, cq = m.protected_cf(B)
    note = m.irr(cf)
    div = float(m.W @ m.DIV)
    basket_tr = B[:, -1] * np.exp(div * 5)                 # price path + reinvested dividends
    basket = basket_tr ** (1 / 5) - 1
    res = json.load(open(__file__.replace("scenario2_vs_traditional.py", "scenario2_results.json")))
    part = res["ppn"]["participation"]
    ppn = (1 + part * np.maximum(B[:, -1] - 1, 0)) ** (1 / 5) - 1
    bond = np.full(N, BOND)
    out = {}
    for name, x in [("Protected autocall (ours)", note), ("Direct basket", basket), ("5Y USD bond", bond), ("Principal-protected note", ppn)]:
        out[name] = {"mean_irr": round(float(x.mean()), 4), "median_irr": round(float(np.median(x)), 4),
                     "p_loss": round(float((x < -1e-9).mean()), 4), "worst_5pct_irr": round(float(np.percentile(x, 5)), 4),
                     "irr_stdev": round(float(x.std()), 4),
                     "ret_per_risk": round(float((x.mean() - BOND) / x.std()), 2) if x.std() > 1e-9 else None}
    # Market regimes by the basket's own annualised total return
    regimes = {"Bear (< 0% p.a.)": basket < 0, "Flat (0-4%)": (basket >= 0) & (basket < 0.04),
               "Moderate (4-10%)": (basket >= 0.04) & (basket < 0.10), "Bull (> 10%)": basket >= 0.10}
    reg = {}
    for rname, mask in regimes.items():
        row = {"share_of_paths": round(float(mask.mean()), 3)}
        for name, x in [("Protected autocall (ours)", note), ("Direct basket", basket), ("5Y USD bond", bond), ("Principal-protected note", ppn)]:
            row[name] = round(float(x[mask].mean()), 4)
        reg[rname] = row
    return {"strategies": out, "regimes": reg}


if __name__ == "__main__":
    res = {f"{int(d*100)}% equity p.a.": compare(d) for d in (0.0, 0.04, 0.08)}
    for k, v in res.items():
        print("==", k)
        for s, x in v["strategies"].items():
            print(f"  {s:28s} mean {x['mean_irr']:6.2%} median {x['median_irr']:6.2%} P(loss) {x['p_loss']:6.1%} worst5% {x['worst_5pct_irr']:7.2%} stdev {x['irr_stdev']:6.2%}")
        for r, x in v["regimes"].items():
            print(f"  {r:18s} ({x['share_of_paths']:.0%} of paths): " + " | ".join(f"{s.split(' (')[0]} {x[s]:.1%}" for s in x if s != "share_of_paths"))
    json.dump(res, open(__file__.replace(".py", ".json"), "w"), indent=1)
