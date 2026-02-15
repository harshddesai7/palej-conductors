import pandas as pd
import os
import json

file_path = r"c:\Users\Harsh\.gemini\antigravity\playground\Palej\Insulation wise data .xlsx"
output_path = r"c:\Users\Harsh\.gemini\antigravity\playground\Palej\fabrication_data.jsonl"

def safe_float(val):
    try:
        if pd.isna(val): return 0.0
        if isinstance(val, (int, float)): return float(val)
        clean_val = str(val).replace('#VALUE!', '0').strip()
        return float(clean_val) if clean_val else 0.0
    except:
        return 0.0

if os.path.exists(file_path):
    try:
        df = pd.read_excel(file_path, header=None)
        data = df.iloc[5:]
        
        jsonl_data = []
        for _, row in data.iterrows():
            if pd.isna(row[2]) or pd.isna(row[3]):
                continue
                
            entry = {
                "externalId": str(row[0]) if not pd.isna(row[0]) else "",
                "date": str(row[1]) if not pd.isna(row[1]) else "",
                "size": str(row[2]),
                "insulationType": str(row[3]),
                "coveringThickness": str(row[4]) if not pd.isna(row[4]) else "",
                "insulation1": str(row[5]) if not pd.isna(row[5]) else "",
                "insulation2": str(row[6]) if not pd.isna(row[6]) else "",
                "totalInsulation": str(row[7]) if not pd.isna(row[7]) else "",
                "material": str(row[8]),
                "bareWeight": safe_float(row[9]),
                "finalQuantity": safe_float(row[10]),
            }
            jsonl_data.append(entry)
            
        with open(output_path, 'w') as f:
            for entry in jsonl_data:
                f.write(json.dumps(entry) + '\n')
                
        print(f"Successfully wrote {len(jsonl_data)} rows to {output_path}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"File not found: {file_path}")
