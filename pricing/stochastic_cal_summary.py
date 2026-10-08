"""Economics of the team stochastic fair-yield model: runs stochastic_cal_for_natixis.py and summarises call
probabilities, the fair yield used (13.810246%, lower 95% bound), and the value of offering the family 10%."""
import numpy as np, json, runpy, io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    g = runpy.run_path(__file__.replace("stochastic_cal_summary.py", "stochastic_cal_for_natixis.py"))
a, bA, never, first_call, R5, r, N = g["a"], g["bA"], g["never"], g["first_call"], g["R5"], g["r"], g["N"]
tau = np.where(never, 5, first_call)
yA = (1 - a.mean()) / bA.mean()
out = {"y_point": yA, "y_used": 0.13810246, "client": 0.10,
       "Ea": a.mean(), "EbA": bA.mean(),
       "pv_at_used": a.mean() + 0.13810246 * bA.mean(),
       "pv_at_client": a.mean() + 0.10 * bA.mean(),
       "first_call": [float((first_call == k).mean()) for k in range(1, 6)],
       "never": float(never.mean()), "never_below70": float((never & (g["B"] < 0.70)).mean()),
       "never_above70": float((never & (g["B"] >= 0.70)).mean()),
       "cond_repay": float(R5[never].mean()), "exp_life": float(tau.mean()),
       "D": g["D"].tolist()}
out["natixis_upfront"] = 1 - out["pv_at_client"]
# client IRR per path at 10%
cf_total = np.where(never, R5, 1 + 0.10 * first_call)
irr = np.where(never, R5 ** (1 / 5) - 1, (1 + 0.10 * first_call) ** (1 / np.maximum(first_call, 1)) - 1)
out["client_irr_mean"] = float(irr.mean()); out["client_irr_median"] = float(np.median(irr))
out["p_loss"] = float((cf_total < 1).mean())
print(json.dumps(out, indent=1))
json.dump(out, open(__file__.replace(".py", ".json"), "w"), indent=1)
