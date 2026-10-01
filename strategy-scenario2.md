# Scenario 2 strategy: the "Asia Digital Bridge Note"

**Client:** NKE Private Wealth (Chak family office) · **Size:** USD 100Mn · **Trade date:** 17 Sep 2026 · **Tenor:** 7 years
**Pitch in one line:** *"Every dollar back for the next generation, and 1.6x the upside of Asia's digital build-out, through an index that cuts its own risk when markets panic."*

> Numbers come from `pricing/scenario2_vt_note.py` (Monte Carlo) and `pricing/Asia-Digital-Bridge-Pricer.xlsx` (live formulas).
> Market inputs are **placeholders**. Re-run with Bloomberg data as of 17 Sep 2026 before putting numbers on slides.
> The historical backtest (`pricing/scenario2_backtest.py`) needs a Bloomberg price export; nothing here is a historical result yet.

## 1. Client read
| Brief | Implication |
|---|---|
| USD 100Mn out of a USD 2Bn+ net worth (5%) | Satellite allocation; equity risk is acceptable, losing capital is not ("generational wealth preservation") |
| "Capital appreciation for future generations" | Growth, not income: uncapped participation, no autocall |
| "Digital transformation in Asia", "bridge traditional markets with emerging tech" | Basket of Asian semiconductor and AI leaders plus established companies moving into digital |
| Family wealth already in JP / Greater China tech infrastructure, renewables, real estate | **Concentration risk**. Leave out infrastructure, renewables and property. USD quanto so the note adds no JPY/HKD/CNY exposure |

## 2. Structure
USD note issued by Natixis, **100% capital protected at maturity**, paying
**Redemption = 100% + 164% × max(0, VT index final / initial − 1)**, uncapped.

### Underlying: Natixis Asia Digital Bridge 10% VT Index
- **Basket:** 13 names, equal weight, USD quanto: TSMC, Samsung, SK Hynix, MediaTek, Tokyo Electron, Advantest, Sony, Hitachi, SoftBank Group, Keyence, Tencent, Alibaba, Xiaomi. Eligibility (market cap, 6M ADV) is checked in the `Basket` tab.
- **Rules:** daily exposure = min(10% / max(20d, 60d realised vol), 150%). The rest sits in cash. A **1% p.a. decrement** is deducted.
- **Why a VT index rather than the raw basket:**
  - Liquid 7Y options on Asian single stocks don't exist, so a dealer would charge a high implied vol (30% assumed). A VT index has a stable, known vol that Natixis can hedge with delta alone.
  - In a crash, exposure falls automatically (to about 22% when basket vol hits 45%).

### Option budget
- 7Y USD funding 5.75% (grid), so the zero-coupon bond costs **67.6%**.
- Less a 2% issuer fee, the **option budget is 30.4%**.
- ATM 7Y call on the VT index: 19.4% (Black-Scholes at 10% vol) and 18.5% (Monte Carlo with vol-target lag). **Participation is ~164%.**

| Tenor | Bond | Budget | Participation (BS) |
|---|---|---|---|
| 5Y | 75.8% | 22.2% | 143% |
| 6Y | 71.6% | 26.4% | 151% |
| **7Y** | **67.6%** | **30.4%** | **157% (MC 164%)** |
| 10Y | 56.8% | 41.2% | 169% |

### Feature menu (same simulated paths)
| Feature | Participation |
|---|---|
| Base: uncapped | 164% |
| + 12M final averaging (protects against a crash just before maturity) | 175% |
| + Legacy Lock 130/160/190 (gains locked on annual dates) | 155% |
| + Lock + averaging | 167% |

**Suggested headline:** Lock + averaging at about 167%. It costs nothing in participation compared with the base, and adds two features that matter for a legacy story.

## 3. The decrement trap (key "rejected alternative" slide)
A high decrement inflates the headline participation but drags the index down. For a legacy client, the probability of getting only 100 back after 7 years (a real loss of about 16% at 2.5% inflation) is what matters.

| Index design | Participation | Median @6% basket return | P(only 100 back) @6% | Median @9% | P(only 100 back) @9% |
|---|---|---|---|---|---|
| Max-headline (12% vol / 4% decrement) | 353% | 1.05x | 48% | 1.44x | 35% |
| 10% / 2% | 215% | 1.36x | 28% | 1.59x | 18% |
| **Recommended 10% / 1%** | **161%** | **1.40x** | **19%** | **1.59x** | **12%** |
| 10% / 0% | 124% | 1.42x | 13% | 1.57x | 7% |
| Raw basket, no vol target (30% IV) | 95% | 1.21x | 38% | 1.48x | 27% |

**Line for the slide:** *"We turned down a 353% headline because half the time it returns only 100."*

## 4. Forward simulation (not a backtest)
Two-regime basket (22% calm / 45% stress vol), 20k paths, multiple of capital at 7Y. The 7Y UST proxy is ~1.38x.

| Basket return | Product | Median | 5th pct | 95th pct | P(below 100) | P(only 100) |
|---|---|---|---|---|---|---|
| 3% | VT note | 1.24x | 1.00x | 2.25x | 0% | 30% |
| 3% | Direct basket | 0.98x | 0.32x | 2.96x | 51% | |
| 6% | VT note | 1.41x | 1.00x | 2.51x | 0% | 20% |
| 6% | Direct basket | 1.21x | 0.40x | 3.65x | 39% | |
| 9% | VT note | 1.59x | 1.00x | 2.79x | 0% | 12% |
| 9% | Direct basket | 1.49x | 0.49x | 4.50x | 28% | |

The note gives up the far right tail (95th percentile) in exchange for a higher median and no loss. That is the right trade for "generational wealth preservation".

## 5. Risk (Unit 15 checklist)
- **Sizing:** USD 100Mn = 5.0% of net worth. The contractual max loss at maturity is zero, apart from issuer default. The worst stress mark-to-market loss is ~12.4% = USD 12.4Mn = **0.62% of net worth**.
- **Greeks (per 100 notional):** delta 1.18 per 1% move in the VT index; DV01 +0.016. Vega to the basket is close to zero by design, because the index vol is fixed at 10%.
- **10-day 99% VaR:** 5.5% (ES 6.3%), delta-normal. This is mark-to-market only; the note still redeems at 100.
- **Stress tests (spot, vol and rates together):**

| Stress | VT index | Note MTM |
|---|---|---|
| Asia tech crash: basket −30% in 1M, vol 22→45%, rates −50bp | −11.6% | 85.6 |
| Taiwan gap: basket −20% overnight | −9.1% | 88.0 |
| Stagflation: basket −15%, rates +100bp | −6.8% | 91.6 |
| Bull: basket +25%, rates −50bp | +11.4% | 111.0 |

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
  - Geopolitics and export controls.
  - Model risk: the regime model's parameters are assumptions.

## 6. Why Natixis can do it (issuer slide)
- **Hedge:** delta-hedge the VT index (futures and stocks). Vol exposure is limited to the gap risk of the vol-target lag, which is priced in the MC (MC 18.5% vs BS 19.4%). Quanto is hedged with an FX/equity correlation reserve.
- **Funding:** the 7Y USD issuance at 5.75% sits in the grid. The note is a cheap funding source for the BPCE group.
- **Recycling:** a proprietary index is a platform. The same index can be reused for other private-bank clients.

## 7. Appendix variant: digital-asset sleeve
Best-of payoff on {VT index, spot Bitcoin ETF (IBIT US, which passes the ADV rule)} with a lower participation. Show it in the appendix only: it fits "emerging technologies", but Bitcoin vol (~50–60%) makes it too expensive and hard to defend as the core of a legacy mandate.

## 8. To do before the deck
1. Bloomberg export for the 13 names, then run `python pricing/scenario2_backtest.py data/scenario2_prices.csv 1.64` for rolling 7Y windows plus the GFC / 2015 / 2018 / 2020 / 2022 stress windows.
2. Replace the placeholders:
   - USD OIS 7Y (USSO7)
   - calm/stress vol calibrated to the basket's realised history
   - quanto correlation
   - raw-basket 7Y implied vol from a dealer quote or the long-dated vol surface
3. Fill market cap and ADV in the `Basket` tab and confirm every name is eligible.
4. Charts: payoff diagram, decrement-trap bar chart, VT exposure vs basket vol through 2020/2022, rolling-window histogram.
