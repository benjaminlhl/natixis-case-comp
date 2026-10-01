"""Scenario 2: levers to reduce the probability of capital loss, and their coupon cost.
For each design: fair snowball coupon at 98% issue price, risk-neutral P(loss), avg loss given loss,
expected loss, and P(loss) under a 4% p.a. real-world equity drift.
Run: python3 pricing/scenario2_risk_levers.py  (writes pricing/scenario2_levers.json)
"""
import json
import numpy as np
import scenario2_autocall_mc as m


def payoff(B, c, barrier=0.65, floor=0.0, stepdown=0.0, first=4):
    cq = m.call_quarter(B, first=first, stepdown=stepdown)
    f = B[:, -1]
    below = np.maximum(f, floor)
    pay = np.where(cq > 0, 1 + c * cq / m.FREQ, np.where(f >= barrier, 1.0, below))
    lq = np.where(cq > 0, cq, m.N_OBS)
    return pay * m.DFS[lq - 1], cq, pay


def solve(B, **kw):
    lo, hi = 0.0, 0.5
    for _ in range(45):
        c = 0.5 * (lo + hi)
        lo, hi = (c, hi) if payoff(B, c, **kw)[0].mean() < m.ISSUE_PRICE else (lo, c)
    return c


def row(B, Brw, **kw):
    c = solve(B, **kw)
    _, _, pay = payoff(B, c, **kw)
    _, _, pay_rw = payoff(Brw, c, **kw)
    loss = pay < 1
    return {"fair_coupon": round(c, 4), "p_loss": round(float(loss.mean()), 4),
            "avg_loss": round(float(1 - pay[loss].mean()), 4) if loss.any() else 0.0,
            "exp_loss": round(float((1 - pay)[loss].sum() / len(pay)), 4),
            "max_loss": round(float(1 - pay.min()), 2),
            "p_loss_rw4": round(float((pay_rw < 1).mean()), 4)}


if __name__ == "__main__":
    W0 = m.W.copy()
    B = m.simulate()
    Brw = m.simulate(real_world=True, eq_drift=0.04, n=100_000)
    res = {}
    designs = {
        "Base: 65% European barrier": {},
        "Barrier 60%": {"barrier": 0.60},
        "Barrier 55%": {"barrier": 0.55},
        "Barrier 50%": {"barrier": 0.50},
        "Step-down autocall (100% -> 80% by Y5)": {"stepdown": 0.05},
        "Barrier 55% + step-down": {"barrier": 0.55, "stepdown": 0.05},
        "90% capital floor (max loss 10%)": {"floor": 0.90},
        "95% capital floor (max loss 5%)": {"floor": 0.95},
        "100% capital protected snowball": {"floor": 1.0},
    }
    for k, kw in designs.items():
        res[k] = row(B, Brw, **kw)
    # Lower-vol basket: cut HSTECH, add utilities
    m.W[:] = [0.20, 0.30, 0.25, 0.25]
    B2 = m.simulate(); B2rw = m.simulate(real_world=True, eq_drift=0.04, n=100_000)
    res["Lower-vol basket (HSTECH 20%, Utilities 25%)"] = row(B2, B2rw)
    res["Lower-vol basket + barrier 55%"] = row(B2, B2rw, barrier=0.55)
    res["Lower-vol basket + 90% floor"] = row(B2, B2rw, floor=0.90)
    m.W[:] = W0
    for k, v in res.items():
        print(f"{k:48s} cpn {v['fair_coupon']:.2%}  P(loss) {v['p_loss']:.2%}  avg {v['avg_loss']:.0%}  "
              f"E[loss] {v['exp_loss']:.2%}  max {v['max_loss']:.0%}  P(loss|4%rw) {v['p_loss_rw4']:.2%}")
    json.dump(res, open(__file__.replace("scenario2_risk_levers.py", "scenario2_levers.json"), "w"), indent=1)
