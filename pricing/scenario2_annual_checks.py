"""Checks on the annual step-down autocall (call level 105% - 2.5% x year, 70% barrier at Y5) with Appendix F inputs:
fair coupon, call probabilities, barrier variants, vol/correlation/drift shifts and replication legs, as used in the
fixed team deck (deck/fix_nat_deck.py). Run: python3 pricing/scenario2_annual_checks.py go"""
import numpy as np, sys
def price(rho, vol_shift=0.0, q=0.0, N=400_000, seed=12345, coupon=None):
    r=np.log1p(0.0569); t=np.arange(1.,6.)
    w=np.array([.35,.2,.15,.15,.15]); H=1.05-0.025*t
    vol=np.array([[.3045,.3234,.335,.367,.375],[.415,.427,.445,.445,.445],[.324,.358,.363,.363,.363],[.23,.249,.256,.256,.259],[.07,.09,.12,.12,.12]])+vol_shift
    ch=np.linalg.cholesky(rho); tv=vol**2*t; dV=np.diff(np.c_[np.zeros(5),tv],axis=1)
    rng=np.random.Generator(np.random.PCG64(seed)); X=np.ones((N,5)); fc=np.zeros(N,np.int8)
    for j in range(5):
        Z=rng.standard_normal((N,5))@ch.T; X*=np.exp((r-q)-.5*dV[:,j]+Z*np.sqrt(dV[:,j])); B=X@w
        hit=(fc==0)&(B>=H[j]); fc[hit]=j+1
    nev=fc==0; R5=np.where(B>=.7,1.,B); tau=np.where(nev,5,fc); d=np.exp(-r*tau)
    a=d*np.where(nev,R5,1.); b=d*np.where(nev,0.,tau); y=(1-a.mean())/b.mean()
    cdf=[((fc>0)&(fc<=k)).mean() for k in range(1,6)]
    out=dict(y=y,Eb=b.mean(),cdf=cdf,never=nev.mean(),below70=(nev&(B<.7)).mean(),cond_loss=(1-R5[nev&(B<.7)]).mean() if (nev&(B<.7)).any() else 0)
    if coupon is not None: out['pv']=(a+coupon*b).mean()
    return out
F=np.array([[1,.534,.741,.863,.562],[.534,1,.787,.691,.438],[.741,.787,1,.614,.689],[.863,.691,.614,1,.517],[.562,.438,.689,.517,1]])
T=np.array([[1,.534,.741,.863,.562],[.534,1,.587,.491,.438],[.741,.587,1,.614,.689],[.863,.491,.614,1,.517],[.562,.438,.689,.517,1]])

def legs(rho, N=400_000, seed=12345, **kw):
    r=np.log1p(0.0569); t=np.arange(1.,6.)
    w=np.array([.35,.2,.15,.15,.15]); H=1.05-0.025*t
    vol=np.array([[.3045,.3234,.335,.367,.375],[.415,.427,.445,.445,.445],[.324,.358,.363,.363,.363],[.23,.249,.256,.256,.259],[.07,.09,.12,.12,.12]])
    ch=np.linalg.cholesky(rho); tv=vol**2*t; dV=np.diff(np.c_[np.zeros(5),tv],axis=1)
    rng=np.random.Generator(np.random.PCG64(seed)); X=np.ones((N,5)); fc=np.zeros(N,np.int8)
    for j in range(5):
        Z=rng.standard_normal((N,5))@ch.T; X*=np.exp(r-.5*dV[:,j]+Z*np.sqrt(dV[:,j])); B=X@w
        fc[(fc==0)&(B>=H[j])]=j+1
    nev=fc==0; tau=np.where(nev,5,fc); d=np.exp(-r*tau)
    res={}
    for nm,R5 in [('base70',np.where(B>=.7,1.,B)),('prot100',np.ones(N)),('nobar',np.minimum(B,1.)),('b65',np.where(B>=.65,1.,B)),('b60',np.where(B>=.6,1.,B)),('b75',np.where(B>=.75,1.,B))]:
        a=d*np.where(nev,R5,1.); b=d*np.where(nev,0.,tau); res[nm]=dict(y=(1-a.mean())/b.mean(), ploss=(nev&(R5<1)).mean())
    res['principal']=d.mean(); res['put']=(d*np.where(nev,np.where(B>=.7,1.,B)-1,0)).mean(); res['Eb']=(d*np.where(nev,0.,tau)).mean()
    return res
if 'go' in sys.argv:
    base=price(F)['y']; print('base',base)
    for nm,kw in [('vol+3',dict(vol_shift=.03)),('vol-3',dict(vol_shift=-.03)),('q1',dict(q=.01)),('q2',dict(q=.02))]: print(nm, price(F,**kw)['y']-base)
    print(legs(F))
    off=~np.eye(5,dtype=bool); dn=F.copy(); dn[off]-=.15; up=0.6*F+0.4*np.ones((5,5))
    print('rho -0.15', price(dn)['y']-base, ' rho +%.2f avg' % (up-F)[off].mean(), price(up)['y']-base)
