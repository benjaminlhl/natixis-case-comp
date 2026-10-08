# Scenario 2 strategy: Asian Digital Transformation Autocallable Note (classic, memory coupon)

**Client:** NKE Private Wealth (Chak family) · **Size:** USD 100mn · **Trade date:** 17 Sep 2026 · **Tenor:** 5Y
**Deck:** `final/Asian-Digital-Autocallable-Note.pdf` (built by `deck/build_deck_scenario2.js`, which also pulls in the team-template thesis and strategy slides)
**Pricer:** `pricing/scenario2_autocall_mc.py` → `pricing/scenario2_results.json`

> Vols, dividends and correlations are **assumptions**. Refresh them on Bloomberg as of 17 Sep 2026 and re-run the pricer; the deck reads its numbers from the JSON.

## Terms
- Issuer Natixis SA, USD quanto, 5 years, 20 quarterly observation dates.
- Underlying: weighted basket (not worst-of) of five Asian ETFs across the AI-hardware chain, with an ESG sleeve:

  | ETF (Bloomberg) | Weight | Vol* | Div* | Role |
  |---|---|---|---|---|
  | Global X Asia Semiconductor ETF (3119 HK) | 35% | 32% | 1.0% | Pan-Asian chip leaders (core AI hardware) |
  | Global X Japan Semiconductor ETF (2644 JP) | 15% | 38% | 0.8% | Japanese chip equipment and testers |
  | iShares MSCI Taiwan ETF (EWT US) | 15% | 26% | 2.6% | Taiwan large caps (TSMC, MediaTek, Delta) |
  | iShares MSCI South Korea ETF (EWY US) | 20% | 30% | 1.2% | Korea large caps (Samsung, SK hynix: memory for AI) |
  | Cathay Taiwan ESG Sustainability High Dividend ETF (00878 TT) | 15% | 18% | 7.6% | ESG sleeve, lower-volatility anchor |

  \*Assumptions. Weights are the team's allocation (35/20/15/15/15); re-run the pricer after any change.
- Liquidity (USD 5M/day 6-month average rule): EWY, EWT, 2644 and 00878 pass. **3119 is borderline (about USD 4–5M/day): verify on Bloomberg.** If it fails, its 25% moves to EWT/EWY.
- **Coupon:** 12.75% p.a. (3.1875% per quarter), paid on each date the basket is ≥ 100% of its initial level.
- **Memory:** missed coupons are paid on the next date the basket is ≥ 100%.
- **Autocall:** from Q4 (Year 1), if basket ≥ 100% the note pays 100% plus coupons due and ends.
- **At maturity (not called):** repaid at the basket level (no barrier, no floor), subject to Natixis credit.
- Issued at 100%. Fair value is 96.45%, leaving about 3.55% for hedging costs and margin.
- Value split: principal 89.4% + coupons 14.1% − short put 7.0% (the client's put on the basket at 100%, live only if never called).

## Why this design
Fair coupons at a 98% issue price, same basket:

| Autocall design | Fair coupon | Chance of loss at maturity | Max loss |
|---|---|---|---|
| Classic: fixed coupon, 70% barrier | 7.4% | 15.9% | up to 100% |
| Snowball, 65% barrier | 13.7% | 14.3% | up to 100% |
| Memory coupon, 70% barrier + 70% put | 11.1% | 15.9% | 30% |
| Memory coupon, 100% capital protected | 7.8% | 0.0% | none |
| **Classic memory autocall, no barrier (ours)** | **14.1%** | **21.0%** | **up to 100%** |

- The team chose the classic autocall: the highest coupon, in exchange for bearing the basket's fall if the note is never called.
- The offer is 12.75% because the lowest fair coupon across the market sensitivities is 12.89% (vol −3pts).

## Key numbers (risk-neutral unless stated)
- Called at Y1: 49%. Called within 5Y: 79%. Expected life: 2.22 years.
- Never called (loss): 21.0%; average repayment in those paths 56%; repaid below 70%: 15.9%.
- Mean IRR 7.8%, median IRR 13.0%.
- Real-world (equity total return 0% / 4% / 8% a year): mean IRR 4.3% / 7.1% / 9.1%; chance of a loss 32% / 23% / 16%.
- Fair-coupon sensitivity: vol ±3pts 12.9%–15.5%; correlation ±0.15 13.2%–15.0%; equity drift −1% / −2% 15.5% / 17.2%; coupon barrier 95% / 90% 13.0% / 12.0%.
- Basket Monte Carlo (team app, per USD 100,000): median USD 279.6k at Year 5, 5th percentile USD 103.6k, 99.0% of paths at or above USD 70,000.

## To do before submission
- Pull Bloomberg vols (BVOL/OVDV), correlations and dividends, then re-run the pricer; align the ~17% basket volatility on the strategy slide (team app) with the ~26% used in pricing.
- Confirm 3119 HK's 6-month average daily value traded is above USD 5M.
- Run a historical rolling-window back-test (monthly launches since 2021).
