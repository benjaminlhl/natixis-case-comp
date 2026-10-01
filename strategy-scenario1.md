# Scenario 1 strategy: the "K-Dislocation Note"

**Client:** Purple Magic Capital · **Size:** KRW 135bn · **Trade date:** 17 Sep 2026 · **Tenor:** 18 months
**Pitch in one line:** *"The Iran-war oil shock is the biggest macro risk for Korea. We turn it into the trigger that buys the dislocation for you, with your next loss capped at a known number."*

> All prices below come from `pricing/illustrative_mc.py` using **placeholder** inputs.
> Re-run with Bloomberg data as of 17 Sep 2026 before putting numbers on slides.

## 1. Structure
KRW-denominated note issued by Natixis, **90% capital protected**, made of three catalyst engines.

### Option budget
- USD funding interpolated to 18M is 5.04%. Swapped into KRW the equivalent is lower, about 4–5% (verify with the USD/KRW cross-currency swap).
- Zero-coupon bond for 90% protection costs about 84–85%.
- Less ~1.5% Natixis margin, that leaves an **option budget of ~14%**.

| Engine | Budget | Payoff (18M) | Catalyst / view |
|---|---|---|---|
| **A. Oil-shock dip buyer** | 5% | If **Brent closes ≥ 125%** of initial on any day in the first 12M, a KOSPI 200 call **struck at the KOSPI level on the trigger day** switches on, with **~120% participation** to maturity | An oil shock causes a Korean equity dislocation, and the note buys the dip automatically without the fund needing to time it |
| **B. Decoupling dual digital** | 3% | Pays **~9x** (≈27% of notional) if at maturity **Brent ≥ 110% AND USD/KRW ≤ 97%** | Structural inflows (WGBI index buying, chip exports) break KRW's usual link to oil. The pairing runs against the historical correlation, which makes it cheap |
| **C. Re-rating call spread** | 6% | **~65% participation** in KOSPI 200 between 100% and 130% (max +19.5%) | Ceasefire or normalisation plus Value-up / MSCI re-rating |

### Illustrative prices (placeholder inputs)
- **A** costs ~4.1% per 100% participation, about **35–40% of a vanilla 18M ATM call**, because the call only exists after the trigger. Trigger probability is ~44% with Brent vol at 35%.
- **B** costs 8–14% of the payout, depending on correlation (see the table below). That correlation sensitivity is the key pricing slide.
- **C**, with skew taken into account (130% strike at lower IV), costs 9.2% vs 8.1% at flat vol. This is Unit 4, slide 7: the OTM call you sell is cheap.

| corr(Brent, USD/KRW) | B price | Payout multiple |
|---|---|---|
| +0.1 | 14.0% | 7.2x |
| +0.3 | 11.1% | 9.0x |
| +0.5 | 8.1% | 12.4x |

## 2. Scenario map (why it's creative)
| Scenario (18M) | Engines that pay | Note redemption (base case) |
|---|---|---|
| Oil shock, then KOSPI rebounds 20% from trigger | A | ~114% |
| Oil shock with resilient KRW, and rebound | A + B | ~141% |
| Ceasefire / normalisation, KOSPI +30% | C | ~109.5% |
| Stagnation, or oil shock with no rebound | None | **90% (max loss, known on day 1)** |

**The note pays in both a shock and a peace scenario.** It loses only in stagnation, and that loss is capped.

### Protection dial (for the fund to choose)
| Protection | Budget | A participation | B payout | C participation | Max loss |
|---|---|---|---|---|---|
| **90% (recommended)** | ~14% | ~120% | ~27% | ~65% | 10% (~KRW 13.5bn) |
| 80% (aggressive) | ~24% | ~220% | ~45% | ~110% | 20% |

## 3. Why it's feasible
- **All underlyings are on Bloomberg and very liquid.** Brent futures and options (CO1 Comdty), KOSPI 200 (KOSPI2 Index, among the most liquid index options in the world), and USD/KRW (NDF and options market).
- **Natixis can hedge every engine with standard instruments:**
  - A: a cross-asset barrier, hedged with Brent options plus KOSPI 200 forward-start options.
  - B: a correlation book.
  - C: listed KOSPI 200 options.
- **Funding:** issued with USD funding from the grid and swapped to KRW with a cross-currency swap (footnote 1 of the rules).
- **Event calendar fits inside 18M:** FOMC and BoK meetings, OPEC+, the next MSCI annual market classification review (June 2027), and WGBI inclusion flows.

## 4. Risks to disclose
- **Engine A:** Oil spikes and KOSPI keeps falling (2022-type). Engine A expires worthless and the 10% maximum loss applies. Show this honestly in the backtest.
- **Correlation risk** on engine B; **skew and vol-surface risk** on A and C.
- **Natixis credit risk.** Secondary-market liquidity and bid/offer if the fund wants to exit early.
- **KRW** cross-currency swap basis and non-deliverability offshore; settlement mechanics.

## 5. Analysis to run for the deck
1. Re-price all three engines with the 17 Sep 2026 vol surfaces, using skew-aware pricing for A and C (Unit 4).
2. Backtest engine A on past oil shocks (2008, 2011, 2022, plus the 2026 Iran-war path).
3. Correlation sensitivity chart for B. Payout against tenor and barrier level for A.
4. Stress tests with a level shift (surface +5 to +15 vol points with spot down), plus a Greeks table for each engine.
5. Variants to test for A: a strike set 1 month after the trigger (to avoid catching a falling knife), or a lower trigger (120%).
