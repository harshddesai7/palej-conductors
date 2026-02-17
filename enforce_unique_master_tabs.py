from pathlib import Path

import pandas as pd

BASE = Path(r"c:\Projects\Palej Calculation App")
IN_PATH = BASE / "Phase1_Master_Consolidated.xlsx"
OUT_PATH = BASE / "Phase1_Master_Consolidated_Unique.xlsx"

MISSING = {"", "---", "--", "#VALUE!", "nan", "None"}


def parse_num(v):
    if v is None:
        return None
    s = str(v).strip()
    if s in MISSING:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def dedupe_tab(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    key_col = "Size Key" if "Size Key" in df.columns else ("Size" if "Size" in df.columns else None)
    if not key_col:
        return df

    # Scoring with existing business preference:
    # 1) green-marked row first
    # 2) higher weight first
    # 3) lower scrap-rate first
    mark_col = "Recommended % Marked"
    out = df.copy()
    out["_is_green"] = out.get(mark_col, "").astype(str).eq("Yes").astype(int)
    out["_kg"] = out.apply(
        lambda r: parse_num(r.get("Actual Bare wt"))
        or parse_num(r.get("Actual_Bare_Wt_kg"))
        or parse_num(r.get("Final Dis.Qty."))
        or parse_num(r.get("Final_Dis_Qty"))
        or 0.0,
        axis=1,
    )
    out["_scrap"] = out["Scrap"].apply(parse_num) if "Scrap" in out.columns else None
    out["_scrap_rate"] = out.apply(
        lambda r: (r["_scrap"] / r["_kg"]) if (r["_scrap"] is not None and r["_kg"] > 0) else 1e9,
        axis=1,
    )
    out = out.sort_values(
        [key_col, "_is_green", "_kg", "_scrap_rate"],
        ascending=[True, False, False, True],
    )
    out = out.drop_duplicates(subset=[key_col], keep="first")
    out = out.drop(columns=["_is_green", "_kg", "_scrap", "_scrap_rate"], errors="ignore")
    return out.reset_index(drop=True)


def main():
    if not IN_PATH.exists():
        raise FileNotFoundError(f"Missing input workbook: {IN_PATH}")
    xl = pd.ExcelFile(IN_PATH)
    out_tabs = {}
    for s in xl.sheet_names:
        df = pd.read_excel(IN_PATH, sheet_name=s, dtype=str).fillna("")
        out_tabs[s] = dedupe_tab(df)

    with pd.ExcelWriter(OUT_PATH, engine="openpyxl") as writer:
        for s, df in out_tabs.items():
            df.to_excel(writer, sheet_name=s, index=False)

    print(f"Created: {OUT_PATH}")
    for s, df in out_tabs.items():
        print(f"{s}: rows={len(df)}")


if __name__ == "__main__":
    main()
