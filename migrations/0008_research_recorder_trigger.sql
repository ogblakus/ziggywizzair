-- Scheduler vs desk provenance for research_recorder_status.
-- last_trigger: 'cron' | 'tickDesk'. last run time is updated_at.

alter table research_recorder_status
  add column if not exists last_trigger text;
