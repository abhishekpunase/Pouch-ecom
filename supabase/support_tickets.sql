-- Customer support tickets. Run after supabase/schema.sql.
create sequence if not exists public.support_ticket_number_seq start 10001;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default ('TKT-' || nextval('public.support_ticket_number_seq')),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null check (char_length(subject) between 3 and 160),
  category text not null check (category in ('Order Issue','Payment Issue','Product Issue','Delivery Issue','Return/Refund','Cancellation','Other')),
  description text not null check (char_length(description) between 5 and 10000),
  status text not null default 'Open' check (status in ('Open','In Progress','Resolved','Closed')),
  priority text not null default 'Normal' check (priority in ('Low','Normal','High','Urgent')),
  assigned_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_type text not null check (sender_type in ('customer','admin')),
  message text not null check (char_length(message) between 1 and 10000),
  attachment_url text,
  attachment_name text,
  attachment_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_internal_notes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  admin_id uuid references auth.users(id) on delete set null,
  note text not null check (char_length(note) between 1 and 10000),
  created_at timestamptz not null default now()
);

create table if not exists public.support_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  kind text not null check (kind in ('ticket_created','ticket_reply','ticket_status')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_user_updated_idx on public.support_tickets(user_id, updated_at desc);
create index if not exists ticket_messages_ticket_created_idx on public.ticket_messages(ticket_id, created_at);
create index if not exists support_notifications_user_created_idx on public.support_notifications(user_id, created_at desc);

create or replace function public.touch_support_ticket() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'Closed' and old.status <> 'Closed' then new.closed_at = now(); end if;
  if new.status <> 'Closed' then new.closed_at = null; end if;
  return new;
end;
$$;
drop trigger if exists support_tickets_touch on public.support_tickets;
create trigger support_tickets_touch before update on public.support_tickets for each row execute function public.touch_support_ticket();

create or replace function public.notify_support_ticket_created() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.support_notifications (user_id, ticket_id, kind, title, body)
  values (null, new.id, 'ticket_created', 'New support ticket', new.ticket_number || ': ' || new.subject);
  return new;
end;
$$;
drop trigger if exists support_ticket_created_notification on public.support_tickets;
create trigger support_ticket_created_notification after insert on public.support_tickets for each row execute function public.notify_support_ticket_created();

alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_internal_notes enable row level security;
alter table public.support_notifications enable row level security;

drop policy if exists "customers read own tickets" on public.support_tickets;
create policy "customers read own tickets" on public.support_tickets for select to authenticated using (auth.uid() = user_id);
drop policy if exists "customers create own tickets" on public.support_tickets;
create policy "customers create own tickets" on public.support_tickets for insert to authenticated with check (auth.uid() = user_id);
-- No customer update policy: status, priority, assignment and closure are admin-only.

drop policy if exists "customers read own ticket messages" on public.ticket_messages;
create policy "customers read own ticket messages" on public.ticket_messages for select to authenticated using (exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists "customers send own ticket messages" on public.ticket_messages;
create policy "customers send own ticket messages" on public.ticket_messages for insert to authenticated with check (sender_id = auth.uid() and sender_type = 'customer' and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));

drop policy if exists "customers read own notifications" on public.support_notifications;
create policy "customers read own notifications" on public.support_notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "customers read own notes impossible" on public.ticket_internal_notes;
-- There is intentionally no customer policy on internal notes.

insert into storage.buckets (id, name, public) values ('support-attachments', 'support-attachments', false) on conflict (id) do nothing;
drop policy if exists "support attachment read own" on storage.objects;
create policy "support attachment read own" on storage.objects for select to authenticated using (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "support attachment upload own" on storage.objects;
create policy "support attachment upload own" on storage.objects for insert to authenticated with check (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admin access is performed by the protected server route using SUPABASE_SERVICE_ROLE_KEY.
-- The service role bypasses RLS and is never sent to the browser.
