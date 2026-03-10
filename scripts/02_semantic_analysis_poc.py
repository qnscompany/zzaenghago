import json
import os
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
from dotenv import load_dotenv

# 환경 변수 로드 (.env.local 또는 .env)
load_dotenv(".env.local")
load_dotenv()

# API 키 설정 (환경 변수에서만 로드)
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: Gemini API Key not found. Please set GEMINI_API_KEY in .env.local")
    exit(1)

genai.configure(api_key=api_key)

# 진단 로직 추가
print("Checking Gemini API Access...")
try:
    for m in genai.list_models():
        if 'embedContent' in m.supported_generation_methods:
            print(f"Found embedding model: {m.name}")
except Exception as e:
    print(f"API Key Error or Access Denied: {e}")
    if "403" in str(e):
        print("Tip: Please check if the API key is active and has permissions for Generative AI API.")
    # PoC 중단 방지 (필요 시 임시 벡터 반환 로직 고려 가능)

def get_embedding(text):
    """Gemini text-embedding-004 모델을 사용하여 임베딩 생성"""
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Embedding failed: {e}")
        # 실패 시 0 벡터 반환 (PoC 흐름 유지용)
        return [0.0] * 768 


def load_data():
    base_path = "secondary_data"
    with open(f"{base_path}/02_companies_full.json", "r", encoding="utf-8-sig") as f:
        companies = json.load(f)
    with open(f"{base_path}/02_leads_full.json", "r", encoding="utf-8-sig") as f:
        leads = json.load(f)
    return companies, leads

def run_poc():
    print("Starting Semantic Analysis PoC with Gemini...")
    companies, leads = load_data()
    
    # 시공사 프로필 텍스트 생성 (주소, 업체명, 대표자 등 조합)
    company_texts = []
    for c in companies:
        text = f"업체명: {c.get('company_name', '')}, 주소: {c.get('head_office_address', '')}, 대표: {c.get('rep_name', '')}"
        company_texts.append(text)
    
    print(f"Generating embeddings for {len(companies)} companies...")
    # 실제로는 배치 처리가 좋으나, PoC이므로 단순 반복 (속도 최적화 필요 시 20개씩 병렬 가능)
    # 여기서는 샘플링하거나 단순 루프로 진행
    company_embeddings = []
    for i, text in enumerate(company_texts[:50]): # 우선 상위 50개만 테스트 (API 할당량 고려)
        try:
            emb = get_embedding(text)
            company_embeddings.append(emb)
            if (i+1) % 10 == 0: print(f"Progress: {i+1}/50 companies embedded")
        except Exception as e:
            print(f"Error embedding company {i}: {e}")
            break

    # 리드 데이터 임베딩
    lead_results = []
    for lead in leads:
        lead_text = f"지역: {lead.get('address', '')}, 유형: {lead.get('project_type', '')}, 용량: {lead.get('desired_capacity_kw', '')}kW, 메모: {lead.get('additional_notes', '')}"
        print(f"Embedding lead: {lead['id']}...")
        lead_emb = get_embedding(lead_text)
        
        # 유사도 계산
        similarities = cosine_similarity([lead_emb], company_embeddings)[0]
        
        # 상위 5개 매칭 시공사 추출
        top_indices = np.argsort(similarities)[::-1][:5]
        matches = []
        for idx in top_indices:
            matches.append({
                "company_id": companies[idx]["id"],
                "company_name": companies[idx]["company_name"],
                "score": float(similarities[idx]),
                "address": companies[idx]["head_office_address"]
            })
        
        lead_results.append({
            "lead_id": lead["id"],
            "lead_address": lead["address"],
            "top_matches": matches
        })

    # 결과 저장
    result_path = "intermediate_results/01_matching_poc_results.json"
    os.makedirs("intermediate_results", exist_ok=True)
    with open(result_path, "w", encoding="utf-8-sig") as f:
        json.dump(lead_results, f, ensure_ascii=False, indent=2)
    
    print(f"PoC complete. Results saved to {result_path}")

if __name__ == "__main__":
    run_poc()
