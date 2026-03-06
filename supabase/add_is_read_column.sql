-- 문의 내역 테이블에 읽음 상태 컬럼 추가
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 기존 데이터 중 답변이 달린 것은 일단 읽음 처리하거나 혹은 그대로 둘 수 있음 (여기서는 false 유지)
-- 답변이 없는(pending) 상태에서 is_read가 true일 이유는 없으므로 현상 유지.
