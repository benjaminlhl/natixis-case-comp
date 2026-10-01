# Unit 4 (Volatility Surface): how it applies to Scenario 1

Source: `unit4-volatility-surface-deck.pdf` (FINA4370A, Unit 4, E. Lam, CUHK, Aug 2026).
Client: Purple Magic Capital, KRW 135bn, trade date 17 Sep 2026.

## Key ideas from the deck

| Concept (slide) | One-line takeaway |
|---|---|
| Implied vs realized vol (5) | Implied vol is usually above realized. Sellers of options earn the volatility risk premium. |
| Equity skew (6–8) | Low-strike puts are expensive and OTM calls are cheap. Protection costs more, upside participation costs less. |
| FX smile (6) | Both wings are bid ("fat tails"). The 25-delta risk reversal measures which side the market fears more. |
| Term structure (9–10) | Calm markets are in contango. Before a known event the curve goes into backwardation and the front end reprices. |
| Risk reversal (11–12) | It is not a pure skew trade, because the delta dominates. Delta-hedge it to isolate the skew. |
| Calendar spread (13–14) | You can be right on the view and still lose if the delta or gamma is left unhedged. |
| Discipline (15) | A structure is a "pure" view only after the unintended exposures are hedged. Dispersion is a trade on correlation. |
| Sticky strike / sticky delta / level shift (16–17) | In a real sell-off the whole surface shifts up, and model delta under-hedges. |

## Application to the Korea Catalyst Book

### Trade 1: Brent x USD/KRW dual digital
- A digital equals minus the slope of the call price with respect to strike. Skew therefore changes its price: digital = BS digital − vega × dσ/dK. **Never price it at flat vol.**
- **Brent:** When supply-shock risk is high (the Iran war), upside calls are often bid (call skew). That makes the "Brent ≥ 110%" leg more expensive than flat vol suggests. Check the Brent 25-delta risk reversal on Bloomberg.
- **USD/KRW:** Risk reversals usually favor USD calls (fear of KRW weakness). That makes the "USD/KRW ≤ 97%" leg (KRW strengthens) **cheaper**, which supports the trade's cheapness argument.
- Also show sensitivity to **correlation**, as well as to skew. Correlation is the main pricing driver, as in the dispersion point on slide 15.

### Trade 2: KOSPI 200 / Value-Up shark fin (up-and-out call)
- Equity skew makes OTM calls cheap (slides 6–7). Upside participation is the cheap side of the surface, so a shark fin fits the skew well.
- Barrier products are sensitive to the shape of the surface. Use local vol or at least skew-adjusted pricing, and say so in the appendix.

### Trade 3 / alternative: worst-of autocall (Samsung, SK Hynix, Micron)
- The investor is effectively **short OTM puts** (barrier) and **short correlation**. The skew pays this well (slide 7: selling protection is well paid), which is why the coupon is high.
- Be clear with the client: the coupon is compensation for crash risk, not free carry. This matters for rebuilding trust after the USD 30M loss.

### Tenor choice and events (term structure)
- Map known event dates (FOMC, BoK meetings, MSCI annual review in June, WGBI inclusion steps) onto the vol term structure.
- If the front end is in backwardation before an event, avoid paying for short-dated optionality. Choose a tenor that spans the event at a blended vol, or sell the expensive front end.

### Stress testing (sticky regimes)
- For risk-off scenarios use a **level shift** (whole surface +5 to +15 vol points with spot down), not sticky strike. This is the realistic case (slide 17), and it shows the client's true mark-to-market loss.
- Report the Greeks breakdown for each trade (delta, vega, correlation) so the client sees exactly what it is betting on.

## Slides to borrow
- A **vol surface or smile chart** for KOSPI 200 and USD/KRW as of 17 Sep 2026 (appendix, or the pricing slide).
- A **"what the skew says" table** (as on slide 7): your structure priced with surface vol vs flat vol.
- A **Greeks or exposure table**: "a pure expression of the view once unintended exposures are hedged".

## Bloomberg data to pull
- `OVDV`: equity and FX vol surfaces (KOSPI2 Index, KRW Curncy, CO1 Comdty / Brent options)
- 25-delta risk reversals and butterflies for USD/KRW and Brent
- Historical correlation between Brent and USD/KRW (`HS` / `CORR`), 1Y and 3Y windows
