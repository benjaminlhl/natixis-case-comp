# Scenario 2 pricing (Asia Digital Bridge Legacy Note)

```
pip install numpy scipy pandas
python3 pricing/scenario2/analysis.py          # from pricing/scenario2/: writes results.json used by the deck
python3 pricing/scenario2/backtest_bloomberg.py data/bbg_monthly.csv   # historical back-test once Bloomberg data is exported
```

- `model.py`: inputs (PLACEHOLDERS), payoff and the participation solver.
- `analysis.py`: pricing, dials, sensitivities, real-world simulation, stress scenarios, Greeks, VaR and sizing.
- `backtest_bloomberg.py`: rolling-issuance and block-bootstrap back-test on real index history.

Deck build: `NODE_PATH=<dir with pptxgenjs react react-dom react-icons sharp> node deck/build_deck_scenario2.js`
