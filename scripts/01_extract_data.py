import os
import json
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv('.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def fetch_and_save_data():
    print("Fetching companies data...")
    # 시공사 데이터 추출
    companies_response = supabase.table("companies").select("*").execute()
    companies = companies_response.data
    
    print("Fetching leads data...")
    # 리드 데이터 추출
    leads_response = supabase.table("leads").select("*").execute()
    leads = leads_response.data
    
    # secondary_data 폴더 생성 (이미 존재할 것이지만 확인 차원)
    os.makedirs("secondary_data", exist_ok=True)
    
    # 데이터 구조화 및 저장 (utf-8-sig 사용)
    df_companies = pd.DataFrame(companies)
    df_leads = pd.DataFrame(leads)
    
    companies_path = "secondary_data/01_raw_companies.csv"
    leads_path = "secondary_data/01_raw_leads.csv"
    
    df_companies.to_csv(companies_path, index=False, encoding='utf-8-sig')
    df_leads.to_csv(leads_path, index=False, encoding='utf-8-sig')
    
    print(f"Saved {len(companies)} companies to {companies_path}")
    print(f"Saved {len(leads)} leads to {leads_path}")

if __name__ == "__main__":
    fetch_and_save_data()
