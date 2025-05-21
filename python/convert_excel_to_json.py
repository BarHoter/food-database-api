import pandas as pd
import json
import sys
import numpy as np

def convert_excel_to_json(excel_file, json_file):
    # Read Excel file
    df = pd.read_excel(excel_file)
    
    # Replace NaN values with None
    df = df.replace({np.nan: None})
    
    # Convert DataFrame to list of dictionaries
    records = df.to_dict('records')
    
    # Write to JSON file
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2, default=str)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_excel_to_json.py input.xlsx output.json")
        sys.exit(1)
        
    excel_file = sys.argv[1]
    json_file = sys.argv[2]
    
    try:
        convert_excel_to_json(excel_file, json_file)
        print(f"Successfully converted {excel_file} to {json_file}")
    except Exception as e:
        print(f"Error converting file: {str(e)}")
        sys.exit(1) 