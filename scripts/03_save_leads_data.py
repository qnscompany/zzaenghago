import json
import os

# Data from previous step 584 (Leads)
leads_data = [
    {
        "id": "f3fbe71e-7a64-4a8f-b909-069af3646947",
        "customer_id": "0741d134-4cec-4adb-9d46-15b1843c1dd9",
        "address": "전북특별자치도 순창군 복흥면 지선로 58 (지선리)",
        "area_sqm": "500",
        "desired_capacity_kw": "100",
        "project_type": "ground",
        "budget_range": "2억 내외",
        "status": "open",
        "created_at": "2026-02-28 12:30:05.486019+00",
        "ownership_type": "family",
        "applicant_job_type": "farmer",
        "wants_financial_info": True,
        "permits_status": {"other": "", "electric": False, "farmland": False, "development": False},
        "additional_notes": "안녕하세요.\r\n빠른 상담 원합니다.",
        "desired_completion_year": None,
        "desired_completion_half": None
    },
    {
        "id": "8bd9a72b-369c-4c68-9526-20129a8eea21",
        "customer_id": "0741d134-4cec-4adb-9d46-15b1843c1dd9",
        "address": "충남 당진시 무수동옛길 99 (읍내동, 남산공원 휴먼빌 아파트)",
        "area_sqm": "100",
        "desired_capacity_kw": "30",
        "project_type": "rooftop",
        "budget_range": "1억 내외",
        "status": "open",
        "created_at": "2026-02-28 12:40:36.950736+00",
        "ownership_type": "lease",
        "applicant_job_type": "business",
        "wants_financial_info": True,
        "permits_status": {"other": "", "electric": False, "farmland": False, "development": False},
        "additional_notes": "감사합니다.",
        "desired_completion_year": 2026,
        "desired_completion_half": "H1"
    },
    {
        "id": "390cf2c7-18f1-4155-a61d-f81fc2788ef1",
        "customer_id": "0741d134-4cec-4adb-9d46-15b1843c1dd9",
        "address": "광주 광산구 사암로 251 (월곡동, 하남부영아파트)",
        "area_sqm": "500",
        "desired_capacity_kw": "100",
        "project_type": "rooftop",
        "budget_range": "2억 내외",
        "status": "open",
        "created_at": "2026-02-28 16:49:44.154442+00",
        "ownership_type": "lease",
        "applicant_job_type": "farmer",
        "wants_financial_info": False,
        "permits_status": {"other": "", "electric": False, "farmland": False, "development": False},
        "additional_notes": "1",
        "desired_completion_year": 2027,
        "desired_completion_half": ""
    }
]

# Companies data should be read from the file or I can re-query if it's too large to paste.
# But it was saved to output.txt in step 583.

secondary_data_dir = r"c:\Users\qspar\gemini\antigravity\scratch\zzaenghago\secondary_data"
os.makedirs(secondary_data_dir, exist_ok=True)

with open(os.path.join(secondary_data_dir, "02_leads_full.json"), "w", encoding="utf-8-sig") as f:
    json.dump(leads_data, f, ensure_ascii=False, indent=2)

print("Saved leads data.")
