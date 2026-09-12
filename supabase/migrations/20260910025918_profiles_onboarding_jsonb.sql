-- Holds the full onboarding answer set (rich advertorial inputs) the AI generator reads.
alter table public.profiles add column if not exists onboarding jsonb default '{}'::jsonb;;
