"""Pricing for the Asia Digital Bridge Note (Scenario 2, NKE Private Wealth).

7Y USD 100% capital-protected note on a volatility-target (VT) index built on an
equal-weighted basket of Asian digital-transformation leaders (USD quanto).

VT index (daily, excess-return over cash, then a fixed decrement):
    w_t      = min(TARGET / max(rv20, rv60), MAX_LEV)       (vols observed with a 1-day lag)
    I_t/I_t-1 = 1 + w_t * (R_basket_TR - r dt) + r dt - DECR dt
Under the pricing measure the index drifts at r - DECR, so a higher decrement lowers
the forward, cheapens the call and raises participation (at the cost of index drag).

The basket follows a two-regime vol model (calm / stress), so the vol-target lag and the
residual "gap risk" are priced rather than assumed away. All market inputs are
PLACEHOLDERS: re-run with Bloomberg data as of 17 Sep 2026. Requires numpy, scipy.

Usage: python pricing/scenario2_vt_note.py            (prints every table)
"""
import json
import numpy as np
from math import exp, log, sqrt
from scipy.stats import norm

# ---------------- inputs (placeholders) ----------------
T, DAYS = 7.0, 252
STEPS = int(T * DAYS)
N = 20_000
FUND = {5: 0.0569, 7: 0.0575, 10: 0.0582}           # Natixis USD funding grid
R_OIS = 0.0375                                       # USD rate for option pricing (assumption)
FEE = 0.02                                           # issuer margin + distribution, upfront
PROT = 1.00
TARGET, MAX_LEV, DECR = 0.10, 1.50, 0.01             # recommended index design (see design table)
VOL_CALM, VOL_STRESS = 0.22, 0.45                    # basket regimes (diversified Asian tech)
P_C2S, P_S2C = 1 / 500, 1 / 60                       # daily regime transition probabilities
QUANTO = -0.002                                      # -rho*vol_S*vol_FX, small for USD quanto
MU_REAL = 0.09                                       # real-world basket total return (base case)
RAW_IV = 0.30                                        # 7Y implied vol a dealer would charge on the raw basket
SEED = 11


def funding(t):
    """Linear interpolation on the funding grid (rules, footnote 1)."""
    ks = sorted(FUND)
    if t <= ks[0]:
        return FUND[ks[0]]
    for a, b in zip(ks, ks[1:]):
        if a <= t <= b:
            return FUND[a] + (FUND[b] - FUND[a]) * (t - a) / (b - a)
    return FUND[ks[-1]]


def zcb(t, shift=0.0):
    return 1 / (1 + funding(t) + shift) ** t


def option_budget(t=T, prot=PROT, fee=FEE):
    return 1 - prot * zcb(t) - fee


def bs_call(F_ratio_drift, vol, t, r):
    """ATM call on an index with drift (r - q) = F_ratio_drift, % of initial."""
    q = r - F_ratio_drift
    d1 = ((r - q) + 0.5 * vol * vol) * t / (vol * sqrt(t)); d2 = d1 - vol * sqrt(t)
    return exp(-q * t) * norm.cdf(d1) - exp(-r * t) * norm.cdf(d2)


def simulate(n=N, t=T, target=TARGET, max_lev=MAX_LEV, decr=DECR, r=R_OIS, mu=None,
             seed=SEED, start_stress=False, record_annual=True):
    """Return dict with basket and VT index paths at annual dates (and finals).
    mu=None -> pricing measure (basket TR drifts at r + quanto); else real-world drift mu."""
    rng = np.random.default_rng(seed)
    steps = int(t * DAYS); dt = 1 / DAYS
    drift = (r + QUANTO) if mu is None else mu
    stress = np.full(n, start_stress)
    lb = np.zeros(n); li = np.zeros(n)                       # log basket (TR), log VT index
    buf = np.zeros((60, n)); k = 0                           # rolling squared returns
    w_hist = []; ann_b = []; ann_i = []; last12_i = []; rv_obs = []
    for s in range(steps):
        sw = rng.random(n)
        stress = np.where(stress, sw > P_S2C, sw < P_C2S)
        vol = np.where(stress, VOL_STRESS, VOL_CALM)
        if s < 60:
            rv = np.full(n, VOL_STRESS if start_stress else VOL_CALM)
        else:
            rv20 = np.sqrt(buf[[(k - j - 1) % 60 for j in range(20)]].mean(0) * DAYS)
            rv60 = np.sqrt(buf.mean(0) * DAYS)
            rv = np.maximum(rv20, rv60)
        w = np.minimum(target / rv, max_lev)
        ret = np.exp((drift - 0.5 * vol ** 2) * dt + vol * sqrt(dt) * rng.standard_normal(n)) - 1
        buf[k % 60] = np.log1p(ret) ** 2; k += 1
        lb += np.log1p(ret)
        li += np.log1p(w * (ret - r * dt) + r * dt - decr * dt)
        if s % 21 == 0:
            w_hist.append(w.mean()); rv_obs.append(vol.mean())
        if record_annual and (s + 1) % DAYS == 0:
            ann_b.append(np.exp(lb)); ann_i.append(np.exp(li))
        if s >= steps - DAYS and (s - (steps - DAYS)) % 21 == 20:
            last12_i.append(np.exp(li))
    return dict(B=np.exp(lb), I=np.exp(li), annB=np.array(ann_b), annI=np.array(ann_i),
                avg12=np.mean(last12_i, 0), w_mean=float(np.mean(w_hist)))


def payoffs(sim, lock=None, averaging=False):
    """Option payoff per 100% participation. lock: list of lock-in levels (e.g. [1.3,1.6,1.9])
    observed annually on the VT index; locked gain is floored for the final payoff."""
    final = sim["avg12"] if averaging else sim["I"]
    perf = np.maximum(final - 1, 0)
    if lock:
        floor = np.zeros_like(final)
        for lvl in lock:
            hit = (sim["annI"][:-1] >= lvl).any(0)
            floor = np.where(hit, np.maximum(floor, lvl - 1), floor)
        perf = np.maximum(perf, floor)
    return perf


def price(sim, r=R_OIS, t=T, **kw):
    return exp(-r * t) * payoffs(sim, **kw).mean()


def note_value(spot=1.0, rate_shift=0.0, t=T, part=None, adj=1.0, r=R_OIS, vol=TARGET,
               decr=DECR):
    """MTM of the note: BS on the VT index (its vol is ~TARGET by construction), scaled by
    adj = MC price / BS price so that the unshocked value matches the Monte Carlo."""
    q = decr
    d1 = (log(spot) + (r + rate_shift - q + 0.5 * vol * vol) * t) / (vol * sqrt(t))
    d2 = d1 - vol * sqrt(t)
    call = spot * exp(-q * t) * norm.cdf(d1) - exp(-(r + rate_shift) * t) * norm.cdf(d2)
    return PROT * zcb(t, rate_shift) + part * adj * call


def outcome_stats(x):
    a = x ** (1 / T) - 1
    return dict(mean=float(x.mean()), p5=float(np.percentile(x, 5)), p50=float(np.median(x)),
                p95=float(np.percentile(x, 95)), cagr50=float(np.median(a)),
                p_loss=float((x < 0.9999).mean()), p_floor=float((x < 1.0001).mean()))


def main():
    out = {}
    budget = option_budget()
    print(f"7Y USD funding {funding(T):.4%} | ZCB {zcb(T):.4f} | fee {FEE:.1%} | option budget {budget:.2%}")
    out["zcb"], out["budget"] = zcb(T), budget

    # 1) Tenor table (BS on VT index, vol = target)
    print(f"\nTenor | ZCB | budget | participation (VT {TARGET:.0%}, decr {DECR:.0%}, BS approx)")
    tenor = []
    for t in [5, 6, 7, 10]:
        b = option_budget(t); c = bs_call(R_OIS - DECR, TARGET, t, R_OIS)
        tenor.append([t, zcb(t), b, b / c]); print(f"{t:>3}Y | {zcb(t):.3f} | {b:.2%} | {b / c:.0%}")
    out["tenor"] = tenor

    # 2) Full Monte Carlo price for the recommended design (captures vol-target lag / gap risk)
    sim = simulate()
    c_mc = price(sim); c_bs = bs_call(R_OIS - DECR, TARGET, T, R_OIS)
    idx_vol = float(np.std(np.diff(np.log(np.vstack([np.ones(N), sim["annI"]])), axis=0)))
    part = budget / c_mc
    print(f"\nMC call on VT index: {c_mc:.4f} (BS@{TARGET:.0%}: {c_bs:.4f}) | mean exposure {sim['w_mean']:.0%}"
          f" | realised annual vol of index {idx_vol:.1%}")
    print(f"Participation: MC {part:.0%}  vs BS {budget / c_bs:.0%}")
    out.update(c_mc=c_mc, c_bs=c_bs, part=part, w_mean=sim["w_mean"], idx_vol=idx_vol)

    # 3) Feature menu (Legacy Lock and averaging, priced on the same paths)
    menu = {"Base: uncapped call": {},
            "+ 12M final averaging": dict(averaging=True),
            "+ Legacy Lock 130/160/190": dict(lock=[1.3, 1.6, 1.9]),
            "+ Lock + averaging": dict(lock=[1.3, 1.6, 1.9], averaging=True)}
    print("\nFeature | option cost | participation")
    out["menu"] = []
    for name, kw in menu.items():
        c = price(sim, **kw); out["menu"].append([name, c, budget / c])
        print(f"{name:<28} {c:.4f}  {budget / c:.0%}")

    # 4) The decrement trap: headline participation vs what the client actually gets
    print("\nIndex design | participation | median multiple / P(only 100 back) at basket return 6% and 9%")
    designs = [(0.12, 0.04, "Max-headline (12% / 4%)"), (0.10, 0.02, "10% / 2%"),
               (TARGET, DECR, "Recommended (10% / 1%)"), (0.10, 0.0, "No decrement (10% / 0%)")]
    out["designs"] = []
    for tv, d, label in designs:
        p_ = budget / price(simulate(n=10_000, target=tv, decr=d))
        row = [label, tv, d, p_]
        for mu in (0.06, 0.09):
            rw = simulate(n=10_000, target=tv, decr=d, mu=mu, seed=5)
            st = outcome_stats(1 + p_ * payoffs(rw)); row += [st["p50"], st["p_floor"]]
        out["designs"].append(row)
        print(f"{label:<26} {p_:5.0%} | mu6%: {row[4]:.2f} / {row[5]:.0%} | mu9%: {row[6]:.2f} / {row[7]:.0%}")
    raw_part = budget / bs_call(R_OIS - 0.015 + QUANTO, RAW_IV, T, R_OIS)
    row = ["Raw basket, no vol target", None, None, raw_part]
    for mu in (0.06, 0.09):
        rw = simulate(n=10_000, mu=mu, seed=5)
        st = outcome_stats(1 + raw_part * np.maximum(rw["B"] - 1, 0)); row += [st["p50"], st["p_floor"]]
    out["designs"].append(row)
    print(f"{row[0]:<26} {raw_part:5.0%} | mu6%: {row[4]:.2f} / {row[5]:.0%} | mu9%: {row[6]:.2f} / {row[7]:.0%}"
          f"   (priced at {RAW_IV:.0%} implied vol)")

    # 5) Real-world outcome distribution (forward simulation, NOT a historical backtest)
    ust = (1 + funding(T) - 0.01) ** T   # 7Y UST proxy ~ funding less ~100bp
    out["realworld"] = {}
    print(f"\nReal-world simulation, multiple of capital at 7Y (7Y UST proxy ~{ust:.2f}x)")
    print(f"{'':<34}{'mean':>6}{'p5':>6}{'med':>6}{'p95':>6}{'CAGR50':>8}{'P(<100)':>8}{'P(=100)':>8}")
    for mu in (0.03, 0.06, 0.09):
        rw = simulate(mu=mu, seed=21)
        res = {"VT note": outcome_stats(1 + part * payoffs(rw)),
               "Protected note on raw basket": outcome_stats(1 + raw_part * np.maximum(rw["B"] - 1, 0)),
               "Direct basket": outcome_stats(rw["B"])}
        res["VT note"]["p_beat_ust"] = float(((1 + part * payoffs(rw)) > ust).mean())
        out["realworld"][f"{mu:.2f}"] = res
        for k_, s_ in res.items():
            print(f"mu {mu:.0%} {k_:<27}{s_['mean']:6.2f}{s_['p5']:6.2f}{s_['p50']:6.2f}{s_['p95']:6.2f}"
                  f"{s_['cagr50']:8.1%}{s_['p_loss']:8.0%}{s_['p_floor']:8.0%}")
    out["raw_part"], out["ust_multiple"] = raw_part, ust

    # 6) Unit 15 risk: Greeks, VaR/ES, stress (spot + vol + rates together)
    adj = c_mc / c_bs
    nv = lambda s=1.0, dr=0.0: note_value(s, dr, part=part, adj=adj)
    v0 = nv()
    dS = (nv(1.01) - nv(0.99)) / 2
    dR = nv(dr=0.0001) - v0
    print(f"\nNote fair value {v0:.4f} (issue 1.00, so {1 - v0:.2%} = issuer fee) | delta per 1% VT idx {dS:.4f}"
          f" | DV01 {dR:.5f}")
    sd = sqrt((dS * TARGET / sqrt(DAYS) * 100) ** 2 + (dR * 6) ** 2) * sqrt(10)
    var99, es99 = 2.326 * sd, sd * norm.pdf(2.326) / 0.01
    print(f"10-day 99% VaR {var99:.2%} | ES {es99:.2%} of notional (delta-normal; idx vol {TARGET:.0%};"
          f" rates 6bp/day)")
    # Stress: VT exposure before the shock ~ TARGET / calm vol, plus 1-2 weeks of lag in a crash
    w0 = TARGET / VOL_CALM
    stress = {
        "Asia tech crash: basket -30% in 1M, vol 22->45%, rates -50bp": (1 - 0.30 * w0 * 0.85, -0.005),
        "Taiwan gap: basket -20% overnight, rates unchanged": (1 - 0.20 * w0, 0.0),
        "Stagflation: basket -15%, rates +100bp": (1 - 0.15 * w0, 0.01),
        "Bull: basket +25%, rates -50bp": (1 + 0.25 * w0, -0.005),
    }
    out["risk"] = dict(v0=v0, delta=dS, dv01=dR, var99=var99, es99=es99, stress=[])
    for name, (s, dr) in stress.items():
        v = nv(s, dr); out["risk"]["stress"].append([name, s, dr, v])
        print(f"{name}: VT idx {s - 1:+.1%} -> note MTM {v:.3f} ({v - v0:+.3f})")
    nw, notional = 2_000e6, 100e6
    worst = min(x[3] for x in out["risk"]["stress"])
    out["risk"]["sizing"] = dict(nw=nw, notional=notional, worst_mtm=worst)
    print(f"Sizing: USD {notional / 1e6:.0f}Mn = {notional / nw:.1%} of net worth; contractual max loss = issuer"
          f" default only; worst stress MTM loss {(v0 - worst):.1%} = USD {(v0 - worst) * notional / 1e6:.1f}Mn ="
          f" {(v0 - worst) * notional / nw:.2%} of net worth")

    with open("pricing/scenario2_results.json", "w") as f:
        json.dump(out, f, indent=1, default=float)


if __name__ == "__main__":
    main()
