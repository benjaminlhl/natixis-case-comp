"""Load the Bloomberg daily USD prices (PX_LAST) from data/Stock.xlsx into one aligned DataFrame."""
import pandas as pd

TICKERS = ["3119 HK", "EWY US", "EWT US", "2644 JP", "00878 TT"]


def load(path):
    out = {}
    for name, df in pd.read_excel(path, sheet_name=None, header=None).items():
        label = str(df.iloc[0, 1]).replace(" Equity", "")
        if label not in TICKERS or label in out:
            continue
        body = df.iloc[7:, :2].dropna()
        out[label] = pd.Series(pd.to_numeric(body[1]).values, index=pd.to_datetime(body[0])).sort_index()
    return pd.DataFrame(out)[TICKERS]
