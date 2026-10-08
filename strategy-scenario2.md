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

## Key numbers
Outcome statistics use the **team outlook**: the risk/return app's single-ETF vols and expected returns (strategy slide), which reproduce the app's Monte Carlo (median 2.8× at Year 5). Pricing uses the risk-neutral measure.

| | Team outlook | Half outlook | 0% (flat) | Pricing (risk-neutral) |
|---|---|---|---|---|
| Called within 5Y | 99% | 91% | 67% | 78% |
| Called at Y1 | 78% | 61% | 41% | 48% |
| Expected life (yrs) | 1.23 | 1.72 | 2.64 | 2.25 |
| Mean / median IRR | 13.0% / 13.3% | 11.1% / 13.2% | 4.3% / 12.6% | 7.8% / 12.9% |
| Capital loss (never called) | 0.8% | 8.6% | 32.9% | 21.6% |

- Fair coupon 14.1%; lowest across sensitivities 12.9% (vol −3pts), so the 12.75% offer holds. Natixis margin 3.50%.
- Basket vol ~26% with Bloomberg-style correlations (consistent with the app's Monte Carlo); the app's risk/return chart shows ~17% for the basket: check the app's correlation inputs.

## To do before submission
- Pull Bloomberg correlations and dividends, then re-run the pricer; reconcile the app's ~17% basket volatility (risk/return chart) with the ~27% its Monte Carlo implies.
- Confirm 3119 HK's 6-month average daily value traded is above USD 5M.
- Run a historical rolling-window back-test (monthly launches since 2021).
