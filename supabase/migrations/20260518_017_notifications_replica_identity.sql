-- fp_notifications Realtime filter(user_id=eq.xxx) 정상 동작을 위한 REPLICA IDENTITY 설정
-- UPDATE/DELETE 이벤트에서 old record 비교 시 필요
ALTER TABLE fp_notifications REPLICA IDENTITY FULL;
