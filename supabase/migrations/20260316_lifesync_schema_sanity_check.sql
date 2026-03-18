-- LifeSync schema sanity check
-- Run in Supabase SQL Editor after schema repair

select current_database() as db_name, current_schema() as schema_name, now() as checked_at;

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'tasks','todos','water_entries','water_logs','sleep_entries','sleep_logs',
    'study_sessions','habits','habit_logs','mood_entries','pomodoro_sessions',
    'meditation_sessions','mindfulness_sessions','journal_entries','activities','social_interactions'
  )
order by table_name;

select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'tasks' and column_name in ('id','user_id','title','completed','priority','created_at')) or
    (table_name = 'todos' and column_name in ('id','user_id','title','text','completed','priority','created_at')) or
    (table_name = 'water_entries' and column_name in ('id','user_id','amount','goal','log_date','created_at')) or
    (table_name = 'water_logs' and column_name in ('id','user_id','glasses','goal','log_date','created_at')) or
    (table_name = 'sleep_entries' and column_name in ('id','user_id','bedtime','wake_time','duration','created_at')) or
    (table_name = 'sleep_logs' and column_name in ('id','user_id','bedtime','wake_time','duration_h','created_at')) or
    (table_name = 'study_sessions' and column_name in ('id','user_id','subject','duration','focus_rating','study_date','created_at')) or
    (table_name = 'habits' and column_name in ('id','user_id','habit_name','streak','completed_today','success_rate','created_at')) or
    (table_name = 'habit_logs' and column_name in ('id','user_id','habit_id','completed_on','created_at')) or
    (table_name = 'mood_entries' and column_name in ('id','user_id','mood','mood_score','notes','entry_date','created_at')) or
    (table_name = 'pomodoro_sessions' and column_name in ('id','user_id','duration','session_type','completed','started_at','created_at')) or
    (table_name = 'meditation_sessions' and column_name in ('id','user_id','duration','sound_id','completed','started_at','created_at')) or
    (table_name = 'mindfulness_sessions' and column_name in ('id','user_id','duration','sound_id','phase_cycles','completed','started_at','created_at')) or
    (table_name = 'journal_entries' and column_name in ('id','user_id','title','content','mood_emoji','word_count','entry_date','created_at')) or
    (table_name = 'activities' and column_name in ('id','user_id','type','duration','intensity','created_at')) or
    (table_name = 'social_interactions' and column_name in ('id','user_id','type','category','rating','duration','notes','created_at'))
  )
order by table_name, column_name;
