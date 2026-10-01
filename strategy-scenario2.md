# Scenario 2 strategy: the "Asia Digital Bridge Legacy Note"

**Client:** NKE Private Wealth (Chak family office) · **Size:** USD 100Mn · **Trade date:** 17 Sep 2026 · **Tenor:** 7 years
**Deck:** `deck/Asia-Digital-Bridge-Legacy-Note.pdf` (10 core slides + agenda, executive summary and 4 appendix slides)
**Pitch in one line:** *"The family already owns Asia's physical digital infrastructure. This note gives them the chips-and-platforms layer, in USD, with principal protected and gains banked for the next generation."*

> Pricing and simulation use **placeholder** market inputs (`pricing/scenario2/model.py`).
> Refresh them with Bloomberg data as of 17 Sep 2026 and re-run `analysis.py`; the deck reads `results.json` directly.

## 1. Diagnosis (what makes this tailored)
- The family's ~USD 1.9Bn of operating wealth is already long Japan and Greater China **physical** assets: tech infrastructure, renewable power plants and real estate. It carries JPY/CNY/HKD, property-cycle and power-price risk.
- The note should therefore add the **digital value-capture layer** they lack (equipment, foundry, memory, platforms), pay out in **USD**, and **protect principal**, because this is legacy capital.
- Five design principles map one-to-one to product features: keep principal → 100% protection; digital, not physical → AI-stack basket; no new FX → quanto USD; don't pick one winner → 4-market equal weight; bank gains for heirs → Legacy Lock-in.

## 2. Market view (17 Sep 2026)
- AI capex: Big-5 hyperscaler capex above USD 600bn in 2026E. Chips were 47% of Korean exports in 1–10 Sep 2026 (+270% YoY).
- The rally is crowded: TAIEX +66% and KOSPI +62% YTD, Nikkei +29%, Hang Seng about flat. Entering outright risks a 2000-style reversal on legacy capital.
- The Fed hiked to 3.75–4.00% on 16 Sep 2026 and Brent is near USD 109 on the Iran war. The USD 7Y funding rate of 5.75% makes the zero-coupon floor cheap (67.6%), which leaves an option budget of about 30%.

## 3. Product
| Term | Value |
|---|---|
| Issuer / format | Natixis S.A., EMTN private placement, USD |
| Underlying | Equal-weight basket: Nikkei 225 (NKY), TAIEX (TWSE), KOSPI 200 (KOSPI2), Hang Seng TECH (HSTECH), quanto USD, price return |
| Protection | 100% at maturity (Natixis credit risk) |
| Participation | **125%** of basket gain, uncapped (fair value 132%; the gap is held as a model reserve) |
| Legacy Lock-in | Annual dates in years 1–6: basket ≥130% → floor 115%; ≥160% → 130%; ≥200% → 150% |
| Redemption | max[ locked floor ; 100% + 125% × max(0, basket − 100%) ] |
| Fee | 35 bp p.a. (2.45% in total) |

**Use of USD 100:** zero-coupon bond 67.6, basket call 26.7, lock-in ladder 1.8, fee 2.45, model reserve 1.45.

## 4. Key results (placeholder inputs)
- **Structuring dials (fair participation):**
  - By tenor: 3Y 86%, 5Y 111%, **7Y 132%**, 10Y 160%.
  - By protection: 100% gives 132%, 95% gives 146%, 90% gives 159%.
- **Alternatives tested:**
  - Without the lock-in, participation is 140%.
  - A best-of rainbow (40/30/20/10) falls to 86%, so we rejected it.
- **Simulation:** 100k fat-tailed (multivariate-t) paths.
  - Median redemption 130%, mean IRR 6.5%.
  - The worst 5% of outcomes return **100%, against 53%** for the direct basket.
  - 59% of paths lock in at least 115%.
  - 29% of paths return exactly the principal (the honest cost of protection).
- **Stress scenarios:** a 2000-style boom-and-bust gives 130% vs 104% direct; a Taiwan Strait shock gives 100% vs 100% direct.
- **Risk:**
  - 10-day 99% mark-to-market VaR 7.9%, ES 9.1%.
  - Joint stress (equities −30%, vol +10pts, rates +100bp) gives a −16.7% mark-to-market loss.
  - Sizing: USD 60Mn credit budget ÷ 60% loss if Natixis defaults = USD 100Mn.

## 5. To do before submission
1. Pull from Bloomberg: OVDV vols, CORR, BDVD dividends, local swap curves and Natixis CDS. Update `model.py` and re-run `analysis.py`, then `node deck/build_deck_scenario2.js`.
2. Export monthly PX_LAST for the four indices and run `backtest_bloomberg.py data/bbg_monthly.csv` for a historical rolling and block-bootstrap back-test. Add a chart from `rolling_backtest.csv` to slide 8 or the appendix.
3. Check the market facts on slide 3 against Bloomberg (YTD returns, Fed decision, export data) and replace "Team [name]" on the title slide.
4. Optional Excel: dump `results.json` to a workbook for the allowed supplementary file.
