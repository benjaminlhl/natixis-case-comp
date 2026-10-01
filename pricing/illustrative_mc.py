"""Illustrative pricing for the K-Dislocation Note (Scenario 1).
All market inputs below are PLACEHOLDERS - replace with Bloomberg data as of 17 Sep 2026.
Legs: A = Brent-triggered KOSPI 200 call with strike reset, B = Brent x USDKRW dual digital,
C = KOSPI 200 100/130 call spread (skew-aware). Requires numpy, scipy.
"""
import numpy as np
from math import log,sqrt,exp
from scipy.stats import norm
rng=np.random.default_rng(1)
N=200000; T=1.5; steps=378; dt=T/steps
rK,rU,q=0.025,0.0375,0.018
vB,vK,vF=0.35,0.22,0.09   # Brent, KOSPI200, USDKRW (assumptions)
def run(rhoBK,rhoBF,rhoKF):
    C=np.array([[1,rhoBK,rhoBF],[rhoBK,1,rhoKF],[rhoBF,rhoKF,1]]);L=np.linalg.cholesky(C)
    lB=np.zeros(N);lK=np.zeros(N);lF=np.zeros(N)
    trig=np.zeros(N,bool);Ktrig=np.ones(N)
    for i in range(steps):
        z=rng.standard_normal((3,N));z=L@z
        lB+=-0.5*vB**2*dt+vB*sqrt(dt)*z[0]           # Brent ~ forward (no drift)
        lK+=(rK-q-0.5*vK**2)*dt+vK*sqrt(dt)*z[1]
        lF+=(rK-rU-0.5*vF**2)*dt+vF*sqrt(dt)*z[2]     # USDKRW in KRW measure
        if i<252:
            new=(~trig)&(np.exp(lB)>=1.25); Ktrig[new]=np.exp(lK[new]); trig|=new
    D=exp(-rK*T); KT=np.exp(lK)
    A=D*np.mean(np.where(trig,np.maximum(KT/Ktrig-1,0),0))
    B=D*np.mean((np.exp(lB)>=1.10)&(np.exp(lF)<=0.97))
    return A,B,trig.mean(),np.mean((np.exp(lB)>=1.10)&(np.exp(lF)<=0.97))
def bs(K,v):
    d1=(log(1/K)+(rK-q+0.5*v*v)*T)/(v*sqrt(T));d2=d1-v*sqrt(T)
    return exp(-q*T)*norm.cdf(d1)-K*exp(-rK*T)*norm.cdf(d2)
cs=bs(1.0,0.22)-bs(1.30,0.185)
print("Call spread 100/130 (skew-aware):",round(cs*100,2),"% | flat vol:",round((bs(1,0.22)-bs(1.3,0.22))*100,2))
for rho in [(-0.2,0.3,-0.5),(0,0.1,-0.5),(-0.3,0.5,-0.6)]:
    A,B,pt,pb=run(*rho)
    print(rho,"A per 100% part:",round(A*100,2),"% trig prob",round(pt,3)," B digital:",round(B*100,2),"% prob",round(pb,3),"payout x",round(1/B,1))
for r in [0.0504,0.04]:
    DF=1/(1+r)**1.5; print("fund",r,"DF",round(DF,4),"budget 90% prot - 1.5% margin:",round(100-90*DF-1.5,2))
