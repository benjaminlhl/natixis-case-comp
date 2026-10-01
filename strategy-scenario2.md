# Scenario 2 strategy: Asian Digital Transformation Snowball Note

**Client:** NKE Private Wealth (Chak family) · **Size:** USD 100mn · **Trade date:** 17 Sep 2026 · **Tenor:** 5Y
**Deck:** `deck/Asian-Digital-Snowball-Note.pdf` (built by `deck/build_deck_scenario2.js`)
**Pricer:** `pricing/scenario2_autocall_mc.py` → `pricing/scenario2_results.json`

> Vols, dividends and correlations are **assumptions**. Refresh them on Bloomberg as of 17 Sep 2026 and re-run the pricer; the deck reads its numbers from the JSON.

## Terms
- Issuer Natixis SA, USD quanto, 5 years, quarterly observations with autocall from Q4.
- Underlying: weighted basket (not worst-of) of HSTECH Index 30%, NKY Index 30%, TWSE Index 25% and MXAP0UT Index 15% (MSCI AC APAC Utilities; verify the ticker).
- Autocall: if basket ≥ 100% on a review date, the note pays 100% + 9.0% p.a. × years elapsed (snowball: Y1 109%, up to Y5 145%).
- Not called: final basket ≥ 65% returns 100%; final basket < 65% returns principal × final level (European barrier).
- Issued at 100%. Fair value is 97.3%, leaving 2.7% for hedging costs and margin.

## Changes vs. the first draft (`Natixis_.pdf`)
1. **The 8.5% unconditional quarterly coupon is not fundable.** Using the case USD funding grid (5Y 5.69%), the same basket, autocall and 70% barrier, the fair fixed coupon is ~5.9% at a 98% issue price. The draft is worth ~103% to the client. Switching the coupon to snowball (paid only at call) lifts the fair coupon to 9.7% with a 65% barrier. It also matches the "capital appreciation, not income" mandate.
2. **The draft's thematic indices are not Bloomberg-listed**, which the rules require. Each theme is mapped to a real index.
3. **The barrier is now consistent.** The draft mixed a 70% European kick-in with a 90% strike. The note now has a single 65% European barrier with 1:1 loss from 100%.
4. **Hedging direction corrected.** Natixis is long the client's 65% put, so it is long downside vega and long correlation.

## Key numbers (risk-neutral)
- Autocall probability: 51% at Y1, 83% within 5Y. Expected life 2.1 years.
- Probability of capital loss 7.7%. Average loss given loss 47%; expected loss 3.6%.
- Fair coupon at 98% issue price:

  | Variant | Fair coupon |
  |---|---|
  | Fixed coupon | 5.6% |
  | Phoenix memory | 6.1% |
  | Snowball, 70% barrier | 10.1% |
  | Snowball, 65% barrier (base) | 9.7% |
  | Snowball, 60% barrier | 9.2% |

- Sensitivity: vol ±3pts moves the fair coupon across 8.5–11.0%; correlation ±0.15 moves it across 8.8–10.4%.
- PPN alternative: 100% protected with ~102% upside participation at maturity.

## To do before submission
- Pull Bloomberg vols, correlations and dividends, then re-run the pricer.
- Run a historical rolling-window back-test (monthly launches since 2015) and add it to slide 8 or 9.
- Optionally add a quanto drift adjustment using FX-equity correlations.
