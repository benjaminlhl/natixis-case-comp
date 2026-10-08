"""Scenario 2: quantitative support for the investment thesis.

1. Rate sensitivity: value change of our note vs a 5Y bullet bond for a parallel shift of the USD
   funding curve (applied to both discounting and the risk-neutral equity drift), and the fair coupon
   a new note would pay after the shift.
2. Volatility: fair coupon as basket vols rise (2026 Asian implied vols are at records).
3. Break-even: real-world equity return at which the note's mean IRR matches the 5Y bond.
Run: python3 pricing/scenario2_thesis_numbers.py  (writes pricing/scenario2_thesis_numbers.json)
"""
import json
import numpy as np
import scenario2_autocall_mc as m

N = 150_000
GRID0 = m.GRID_R.copy()


def set_shift(bp):
    m.GRID_R[:] = GRID0 + bp / 10_000
    m.DFS[:] = [m.df(t) for t in m.TIMES]
    m.CUM_DF[:] = np.concatenate([[0], np.cumsum(m.DFS)])


def bond_pv(bp):
    r5 = m.fund(5)
    set_shift(bp)
    pv = sum(r5 * m.DFS[q - 1] for q in range(4, 21, 4)) + m.DFS[-1]
    set_shift(0)
    return pv


if __name__ == "__main__":
    out = {}
    # 1. Rates
    base_B = m.simulate(n=N)
    base_pv = m.protected(base_B)[0].mean()
    rates = {}
    for bp in (-100, -50, 50, 100):
        set_shift(bp)
        B = m.simulate(n=N)                 # drift follows the shifted curve
        pv = m.protected(B)[0].mean()       # existing note, coupon unchanged
        fair = m.solve(m.protected, B)      # what a new note would pay
        set_shift(0)
        rates[f"{bp:+d}bp"] = {"note_value_change": round(float(pv - base_pv), 4),
                               "bond_value_change": round(float(bond_pv(bp) - 1.0), 4),
                               "new_note_fair_coupon": fair}
    rates["base"] = {"note_value": round(float(base_pv), 4), "fair_coupon": m.solve(m.protected, base_B)}
    out["rates"] = rates
    # 2. Volatility
    out["vol"] = {f"+{v}pts": m.solve(m.protected, m.simulate(vol=m.VOL + v / 100, n=N)) for v in (0, 3, 5, 10)}
    # 3. Break-even equity return vs bond
    be = {}
    for d in (0.0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12):
        cf, cq = m.protected_cf(m.simulate(real_world=True, eq_drift=d, n=60_000))
        r = m.irr(cf)
        be[f"{int(d*100)}%"] = {"mean_irr": round(float(r.mean()), 4), "p_beats_bond": round(float((r > m.fund(5)).mean()), 4),
                                "p_called": round(float((cq > 0).mean()), 4)}
    out["breakeven"] = be
    print(json.dumps(out, indent=1))
    json.dump(out, open(__file__.replace(".py", ".json"), "w"), indent=1)
