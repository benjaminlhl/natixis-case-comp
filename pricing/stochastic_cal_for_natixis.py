import numpy as np
from math import erf, sqrt

N = 1_000_000
SEED = 12345
CONTINUOUS_RATE = False  # True interprets 5.69% as continuous

rate = 0.0569
r = rate if CONTINUOUS_RATE else np.log1p(rate)
t = np.arange(1.0, 6.0)
D = np.exp(-r * t)

w = np.array([0.35, 0.20, 0.15, 0.15, 0.15])
H = np.array([1.025, 1.000, 0.975, 0.950, 0.925])

# Rows: 3119.HK, EWY, EWT, 2644.T, 00878.TW.
# Assignment of the Japanese volatility row is provisional.
vol = np.array([
    [0.3045, 0.3234, 0.335, 0.367, 0.375],
    [0.4150, 0.4270, 0.445, 0.445, 0.445],
    [0.3240, 0.3580, 0.363, 0.363, 0.363],
    [0.2300, 0.2490, 0.256, 0.256, 0.259],
    [0.0700, 0.0900, 0.120, 0.120, 0.120],
])

rho = np.array([
    [1.000, 0.534, 0.741, 0.863, 0.562],
    [0.534, 1.000, 0.587, 0.491, 0.438],
    [0.741, 0.587, 1.000, 0.614, 0.689],
    [0.863, 0.491, 0.614, 1.000, 0.517],
    [0.562, 0.438, 0.689, 0.517, 1.000],
])

# Modeling assumptions: USD-return parameters; zero dividend yields.
# q[i,k] is the annualized continuous yield in interval k.
q = np.zeros((5, 5))

assert np.isclose(w.sum(), 1.0)
assert np.allclose(rho, rho.T)
eig = np.linalg.eigvalsh(rho)
if eig.min() < -1e-12:
    raise ValueError("Correlation matrix is not PSD.")
# This supplied matrix is strictly positive definite.
chol = np.linalg.cholesky(rho)

total_var = vol**2 * t[None, :]
dV = np.diff(
    np.concatenate([np.zeros((5, 1)), total_var], axis=1),
    axis=1
)
if dV.min() < -1e-12:
    raise ValueError("Negative interval variance.")
dV = np.maximum(dV, 0.0)

print("NumPy:", np.__version__, "N:", N, "seed:", SEED)
print("Continuous rate interpretation:", CONTINUOUS_RATE)
print("Correlation eigenvalues:", eig)
print("Interval variances:\n", dV)

# Reproduce direct valuation from the supplied rounded probabilities.
supplied_cdf = np.array([0.78, 0.93, 0.97, 0.99, 0.99])
supplied_p = np.diff(np.r_[0.0, supplied_cdf])
supplied_never = 1.0 - supplied_cdf[-1]

a_sup = supplied_p @ D
b_sup = (t * supplied_p) @ D

print("\nDirect valuation from supplied probabilities:")
for m in [1.0, 0.9, 0.8, 0.7, 0.6, 0.0]:
    numerator = 1.0 - a_sup - D[-1] * supplied_never * m
    yA = numerator / b_sup
    yB = numerator / (b_sup + 5.0 * D[-1] * supplied_never)
    print(f"m={m:.1f}: A={100*yA:.6f}%, B={100*yB:.6f}%")

# Rough analytic proxy; not a Monte Carlo result.
v_proxy = (w * vol[:, 0]) @ rho @ (w * vol[:, 0])
z_proxy = (r - np.log(H[0]) - 0.5*v_proxy) / np.sqrt(v_proxy)
p_proxy = 0.5 * (1.0 + erf(z_proxy / sqrt(2.0)))
print("\nZero-dividend first-year lognormal proxy:", p_proxy)

# Independent simulation, with no calibration to the supplied CDF.
rng = np.random.Generator(np.random.PCG64(SEED))
X = np.ones((N, 5))
first_call = np.zeros(N, dtype=np.int8)

for j in range(5):
    Z = rng.standard_normal((N, 5)) @ chol.T
    X *= np.exp(
        (r - q[:, j]) - 0.5*dV[:, j]
        + Z * np.sqrt(dV[:, j])
    )
    B = X @ w  # Fixed initial weights of normalized USD performances.
    hit = (first_call == 0) & (B >= H[j])
    first_call[hit] = j + 1

# Year-5 autocall has already been tested.
never = first_call == 0
R5 = np.where(B >= 0.70, 1.0, B)

def mean_se(x):
    x = np.asarray(x, dtype=float)
    return x.mean(), x.std(ddof=1) / np.sqrt(x.size)

print("\nIndependent MC probabilities; SE in percentage points:")
for k in range(1, 6):
    pk, pk_se = mean_se(first_call == k)
    ck, ck_se = mean_se((first_call > 0) & (first_call <= k))
    print(
        f"Year {k}: first={100*pk:.4f}% (SE {100*pk_se:.4f}); "
        f"CDF={100*ck:.4f}% (SE {100*ck_se:.4f}); "
        f"supplied CDF={100*supplied_cdf[k-1]:.2f}%"
    )

pn, pn_se = mean_se(never)
M_path = np.where(never, R5, 0.0)
M, M_se = mean_se(M_path)

print("Never-call probability and SE:", pn, pn_se)
print("Unconditional maturity statistic M and SE:", M, M_se)
print("Conditional repayment m:",
      R5[never].mean() if never.any() else np.nan)

# Per-unit-principal PV = a + y*b.
tau = np.where(never, 5, first_call)
discount = np.exp(-r * tau)
a = discount * np.where(never, R5, 1.0)

bA = discount * np.where(never, 0.0, tau)
bB = discount * tau

for label, b in [("A", bA), ("B", bB)]:
    b_mean = b.mean()
    if b_mean <= 0:
        print(f"Case {label}: coupon denominator is zero.")
        continue

    y = (1.0 - a.mean()) / b_mean

    # Delta method for y = (1 - E[a]) / E[b],
    # retaining covariance between principal and coupon exposure.
    influence = -(a + y*b - 1.0) / b_mean
    se_y = influence.std(ddof=1) / np.sqrt(N)

    print(
        f"Case {label}: coupon={100*y:.6f}%; "
        f"SE={10000*se_y:.3f} bp; "
        f"approx. 95% CI="
        f"[{100*(y-1.96*se_y):.6f}%, "
        f"{100*(y+1.96*se_y):.6f}%]"
    )