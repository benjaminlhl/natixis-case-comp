# Scenario 2 strategy: Asian Digital Transformation Capital-Protected Autocallable Note

**Client:** NKE Private Wealth (Chak family) · **Size:** USD 100mn · **Trade date:** 17 Sep 2026 · **Tenor:** 5Y
**Deck:** `deck/Asian-Digital-Autocallable-Note.pdf` (built by `deck/build_deck_scenario2.js`)
**Pricer:** `pricing/scenario2_autocall_mc.py` → `pricing/scenario2_results.json`
**Supporting analysis:** `pricing/scenario2_risk_levers.py`, `pricing/scenario2_barrier70_grid.py`

> Vols, dividends and correlations are **assumptions**. Refresh them on Bloomberg as of 17 Sep 2026 and re-run the pricer; the deck reads its numbers from the JSON.

## Terms
- Issuer Natixis SA, USD quanto, 5 years, 20 quarterly observation dates.
- Underlying: weighted basket (not worst-of) of HSTECH Index 30%, NKY Index 30%, TWSE Index 25% and MXAP0UT Index 15% (MSCI AC APAC Utilities; verify the ticker).
- **Coupon:** 6.5% p.a. (1.625% per quarter), paid on each date the basket is ≥ 100% of its initial level.
- **Memory:** missed coupons are paid on the next date the basket is ≥ 100%.
- **Autocall:** from Q4 (Year 1), if basket ≥ 100% the note pays 100% plus coupons due and ends.
- **At maturity:** 100% of principal whatever the basket level (capital protected, subject to Natixis credit).
- Issued at 100%. Fair value is 97.5%, leaving 2.5% for hedging costs and margin.

## Why this design
Fair coupons below are at a 98% issue price, on the same basket.

| Autocall design | Fair coupon | Chance of capital loss |
|---|---|---|
| Classic, fixed coupon, 70% barrier | 5.9% | 9.6% |
| Phoenix memory (80% coupon barrier), 70% barrier | 7.0% | 9.6% |
| Snowball, 65% barrier (earlier version) | 9.7% | 7.7% |
| Classic, 70% barrier, 10%-vol basket | 4.1% | 1.1% |
| **Capital protected, memory coupon (ours)** | **6.9%** | **0%** |

- The draft's 8.5% fixed coupon is worth ~103% to the client, so Natixis cannot fund it.
- Getting a 70% barrier down to 1–2% breach needs a ~10%-vol basket. That pays ~4%, below the 5.69% USD bond.
- Full protection is cheap at 5.69% rates, and the autocall usually returns the principal early, so the protected design keeps a coupon above the funding rate.

## Key numbers (risk-neutral unless stated)
- Called at Y1: 51%. Called within 5Y: 83%. Expected life: 2.1 years.
- Zero return (100% back, no coupon): 10.8%. Not called but some early coupons: 6.4%. Capital loss: 0%.
- Mean IRR 5.4%, median IRR 6.6%.
- Real-world mean IRR: 4.5% at 0% equity return, 5.3% at 4%, 5.8% at 8%.
- Fair-coupon sensitivity:

  | Change | Fair coupon |
  |---|---|
  | Vol ±3pts | 6.6–7.2% |
  | Correlation ±0.15 | 6.7–7.1% |
  | Equity drift −1% / −2% | 7.5% / 8.1% |
  | Coupon barrier 95% | 6.3% |
  | Coupon barrier 90% | 5.7% |

## Changes vs. the first draft (`Natixis_.pdf`)
1. The fixed 8.5% coupon was not fundable. It is replaced by a 6.5% memory coupon on a capital-protected note.
2. The draft's thematic indices are not Bloomberg-listed. Each theme is mapped to a real index.
3. The barrier/strike inconsistency is gone: there is no barrier, and capital is fully protected.

## To do before submission
- Pull Bloomberg vols, correlations and dividends, then re-run the pricer.
- Run a historical rolling-window back-test (monthly launches since 2015) and add it to slide 8 or 9.
- Optionally add a quanto drift adjustment using FX-equity correlations.
