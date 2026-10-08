# Scenario 2 strategy: Asian Digital Transformation Capital-Protected Autocallable Note

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
- **Coupon:** 7.20% p.a. (1.80% per quarter), paid on each date the basket is ≥ 100% of its initial level.
- **Memory:** missed coupons are paid on the next date the basket is ≥ 100%.
- **Autocall:** from Q4 (Year 1), if basket ≥ 100% the note pays 100% plus coupons due and ends.
- **At maturity:** 100% of principal whatever the basket level (capital protected, subject to Natixis credit).
- Issued at 100%. Fair value is 97.25%, leaving about 2.75% for hedging costs and margin.

## Why this design
Fair coupons below are at a 98% issue price, on the same basket.

| Autocall design | Fair coupon | Chance of capital loss |
|---|---|---|
| Classic: fixed coupon, 70% barrier | 7.4% | 16.2% |
| Phoenix memory (80% cpn barrier), 70% barrier | 10.0% | 16.2% |
| Snowball, 65% barrier | 13.9% | 14.5% |
| Classic, 70% barrier, 10%-vol basket | 4.2% | 1.3% |
| **Capital protected, memory coupon (ours)** | 7.9% | 0.0% |

- The draft's 8.5% fixed coupon is worth 100.3% to the client, so Natixis cannot fund it.
- Getting a 70% barrier down to ~1% breach needs a ~10%-vol basket. That pays ~4%, below the 5.69% USD bond.
- Full protection is cheap at 5.69% rates, and the autocall usually returns the principal early, so the protected design keeps a coupon above the funding rate.
- The five-ETF basket (vol ~25%) prices the fair coupon at 7.9%. The offer is 7.20% because the lowest fair coupon across the market sensitivities is 7.65%.
- Asia-only by mandate. Chinese chip exposure (SMIC, SSE STAR 50) is avoided for OFAC NS-CMIC reasons; check that no ETF holds sanctioned names.
- 00878 distributes about 7.6% a year, which lowers its price path; the basket is price-return, so this is priced in.
- Only EWT and EWY have listed options. The desk hedges 3119, 2644 and 00878 with delta (ETF shares) and vega through proxies (TAIEX, KOSPI 200 and Nikkei options).

## Key numbers (risk-neutral unless stated)
- Called at Y1: 48%. Called within 5Y: 79%. Expected life: 2.24 years.
- Zero return (100% back, no coupon): 13.5%. Not called but some early coupons: 7.9%. Capital loss: 0%.
- Mean IRR 5.7%, median IRR 7.3%. Principal-protected note alternative: 87% participation.
- Real-world mean IRR: 4.9% at 0% equity return, 5.6% at 4%, 6.1% at 8%.
- Fair-coupon sensitivity:

  | Change | Fair coupon |
  |---|---|
  | Vol ±3pts | 7.7%–8.2% |
  | Correlation ±0.15 | 7.7%–8.1% |
  | Equity drift −1% / −2% | 8.4% / 9.0% |
  | Coupon barrier 95% | 7.2% |
  | Coupon barrier 90% | 6.7% |

## Changes vs. the first draft (`Natixis_.pdf`)
1. The fixed 8.5% coupon was not fundable. It is replaced by a 7.20% memory coupon on a capital-protected note.
2. The draft's thematic indices are not Bloomberg-listed. The basket now uses five Bloomberg-listed Asian ETFs (3119 HK, 2644 JP, EWT US, EWY US, 00878 TT).
3. The barrier/strike inconsistency is gone: there is no barrier, and capital is fully protected.

## To do before submission
- Pull Bloomberg vols, correlations and dividends, then re-run the pricer.
- Confirm 3119 HK's 6-month average daily value traded is above USD 5M.
- Run a historical rolling-window back-test (monthly launches since 2021, when all five ETFs trade) and add it to slide 8 or 9.
- Optionally add a quanto drift adjustment using FX-equity correlations.
