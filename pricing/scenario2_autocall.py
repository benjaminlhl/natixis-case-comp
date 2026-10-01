"""Scenario 2 alternative: can a 10% p.a. fixed-coupon autocallable work in USD on Asian AI hardware?
Monte Carlo (GBM, quarterly observations, 5Y). Cash flows discounted at the Natixis USD funding grid,
equity drift at USD OIS 3.75%, dividends 1.5%. Single-name vols 40-48%, correlation 0.55-0.6, index vols
20-33%: all PLACEHOLDERS to refresh on Bloomberg. "margin" = 100 - fair value = what Natixis keeps.
Usage: python pricing/scenario2_autocall.py
"""
import numpy as np
from math import exp
rng=np.random.default_rng(7)
R_OIS, FUND, Q = 0.0375, None, 0.015
fund={3:0.0552,5:0.0569}
def sim(n, T, vols, rho, steps_per_q=21):
    k=len(vols); C=np.full((k,k),rho); np.fill_diagonal(C,1); L=np.linalg.cholesky(C)
    nq=int(T*4); dt=1/252; vols=np.array(vols)
    logS=np.zeros((n,k)); minS=np.ones(n)*1e9; qlev=[]
    for q in range(nq):
        for _ in range(steps_per_q):
            z=rng.standard_normal((n,k))@L.T
            logS+= (R_OIS-Q-0.5*vols**2)*dt+vols*np.sqrt(dt)*z
            minS=np.minimum(minS, np.exp(logS).min(1))
        qlev.append(np.exp(logS).copy())
    return np.array(qlev), minS   # qlev: (nq,n,k)
def value(qlev, minS, T, cpn, ac, ki, ki_type, uncond, worst, cpn_bar=0.0, memory=False, nc=1):
    f=fund[T]; nq=int(T*4); n=qlev.shape[1]
    perf = qlev.min(2) if worst else qlev.mean(2)   # (nq,n)
    alive=np.ones(n,bool); pv=np.zeros(n); life=np.zeros(n); missed=np.zeros(n)
    for q in range(nq):
        t=(q+1)/4; df=1/(1+f)**t; p=perf[q]
        if uncond: c=np.full(n,cpn/4)
        else:
            pay=p>=cpn_bar; c=np.where(pay, cpn/4*(1+ (missed if memory else 0)),0); missed=np.where(pay,0,missed+1)
        pv+=alive*c*df
        trig = ac[q] if q>=nc-1 else 9
        called=alive&(p>=trig) if q<nq-1 else np.zeros(n,bool)
        pv+=called*1*df; life+=alive*0.25; alive&=~called
    df=1/(1+f)**T; pT=perf[-1]
    hit = (minS< ki) if ki_type=="american" else (pT<ki)
    if worst and ki_type=="american": pass
    red=np.where(hit & (pT<1), pT, 1.0)
    pv+=alive*red*df
    loss=alive&hit&(pT<1)
    return pv.mean(), life.mean()+0, loss.mean(), (alive*np.where(loss,1-pT,0)).mean()
def stepdown(T,start=1.0,step=0.0):
    return [max(start-step*(q//4),0.8) for q in range(int(T*4))]
N=60000
print("Basket = equal-weight 13 AI-hardware names (vol 40% each, corr 0.55 -> basket ~31%)")
qb,mb=sim(N,5,[0.40]*13,0.55)
qw,mw=sim(N,5,[0.42,0.48,0.45],0.6)   # TSMC, SK Hynix, Tokyo Electron worst-of
tests=[
 ("A Winner-style: 10% uncond, AC 105/102.5/100/97.5 qtr steps, KI 75% American, basket", qb,mb,dict(cpn=.10,ac=[1.05,1.025,1.0,0.975]+[0.975]*16,ki=.75,ki_type="american",uncond=True,worst=False)),
 ("B 10% uncond, AC 100% qtrly, KI 60% European, basket", qb,mb,dict(cpn=.10,ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=False)),
 ("C 10% conditional (cpn barrier 70%, memory), AC 100%, KI 60% European, basket", qb,mb,dict(cpn=.10,ac=[1.0]*20,ki=.60,ki_type="european",uncond=False,worst=False,cpn_bar=.70,memory=True)),
 ("D 10% uncond, AC 100% from Q4, KI 60% European, worst-of 3", qw,mw,dict(cpn=.10,ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=True,nc=4)),
 ("E 10% uncond, AC 100% qtrly, KI 65% European, basket", qb,mb,dict(cpn=.10,ac=[1.0]*20,ki=.65,ki_type="european",uncond=True,worst=False)),
 ("F 10% uncond, AC 100% from Q4, KI 60% European, basket", qb,mb,dict(cpn=.10,ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=False,nc=4)),
]
for name,q,m,kw in tests:
    v,life,pl,el=value(q,m,5,**kw)
    print(f"{name}\n   value {v*100:.2f} (issue 100 -> issuer margin {100-v*100:+.2f}) | exp life {life:.2f}y | P(capital loss) {pl:.1%} | exp loss {el*100:.1f}")
# solve max coupon for B/C at 2% margin
for label,kw in [("B",dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=False)),
                 ("C",dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=False,worst=False,cpn_bar=.70,memory=True)),
                 ("F",dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=False,nc=4))]:
    lo,hi=0.0,0.4
    for _ in range(30):
        mid=(lo+hi)/2; v=value(qb,mb,5,cpn=mid,**kw)[0]
        lo,hi=(mid,hi) if v<0.98 else (lo,mid)
    print(f"{label}: max coupon at 2% issuer margin = {lo:.1%} p.a.")

print("\n=== Max coupon at 2% issuer margin (5Y USD, quarterly obs) ===")
qi,mi=sim(N,5,[0.20,0.22,0.33],0.55)      # worst-of TAIEX, KOSPI200, SOXX-like
qs,ms=sim(N,5,[0.42,0.48,0.45],0.6)       # worst-of TSMC, SK Hynix, Tokyo Electron
designs=[
 ("Basket 13 names | uncond | KI 60% Eur", qb,mb,dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=False)),
 ("Basket 13 names | uncond | KI 75% Amer (winner)", qb,mb,dict(ac=[1.05,1.025,1.0,0.975]+[0.975]*16,ki=.75,ki_type="american",uncond=True,worst=False)),
 ("Basket 13 names | cond 70% memory | KI 70% Eur", qb,mb,dict(ac=[1.0]*20,ki=.70,ki_type="european",uncond=False,worst=False,cpn_bar=.70,memory=True)),
 ("Worst-of TAIEX/KOSPI200/SOXX | cond 70% memory | KI 60% Eur", qi,mi,dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=False,worst=True,cpn_bar=.70,memory=True)),
 ("Worst-of TAIEX/KOSPI200/SOXX | uncond | KI 60% Eur", qi,mi,dict(ac=[1.0]*20,ki=.60,ki_type="european",uncond=True,worst=True)),
 ("Worst-of TSMC/SK Hynix/TEL | cond 65% memory | KI 55% Eur", qs,ms,dict(ac=[1.0]*20,ki=.55,ki_type="european",uncond=False,worst=True,cpn_bar=.65,memory=True)),
]
for name,q,m,kw in designs:
    lo,hi=0.0,0.6
    for _ in range(28):
        mid=(lo+hi)/2; v=value(q,m,5,cpn=mid,**kw)[0]
        lo,hi=(mid,hi) if v<0.98 else (lo,mid)
    v,life,pl,el=value(q,m,5,cpn=lo,**kw)
    print(f"{name:<62} max cpn {lo:5.1%} | exp life {life:.1f}y | P(loss) {pl:5.1%} | exp loss {el*100:4.1f}")

print("\n=== 10% p.a. coupon on worst-of TSMC / SK Hynix / Tokyo Electron: which barriers fit a 2% margin? ===")
for cb in [0.60,0.65,0.70]:
    for ki in [0.45,0.50,0.55,0.60]:
        for unc in [False, True]:
            v,life,pl,el=value(qs,ms,5,cpn=.10,ac=[1.0]*20,ki=ki,ki_type="european",uncond=unc,worst=True,cpn_bar=cb,memory=True)
            if unc and cb!=0.60: continue
            print(f"cpn bar {'none' if unc else f'{cb:.0%}'} KI {ki:.0%}: value {v*100:6.2f} margin {100-v*100:+5.2f} | life {life:.1f}y | P(loss) {pl:5.1%} | exp loss {el*100:4.1f}")
