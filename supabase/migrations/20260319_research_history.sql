-- Create research_history table
create table if not exists public.research_history (
  id bigserial primary key,
  query text not null,
  summary text,
  results jsonb default '[]'::jsonb,
  duration integer,
  used_credits boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists research_history_created_at_idx on public.research_history (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.research_history enable row level security;

-- Policy: Allow all operations (adjust based on your auth needs)
create policy "Allow all research history operations"
  on public.research_history
  for all
  using (true)
  with check (true);
