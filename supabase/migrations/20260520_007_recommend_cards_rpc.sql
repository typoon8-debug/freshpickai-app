-- fp_recommend_cards: 섹션 AI 자동 채움용 카드 후보 조회 RPC
-- 섹션명과 페르소나 태그를 받아 승인된 공식 카드 목록 반환
-- Claude Haiku generateObject가 이 목록에서 최적 3개를 선별함

create or replace function fp_recommend_cards(
  p_section_name text,
  p_persona_tags text[] default '{}',
  p_limit int default 20
)
returns table (
  card_id uuid,
  title text,
  card_theme text,
  category text,
  emoji text,
  cover_image text,
  health_score int,
  is_official boolean
)
language sql
security definer
stable
as $$
  select
    mc.card_id,
    mc.title,
    mc.card_theme,
    mc.category,
    mc.emoji,
    mc.cover_image,
    mc.health_score,
    mc.is_official
  from fp_menu_card mc
  where mc.review_status = 'approved'
    and mc.is_official = true
  order by
    -- 섹션명 키워드 매칭 카드 우선 (pg_trgm 유사도)
    similarity(mc.title, p_section_name) desc,
    mc.health_score desc nulls last,
    mc.created_at desc
  limit p_limit;
$$;

-- 권한 설정
grant execute on function fp_recommend_cards(text, text[], int) to authenticated;
grant execute on function fp_recommend_cards(text, text[], int) to anon;
