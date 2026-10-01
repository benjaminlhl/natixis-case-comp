"""Scenario 2 barbell: USD 60Mn Asia Digital Bridge growth note + USD 40Mn AI Hardware Phoenix (10% coupon).

Phoenix (5Y USD autocallable, issued by Natixis):
  - underlying: equal-weight basket of TSMC (2330 TT), SK Hynix (000660 KS), Tokyo Electron (8035 JT), USD quanto
  - coupon: 10% p.a. paid quarterly if the basket is >= 60% of initial, with memory
  - autocall: quarterly from Q1 if the basket is >= the trigger (100%, stepping down 5% a year)
  - protection: European barrier at 50% (checked at maturity only); below it, redemption = basket performance
  Design chosen by grid search (scratch): worst-of structures needed 30-45% barriers and still carried
  9-41% loss probabilities at 10%, versus 8.8% here at a ~2% Natixis margin.

Market model (one factor, two regimes, shared by pricing and simulation):
  stock return = market factor (vol 26% calm / 48% stress) + idiosyncratic (28%)
  -> single names ~38% / ~55% vol, 13-name basket ~27% / ~49% (consistent with scenario2_vt_note.py)
Pricing: drift = USD OIS 3.75% less 1.5% dividends; cash flows discounted on the Natixis USD funding grid.
Portfolio simulation: real-world drift MU; Phoenix cash (coupons, early redemption) reinvested at cash until 7Y.
All market inputs are PLACEHOLDERS: refresh on Bloomberg as of 17 Sep 2026.
Usage: python pricing/scenario2_barbell.py   (needs pricing/scenario2_results.json from scenario2_vt_note.py)
"""
import json
import numpy as np

DAYS = 252
R_OIS, DIV, QUANTO = 0.0375, 0.015, -0.002
FUND5 = 0.0569
FUND_GRID = {1: 0.0478, 2: 0.0530, 3: 0.0552, 5: 0.0569, 7: 0.0575}
MKT_CALM, MKT_STRESS, IDIO = 0.26, 0.48, 0.28
P_C2S, P_S2C = 1 / 500, 1 / 60
N_NAMES = 13                       # names 0-2 are TSMC, SK Hynix, Tokyo Electron
TARGET, MAX_LEV, DECR = 0.10, 1.50, 0.01
ALLOC_GROWTH, ALLOC_PHX = 0.60, 0.40
PHX = dict(T=5, cpn=0.10, cpn_bar=0.60, ac=1.00, ac_step=0.05, nc_q=1, ki=0.50, k=3, agg="mean")
MARGIN_TARGET = 0.02


def paths(n, years, k, mu=None, seed=1, spot=1.0, vol_mult=1.0, daily_cb=None):
    """Simulate k names daily. Calls daily_cb(day, S) and returns final S. mu=None -> pricing drift."""
    rng = np.random.default_rng(seed)
    drift = (R_OIS - DIV + QUANTO) if mu is None else mu - DIV
    stress = np.zeros(n, bool)
    logS = np.full((n, k), np.log(spot))
    dt = 1 / DAYS
    for d in range(int(years * DAYS)):
        u = rng.random(n)
        stress = np.where(stress, u > P_S2C, u < P_C2S)
        mv = np.where(stress, MKT_STRESS, MKT_CALM)[:, None] * vol_mult
        iv = IDIO * vol_mult
        zm = rng.standard_normal((n, 1)); zi = rng.standard_normal((n, k))
        tot_var = mv ** 2 + iv ** 2
        logS += (drift - 0.5 * tot_var) * dt + np.sqrt(dt) * (mv * zm + iv * zi)
        if daily_cb:
            daily_cb(d, np.exp(logS))
    return np.exp(logS)


def phoenix_cashflows(qlev, p=PHX):
    """qlev: (nq, n, 3) quarterly levels. Returns per-path list of (time, cash) as arrays + stats."""
    nq, n, _ = qlev.shape
    agg = (lambda x: x.mean(-1)) if p.get("agg") == "mean" else (lambda x: x.min(-1))
    worst = agg(qlev)
    alive = np.ones(n, bool); missed = np.zeros(n)
    cash = np.zeros((nq, n)); called_q = np.full(n, -1)
    for q in range(nq):
        w = worst[q]
        pay = alive & (w >= p["cpn_bar"])
        c = np.where(pay, p["cpn"] / 4 * (1 + missed), 0.0)
        missed = np.where(alive & ~pay, missed + 1, np.where(pay, 0, missed))
        cash[q] += c
        if q < nq - 1 and q >= p["nc_q"] - 1:
            trig = p["ac"] - p.get("ac_step", 0.0) * (q // 4)
            call = alive & (agg(qlev[q]) >= trig)
            cash[q] += np.where(call, 1.0, 0.0); called_q[call] = q; alive &= ~call
    wT = worst[-1]
    red = np.where(wT < p["ki"], wT, 1.0)
    cash[-1] += np.where(alive, red, 0.0)
    loss = alive & (wT < p["ki"])
    return cash, called_q, loss, wT


def phoenix_value(cash, rate=FUND5):
    t = (np.arange(cash.shape[0]) + 1) / 4
    return (cash * (1 / (1 + rate) ** t)[:, None]).sum(0).mean()


def price_phoenix(n=40_000, seed=3, p=PHX, spot=1.0, vol_mult=1.0, rate_shift=0.0):
    q = []
    k = p.get("k", 3)
    def cb(d, S):
        if (d + 1) % 63 == 0:
            q.append(S[:, :k] / 1.0)
    paths(n, p["T"], k, seed=seed, spot=spot, vol_mult=vol_mult, daily_cb=cb)
    qlev = np.array(q)
    cash, called_q, loss, wT = phoenix_cashflows(qlev, p)
    v = phoenix_value(cash, FUND_GRID[p["T"]] + rate_shift)
    return v, cash, called_q, loss, wT


def main():
    G = json.load(open("pricing/scenario2_results.json"))
    part = [m for m in G["menu"] if m[0].startswith("+ Lock + averaging")][0][2]
    out = {"growth_part": part, "alloc": [ALLOC_GROWTH, ALLOC_PHX], "terms": PHX}

    # ---- 1) Phoenix pricing at the proposed terms
    v, cash, called_q, loss, wT = price_phoenix()
    nq = cash.shape[0]
    life = np.where(called_q >= 0, (called_q + 1) / 4, PHX["T"]).mean()
    cpn_paid = (cash.sum(0) - np.where(called_q >= 0, 1.0, 0) - np.where(called_q < 0, np.where(loss, wT, 1.0), 0)).mean()
    call_by_year = [float(((called_q >= 0) & (called_q < 4 * y)).mean()) for y in range(1, 6)]
    exp_loss = float(np.where(loss, 1 - wT, 0).mean())
    print(f"Phoenix fair value {v:.4f} -> Natixis margin {1 - v:+.2%} | expected life {life:.2f}y | "
          f"expected coupons {cpn_paid:.1%} of notional | P(capital loss) {loss.mean():.1%} | expected loss {exp_loss:.1%}")
    print("P(called by year 1..5): " + ", ".join(f"{x:.0%}" for x in call_by_year))
    # value decomposition (pricing measure, discounted at funding)
    t = (np.arange(nq) + 1) / 4; df = (1 / (1 + FUND5) ** t)[:, None]
    princ = np.zeros_like(cash)
    for q in range(nq):
        princ[q] = np.where(called_q == q, 1.0, 0.0)
    princ[-1] += np.where(called_q < 0, 1.0, 0.0)
    pv_cpn = float(((cash - princ) * df).sum(0).mean() + (np.where(loss, 1 - wT, 0) * df[-1]).mean())
    pv_princ = float((princ * df).sum(0).mean())
    pv_put = float((np.where(loss, 1 - wT, 0) * df[-1]).mean())
    print(f"Decomposition: PV coupons {pv_cpn:.2%} + PV principal at par {pv_princ:.2%} - PV short put (barrier loss)"
          f" {pv_put:.2%} = {pv_cpn + pv_princ - pv_put:.2%}")
    out["phoenix"] = dict(value=v, margin=1 - v, life=float(life), exp_coupons=float(cpn_paid), p_loss=float(loss.mean()),
                          exp_loss=exp_loss, call_by_year=call_by_year, pv_cpn=pv_cpn, pv_princ=pv_princ, pv_put=pv_put)

    # ---- 2) Coupon / barrier menu at a 2% margin
    print("\nKI barrier menu (10% coupon, 60% coupon barrier): margin / P(loss)")
    menu = []
    for ki in (0.40, 0.50, 0.60, 0.70):
        vv, _, _, ll, ww = price_phoenix(n=20_000, p=dict(PHX, ki=ki))
        menu.append([ki, 1 - vv, float(ll.mean()), float(np.where(ll, 1 - ww, 0).mean())])
        print(f"  KI {ki:.0%}: margin {1 - vv:+.2%} | P(loss) {ll.mean():.1%} | expected loss {np.where(ll, 1 - ww, 0).mean():.1%}")
    out["ki_menu"] = menu

    # ---- 3) Stress MTM of the Phoenix (spot and vol shocked together, rates)
    stress = {"AI hardware crash: stocks -30%, vol x1.5": dict(spot=0.70, vol_mult=1.5),
              "Taiwan gap: stocks -20%, vol x1.3": dict(spot=0.80, vol_mult=1.3),
              "Rates +100bp": dict(rate_shift=0.01),
              "Rally: stocks +20%": dict(spot=1.20)}
    out["phx_stress"] = []
    for name, kw in stress.items():
        vs = price_phoenix(n=20_000, **kw)[0]
        out["phx_stress"].append([name, vs]); print(f"  {name}: Phoenix MTM {vs:.3f} ({vs - v:+.3f})")

    # ---- 4) Real-world portfolio simulation, 7Y, both sleeves on the same paths
    print("\nReal-world 7Y simulation (multiple of capital); Phoenix cash reinvested at cash")
    out["portfolio"] = {}
    for mu in (0.03, 0.06, 0.09):
        n = 12_000; T = 7
        st = dict(li=np.zeros(n), buf=np.zeros((60, n)), k=0, prevB=np.ones(n), q=[], ann=[], last12=[])
        def cb(d, S, st=st):
            B = S.mean(1)                              # equal-weight (daily rebalanced) basket proxy
            ret = B / st["prevB"] - 1; st["prevB"] = B
            if d >= 60:
                b = st["buf"]; rv = np.maximum(np.sqrt(b[[(st["k"] - j - 1) % 60 for j in range(20)]].mean(0) * DAYS),
                                               np.sqrt(b.mean(0) * DAYS))
            else:
                rv = np.full(n, 0.27)
            w = np.minimum(TARGET / rv, MAX_LEV)
            st["buf"][st["k"] % 60] = np.log1p(ret) ** 2; st["k"] += 1
            st["li"] += np.log1p(w * (ret - R_OIS / DAYS) + R_OIS / DAYS - DECR / DAYS)
            if (d + 1) % 63 == 0 and d < 5 * DAYS:
                st["q"].append(S[:, :3].copy())
            if (d + 1) % DAYS == 0:
                st["ann"].append(np.exp(st["li"]))
            if d >= T * DAYS - DAYS and (d - (T * DAYS - DAYS)) % 21 == 20:
                st["last12"].append(np.exp(st["li"]))
        S = paths(n, T, N_NAMES, mu=mu, seed=40 + int(mu * 100), daily_cb=cb)
        I_avg = np.mean(st["last12"], 0); ann = np.array(st["ann"])
        perf = np.maximum(I_avg - 1, 0)
        for lvl in (1.3, 1.6, 1.9):
            perf = np.where((ann[:-1] >= lvl).any(0), np.maximum(perf, lvl - 1), perf)
        growth = 1 + part * perf
        cash, called_q, loss, wT = phoenix_cashflows(np.array(st["q"]), PHX)
        tq = (np.arange(cash.shape[0]) + 1) / 4
        phx = (cash * ((1 + R_OIS) ** (T - tq))[:, None]).sum(0)     # value at year 7
        direct = S.mean(1)
        port = ALLOC_GROWTH * growth + ALLOC_PHX * phx
        def s(x):
            return dict(p5=float(np.percentile(x, 5)), p50=float(np.median(x)), mean=float(x.mean()),
                        p95=float(np.percentile(x, 95)), p_below=float((x < 0.9999).mean()))
        res = {"Barbell 60/40": s(port), "Growth note only": s(growth), "Phoenix only (cash to 7Y)": s(phx),
               "Direct basket": s(direct)}
        out["portfolio"][f"{mu:.2f}"] = res
        edges = np.round(np.arange(0.0, 3.01, 0.1), 2)       # 7Y multiple bins for the deck histogram
        out.setdefault("hist", {})[f"{mu:.2f}"] = dict(
            edges=edges.tolist(),
            barbell=(np.histogram(np.clip(port, 0, 2.999), edges)[0] / n).tolist(),
            direct=(np.histogram(np.clip(direct, 0, 2.999), edges)[0] / n).tolist())
        print(f" basket return {mu:.0%}:")
        for k_, v_ in res.items():
            print(f"   {k_:<27} p5 {v_['p5']:.2f} median {v_['p50']:.2f} mean {v_['mean']:.2f} p95 {v_['p95']:.2f}"
                  f" P(<100) {v_['p_below']:.0%}")
    ust = (1 + 0.0575 - 0.01) ** 7
    out["ust_multiple"] = ust
    out["max_loss_contractual"] = ALLOC_PHX      # Phoenix can lose 100% if a stock goes to zero; growth floor intact
    print(f"\nContractual worst case: growth sleeve floor {ALLOC_GROWTH:.0%} + Phoenix basket to 0 -> {ALLOC_GROWTH:.0%} of"
          f" capital (plus coupons received). 7Y UST proxy {ust:.2f}x")
    json.dump(out, open("pricing/scenario2_barbell_results.json", "w"), indent=1, default=float)


if __name__ == "__main__":
    main()
