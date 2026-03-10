import json
import os
import re

output_file = r"C:\Users\qspar\.gemini\antigravity\brain\4d72772a-1b52-442e-9ea1-9e294f3afbe9\.system_generated\steps\583\output.txt"
secondary_data_dir = r"c:\Users\qspar\gemini\antigravity\scratch\zzaenghago\secondary_data"
target_file = os.path.join(secondary_data_dir, "02_companies_full.json")

with open(output_file, "r", encoding="utf-8") as f:
    try:
        data = json.load(f)
        content = data.get("result", "")
    except json.JSONDecodeError:
        # Fallback if it's not a JSON file
        content = f.read()

# Extract the JSON array within <untrusted-data-...>
# The regex should account for potential escaping if the content was nested
match = re.search(r"<untrusted-data-[^>]+>\s*(\[.*\])\s*</untrusted-data-", content, re.DOTALL)
if match:
    json_str = match.group(1)
    companies_data = json.loads(json_str)
    
    with open(target_file, "w", encoding="utf-8-sig") as f_out:
        json.dump(companies_data, f_out, ensure_ascii=False, indent=2)
    print(f"Successfully saved {len(companies_data)} companies.")
else:
    # If regex fails, try a direct approach by searching for the first '[' and last ']'
    # (Simplified for this specific case)
    start_idx = content.find('[{"id":"')
    end_idx = content.rfind('}]') + 2
    if start_idx != -1 and end_idx != -1:
        json_str = content[start_idx:end_idx]
        companies_data = json.loads(json_str)
        with open(target_file, "w", encoding="utf-8-sig") as f_out:
            json.dump(companies_data, f_out, ensure_ascii=False, indent=2)
        print(f"Successfully saved {len(companies_data)} companies (via fallback).")
    else:
        print("Could not find data in output file.")

