"""Scenario 2: P(breach of a 70% European barrier) and fair snowball coupon vs basket vol and tenor.
Single-factor lognormal basket (approximates the 4-index basket or a vol-target overlay on it).
Run: python3 pricing/scenario2_barrier70_grid.py
"""
import numpy as np
rng=np.random.default_rng(7)
GT=np.array([1,2,3,5,7,10,20]);GR=np.array([4.78,5.30,5.52,5.69,5.75,5.82,6.04])/100
fund=lambda t: np.interp(t,GT,GR); df=lambda t:(1+fund(t))**(-t)
def run(vol,T,q=0.02,bar=0.70,n=200_000,drift_shift=0.0):
    N=int(T*4); t=np.arange(1,N+1)/4; D=df(t)
    z=rng.standard_normal((n,N)); mu=fund(t)-q-drift_shift
    B=np.exp(np.cumsum((mu-0.5*vol**2)/4+vol*0.5*z,axis=1))
    cq=np.zeros(n,int); alive=np.ones(n,bool)
    for k in range(4,N+1):
        h=alive&(B[:,k-1]>=1); cq[h]=k; alive&=~h
    f=B[:,-1]; breach=(cq==0)&(f<bar)
    lq=np.where(cq>0,cq,N)
    def pv(c): return (np.where(cq>0,1+c*cq/4,np.where(f>=bar,1,f))*D[lq-1]).mean()
    lo,hi=0,0.5
    for _ in range(40):
        c=(lo+hi)/2; lo,hi=(c,hi) if pv(c)<0.98 else (lo,c)
    return breach.mean(), c, (cq>0).mean()
print("vol  T  | P(breach 70%) RN | fair cpn | P(call) | P(breach) if drift-2%")
for vol in [0.19,0.15,0.12,0.10,0.08]:
    for T in [3,4,5]:
        p,c,pc=run(vol,T); p2,_,_=run(vol,T,drift_shift=0.02)
        print(f"{vol:.0%} {T}Y | {p:6.2%} | {c:6.2%} | {pc:5.0%} | {p2:6.2%}")
