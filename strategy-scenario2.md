# Scenario 2 strategy: the "Asia AI Hardware Barbell"

**Client:** NKE Private Wealth (Chak family office) · **Size:** USD 100Mn · **Trade date:** 17 Sep 2026
**Structure:** USD 60Mn **Sleeve A**, the Asia Digital Bridge growth note (7Y, 100% protected), plus USD 40Mn **Sleeve B**, the AI Hardware Phoenix (5Y, 10% p.a. coupon)
**Pitch in one line:** *"Protect the legacy, earn 10% income while you wait, and own the hardware of Asia's AI era."*

> Numbers come from `pricing/scenario2_vt_note.py` (Sleeve A), `pricing/scenario2_barbell.py` (Sleeve B and the portfolio) and `pricing/Asia-Digital-Bridge-Pricer.xlsx`.
> Market inputs are **placeholders**. Re-run with Bloomberg data as of 17 Sep 2026 before putting numbers on slides.
> Deck: `deck/Asia-AI-Hardware-Barbell.pptx` (built by `deck/build_deck_scenario2.js`).

## 0. The barbell
| | Sleeve A: growth note | Sleeve B: Phoenix |
|---|---|---|
| Amount | USD 60Mn | USD 40Mn |
| Tenor | 7Y | 5Y, autocallable quarterly (trigger 100%, stepping down 5% a year) |
| Underlying | 10% vol-target index on 13 Asian AI-hardware stocks | Equal-weight basket: TSMC, SK Hynix, Tokyo Electron (USD quanto) |
| Pays | 100% + 167% × max(0, index perf, locked gain) | 10% p.a., paid quarterly, if the basket is ≥ 60% (with memory) |
| Capital | 100% protected (issuer credit) | 100% unless the basket is < 50% at maturity; then the basket level |
| Natixis margin | 2.0% | 2.2% |

**How the Phoenix pays 10%** (5Y USD, Monte Carlo):
1. Natixis pays interest at its 5.69% USD funding rate.
2. The client sells a put with a 50% barrier, worth 4.7% of notional.
3. The client gives up upside beyond the coupons.
4. Early calls shorten the life: 71% are called in year 1, and the expected life is 1.3 years.

The value check is coupons 9.0% + principal 93.6% − put 4.7% = 97.8% fair value. Natixis keeps 2.2%.

**Is it a covered call?** Economically close: bond + short put = stock + short call. The barrier makes the protection conditional.

**Why a basket of three, not a worst-of.** In a grid search at a 10% coupon, worst-of structures needed 30–45% barriers and still carried a 9–41% chance of loss. The equal-weight basket gets 10% with a 50% barrier and about a 9% chance of loss (expected loss 6.2%).

**Portfolio, simulated 7Y** (both sleeves on the same paths; Phoenix cash reinvested at 3.75%):

| Basket return | Barbell median | Barbell worst 5% | P(<100) | Direct equity median | Direct P(<100) |
|---|---|---|---|---|---|
| 3% | 1.27x | 0.84x | 9% | 0.81x | 60% |
| 6% | 1.35x | 0.90x | 6% | 0.99x | 51% |
| 9% | 1.43x | 1.13x | 4% | 1.24x | 39% |

**Sizing:**
- The contractual maximum loss is USD 40Mn (the Phoenix basket goes to zero) = 2.0% of net worth. The USD 60Mn floor is intact apart from issuer default.
- In the combined crash stress (stocks −30% with vol up), the mark-to-market loss is ~USD 15.7Mn = 0.78% of net worth.

**Outlook (from the team draft, corrected):**
- The next US vote is the Nov 2026 midterms, then the 2028 presidential race. There is no 2027 election.
- The yield-level and strategist-survey figures still need sources.
- Section 3 now argues hardware over data-centre real estate, to stay consistent with excluding the family's own sectors.

---
*Sleeve A detail follows (sections 1–8).*

## 1. Client read
| Brief | Implication |
|---|---|
| USD 100Mn out of a USD 2Bn+ net worth (5%) | Satellite allocation; equity risk is acceptable, losing capital is not ("generational wealth preservation") |
| "Capital appreciation for future generations" | Growth, not income: uncapped participation, no autocall |
| "Digital transformation in Asia", "bridge traditional markets with emerging tech" | **AI hardware** basket: chips, HBM memory, equipment, packaging, AI servers. Traditional manufacturers (Hon Hai, Shin-Etsu, Ibiden) are the "bridge" |
| Family wealth already in JP / Greater China tech infrastructure, renewables, real estate | **Concentration risk**. Own the hardware layer, not the infrastructure layer: exclude data-centre operators/REITs, telecom towers, renewables and property. USD quanto so the note adds no JPY/HKD/CNY exposure |

## 2. Structure
USD note issued by Natixis, **100% capital protected at maturity**, paying
**Redemption = 100% + 163% × max(0, VT index final / initial − 1)**, uncapped.

### Underlying: Natixis Asia Digital Bridge 10% VT Index
- **Basket: 13 Asian AI-hardware names**, equal weight, USD quanto. Eligibility (market cap, 6M ADV) is checked in the `Basket` tab.
  - AI chips and HBM memory: TSMC (2330 TT), MediaTek (2454 TT), SK Hynix (000660 KS), Samsung Electronics (005930 KS)
  - Equipment, materials and packaging: Tokyo Electron (8035 JT), Advantest (6857 JT), Disco (6146 JT), Shin-Etsu Chemical (4063 JT), ASE Technology (3711 TT), Ibiden (4062 JT)
  - AI servers and data-centre power: Hon Hai (2317 TT), Quanta Computer (2382 TT), Delta Electronics (2308 TT)
  - Country mix: Taiwan 6, Japan 5, Korea 2. No Chinese chipmakers, because the leading ones are on US restriction lists (e.g. SMIC).
- **Rules:** daily exposure = min(10% / max(20d, 60d realised vol), 150%). The rest sits in cash. A **1% p.a. decrement** is deducted.
- **Why a VT index rather than the raw basket:**
  - Liquid 7Y options on Asian single stocks don't exist, so a dealer would charge a high implied vol (33% assumed for this concentrated basket). A VT index has a stable, known vol that Natixis can hedge with delta alone.
  - In a crash, exposure falls automatically (from about 37% at 27% basket vol to about 20% at 50%).

### Option budget
- 7Y USD funding 5.75% (grid), so the zero-coupon bond costs **67.6%**.
- Less a 2% issuer fee, the **option budget is 30.4%**.
- ATM 7Y call on the VT index: 19.4% (Black-Scholes at 10% vol) and 18.6% (Monte Carlo with vol-target lag). **Participation is ~163%.**

| Tenor | Bond | Budget | Participation (BS) |
|---|---|---|---|
| 5Y | 75.8% | 22.2% | 143% |
| 6Y | 71.6% | 26.4% | 151% |
| **7Y** | **67.6%** | **30.4%** | **157% (MC 163%)** |
| 10Y | 56.8% | 41.2% | 169% |

### Feature menu (same simulated paths)
| Feature | Participation |
|---|---|
| Base: uncapped | 163% |
| + 12M final averaging (protects against a crash just before maturity) | 174% |
| + Legacy Lock 130/160/190 (gains locked on annual dates) | 155% |
| + Lock + averaging | 167% |

**Suggested headline:** Lock + averaging at about 167%. It costs nothing in participation compared with the base, and adds two features that matter for a legacy story.

## 3. The decrement trap (key "rejected alternative" slide)
A high decrement inflates the headline participation but drags the index down. For a legacy client, the probability of getting only 100 back after 7 years (a real loss of about 16% at 2.5% inflation) is what matters.

| Index design | Participation | Median @6% basket return | P(only 100 back) @6% | Median @9% | P(only 100 back) @9% |
|---|---|---|---|---|---|
| Max-headline (12% vol / 4% decrement) | 351% | 1.00x | 50% | 1.31x | 40% |
| 10% / 2% | 214% | 1.33x | 29% | 1.51x | 20% |
| **Recommended 10% / 1%** | **160%** | **1.38x** | **21%** | **1.53x** | **14%** |
| 10% / 0% | 123% | 1.41x | 14% | 1.53x | 9% |
| Raw basket, no vol target (33% IV) | 89% | 1.10x | 45% | 1.33x | 34% |

**Line for the slide:** *"We turned down a 351% headline because half the time it returns only 100."*

## 4. Forward simulation (not a backtest)
Two-regime basket (27% calm / 50% stress vol), 20k paths, multiple of capital at 7Y. The 7Y UST proxy is ~1.38x.

| Basket return | Product | Median | 5th pct | 95th pct | P(below 100) | P(only 100) |
|---|---|---|---|---|---|---|
| 3% | VT note | 1.24x | 1.00x | 2.25x | 0% | 30% |
| 3% | Direct basket | 0.89x | 0.24x | 3.34x | 56% | |
| 6% | VT note | 1.38x | 1.00x | 2.46x | 0% | 21% |
| 6% | Direct basket | 1.10x | 0.29x | 4.12x | 45% | |
| 9% | VT note | 1.53x | 1.00x | 2.69x | 0% | 14% |
| 9% | Direct basket | 1.36x | 0.36x | 5.08x | 35% | |

The note gives up the far right tail (95th percentile) in exchange for a higher median and no loss. That is the right trade for "generational wealth preservation".

## 5. Risk (Unit 15 checklist)
- **Sizing:** USD 100Mn = 5.0% of net worth. The contractual max loss at maturity is zero, apart from issuer default. The worst stress mark-to-market loss is ~10.5% = USD 10.5Mn = **0.52% of net worth**.
- **Greeks (per 100 notional):** delta 1.18 per 1% move in the VT index; DV01 +0.016. Vega to the basket is close to zero by design, because the index vol is fixed at 10%.
- **10-day 99% VaR:** 5.5% (ES 6.3%), delta-normal. This is mark-to-market only; the note still redeems at 100.
- **Stress tests (spot, vol and rates together):**

| Stress | VT index | Note MTM |
|---|---|---|
| AI hardware crash: basket −30% in 1M, vol 27→50%, rates −50bp | −9.4% | 87.5 |
| Taiwan gap: basket −20% overnight | −7.4% | 89.7 |
| Stagflation: basket −15%, rates +100bp | −5.6% | 93.1 |
| Bull: basket +25%, rates −50bp | +9.3% | 108.3 |

- **Four exits:**
  1. Profit target: sell back on the Natixis bid once the index is up 60% (or rely on the Legacy Lock).
  2. Stop-loss: none, because the 100% floor is the stop. Say so explicitly (Unit 15).
  3. Thesis invalidation: a Taiwan blockade or sweeping chip export bans. Sell back, accepting the mark-to-market.
  4. Time: hold to maturity.
- **Other risks:**
  - Natixis credit risk.
  - 7Y liquidity: the secondary bid includes a spread.
  - **Inflation erodes the real value of the floor.**
  - The VT index lags in V-shaped rebounds.
  - Decrement drag.
  - Quanto correlation.
  - Geopolitics and export controls; **Taiwan is 6 of 13 names**.
  - Semiconductor cycle: memory and equipment are cyclical, so expect deep drawdowns in the raw basket.
  - Model risk: the regime model's parameters are assumptions.

## 6. Why Natixis can do it (issuer slide)
- **Hedge:** delta-hedge the VT index (futures and stocks). Vol exposure is limited to the gap risk of the vol-target lag, which is priced in the MC (MC 18.6% vs BS 19.4%). Quanto is hedged with an FX/equity correlation reserve.
- **Funding:** the 7Y USD issuance at 5.75% sits in the grid. The note is a cheap funding source for the BPCE group.
- **Recycling:** a proprietary index is a platform. The same index can be reused for other private-bank clients.

## 7. Appendix variant: digital-asset sleeve
Best-of payoff on {VT index, spot Bitcoin ETF (IBIT US, which passes the ADV rule)} with a lower participation. Show it in the appendix only: it fits "emerging technologies", but Bitcoin vol (~50–60%) makes it too expensive and hard to defend as the core of a legacy mandate.

## 8. To do before the deck
1. Bloomberg export for the 13 names, then run `python pricing/scenario2_backtest.py data/scenario2_prices.csv 1.63` for rolling 7Y windows plus the GFC / 2015 / 2018 / 2020 / 2022 stress windows.
2. Replace the placeholders:
   - USD OIS 7Y (USSO7)
   - calm/stress vol calibrated to the basket's realised history
   - quanto correlation
   - raw-basket 7Y implied vol from a dealer quote or the long-dated vol surface
3. Fill market cap and ADV in the `Basket` tab and confirm every name is eligible.
4. Charts: payoff diagram, decrement-trap bar chart, VT exposure vs basket vol through 2020/2022, rolling-window histogram.
