import json
import pandas as pd
import os
import sys

def convert_json_to_excel(json_file_path, excel_file_path):
    try:
        # Read JSON file
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Save to Excel
        df.to_excel(excel_file_path, index=False)
        print(f"Successfully converted {json_file_path} to {excel_file_path}")
        
    except Exception as e:
        print(f"Error converting file: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_json_to_excel.py <input_json_file> <output_excel_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    excel_file = sys.argv[2]
    
    convert_json_to_excel(json_file, excel_file) 