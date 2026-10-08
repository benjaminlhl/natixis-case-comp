# Scenario 2 strategy: Asian Digital Transformation Buffered Autocallable Note (70% barrier + embedded 70% put)

**Client:** NKE Private Wealth (Chak family) · **Size:** USD 100mn · **Trade date:** 17 Sep 2026 · **Tenor:** 5Y
**Deck:** `deck/Asian-Digital-Autocallable-Note.pdf` (built by `deck/build_deck_scenario2.js`)
**Pricer:** `pricing/scenario2_autocall_mc.py` → `pricing/scenario2_results.json`
**Supporting analysis:** `pricing/scenario2_risk_levers.py`, `pricing/scenario2_barrier70_grid.py`

> Vols, dividends and correlations are **assumptions**. Refresh them on Bloomberg as of 17 Sep 2026 and re-run the pricer; the deck reads its numbers from the JSON.

## Terms
- Issuer Natixis SA, USD quanto, 5 years, 20 quarterly observation dates.
- Underlying: weighted basket (not worst-of) of five Asian ETFs across the AI-hardware chain, with an ESG sleeve:

  | ETF (Bloomberg) | Weight | Vol* | Div* | Role |
  |---|---|---|---|---|
  | Global X Asia Semiconductor ETF (3119 HK) | 25% | 32% | 1.0% | Pan-Asian chip leaders (core AI hardware) |
  | Global X Japan Semiconductor ETF (2644 JP) | 25% | 38% | 0.8% | Japanese chip equipment and testers |
  | iShares MSCI Taiwan ETF (EWT US) | 15% | 26% | 2.6% | Taiwan large caps (TSMC, MediaTek, Delta) |
  | iShares MSCI South Korea ETF (EWY US) | 15% | 30% | 1.2% | Korea large caps (Samsung, SK hynix: memory for AI) |
  | Cathay Taiwan ESG Sustainability High Dividend ETF (00878 TT) | 20% | 18% | 7.6% | ESG sleeve, lower-volatility anchor |

  \*Assumptions. Weights are the team's allocation (25/25/15/15/20); re-run the pricer after any change.
- Liquidity (USD 5M/day 6-month average rule): EWY, EWT, 2644 and 00878 pass. **3119 is borderline (about USD 4–5M/day): verify on Bloomberg.** If it fails, its 25% moves to EWT/EWY.
- **Coupon:** 10.50% p.a. (2.625% per quarter), paid on each date the basket is ≥ 100% of its initial level.
- **Memory:** missed coupons are paid on the next date the basket is ≥ 100%.
- **Autocall:** from Q4 (Year 1), if basket ≥ 100% the note pays 100% plus coupons due and ends.
- **At maturity (not called):** 100% if the basket is ≥ 70% of initial; otherwise 70% (embedded 70% put). Maximum loss 30%, subject to Natixis credit.
- Issued at 100%. Fair value is 97.21%, leaving about 2.79% for hedging costs and margin.
- Value split: principal 89.3% + coupons 11.6% − put pair 3.7% (client sells a 70% barrier put worth 6.3%; the note embeds a 70% put worth 2.6%).

## Why this design
Fair coupons below are at a 98% issue price, on the same basket.

| Autocall design | Fair coupon | Chance of loss at maturity | Max loss |
|---|---|---|---|
| Classic: fixed coupon, 70% barrier | 7.4% | 16.2% | up to 100% |
| Snowball, 65% barrier | 13.9% | 14.5% | up to 100% |
| Memory coupon, 70% barrier, no put | 13.6% | 16.2% | up to 100% |
| Memory coupon, 100% capital protected | 7.9% | 0.0% | none |
| **Memory coupon, 70% barrier + 70% put (ours)** | **11.2%** | **16.2%** | **30%** |

- The draft's 8.5% fixed coupon is worth 100.3% to the client, so Natixis cannot fund it.
- Full protection pays under 8%. Removing the put pays 13.6% but the whole crash lands on the family.
- The embedded 70% put costs about 2.4 points of coupon and caps the loss at 30%: the worst 1% outcome is 70% back.
- The offer is 10.50% because the lowest fair coupon across the market sensitivities is 10.56% (vol −3pts).
- Asia-only by mandate. Chinese chip exposure (SMIC, SSE STAR 50) is avoided for OFAC NS-CMIC reasons; check that no ETF holds sanctioned names.
- 00878 distributes about 7.6% a year, which lowers its price path; the basket is price-return, so this is priced in.
- Only EWT and EWY have listed options. The desk hedges 3119, 2644 and 00878 with delta (ETF shares) and vega through proxies (TAIEX, KOSPI 200 and Nikkei options). The put pair (a 30% digital put at 70%) is hedged with basket put spreads.

## Key numbers (risk-neutral unless stated)
- Called at Y1: 48%. Called within 5Y: 79%. Expected life: 2.24 years.
- Not called, basket ≥ 70%: 5.2% (100% back). Basket < 70% at Y5: 16.2% (70% back).
- Mean IRR 7.3%, median IRR 10.6%. Worst case 70% back (IRR −6.9%).
- Real-world (equity total return 0% / 4% / 8% a year): mean IRR 5.3% / 6.9% / 8.1%; chance of 70% back 28% / 18% / 12%.
- Fair-coupon sensitivity:

  | Change | Fair coupon |
  |---|---|
  | Vol ±3pts | 10.6%–12.0% |
  | Correlation ±0.15 | 10.8%–11.8% |
  | Equity drift −1% / −2% | 12.2% / 13.5% |
  | Coupon barrier 95% | 10.3% |
  | Coupon barrier 90% | 9.5% |

- At today's realised volatility (~48%, see `deck/Investment-Thesis-Factors.pdf`) the fair coupon would be higher and the embedded put dearer: reprice with Bloomberg implied vols at the trade date.

## Changes vs. the first draft (`Natixis_.pdf`)
1. The fixed 8.5% coupon was not fundable. It is replaced by a 10.50% memory coupon.
2. The draft's thematic indices are not Bloomberg-listed. The basket now uses five Bloomberg-listed Asian ETFs (3119 HK, 2644 JP, EWT US, EWY US, 00878 TT).
3. The barrier/strike inconsistency is gone: one 70% barrier at maturity, with an embedded 70% put so the loss is capped at 30%.

## To do before submission
- Pull Bloomberg vols (including skew for the 70% put), correlations and dividends, then re-run the pricer.
- Confirm 3119 HK's 6-month average daily value traded is above USD 5M.
- Run a historical rolling-window back-test (monthly launches since 2021, when all five ETFs trade) and add it to slide 8 or 9.
- Optionally add a quanto drift adjustment using FX-equity correlations.
