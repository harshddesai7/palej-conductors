import pandas as pd
import os

file_path = r"c:\Users\Harsh\.gemini\antigravity\playground\Palej\Insulation wise data .xlsx"
if os.path.exists(file_path):
    try:
        xl = pd.ExcelFile(file_path)
        print(f"Sheet Names: {xl.sheet_names}")
        for sheet in xl.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet, header=None)
            types = df.iloc[5:, 3].dropna().unique()
            print(f"Sheet '{sheet}' Insulation Types: {types}")
    except Exception as e:
        print(f"Error: {e}")
