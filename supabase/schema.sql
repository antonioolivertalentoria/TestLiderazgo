-- Talentoría Leadership Survey schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  company text,
  role text not null default 'participant',
  created_at timestamptz not null default now()
);

-- Por si la tabla ya existía sin la columna company.
alter table public.profiles add column if not exists company text;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  created_by uuid references auth.users on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  survey_version text default '2026-03-20-v1',
  answers jsonb not null default '{}'::jsonb,
  score jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists survey_responses_user_version_unique
on public.survey_responses (user_id, survey_version);

-- Auto-create profiles on signup. Los usuarios anónimos (modo invitado)
-- quedan marcados con rol 'guest' desde el servidor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.is_anonymous then 'guest' else 'participant' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Seguridad: un usuario NO puede cambiar su propio rol (evita auto-promoverse
-- a admin). Solo un admin existente, o el servidor (service role / SQL editor,
-- donde auth.uid() es null), pueden modificar el rol.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_role_change on public.profiles;
create trigger profiles_no_role_change
before update on public.profiles
for each row execute procedure public.prevent_role_change();

-- RLS
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.survey_responses enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles policies
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Permite que un usuario (incluido un invitado anónimo) cree/complete su propio
-- perfil con nombre y empresa al entrar.
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_admin_select"
on public.profiles for select
using (public.is_admin());

create policy "profiles_admin_update"
on public.profiles for update
using (public.is_admin());

-- Invitations policies (admin only)
create policy "invitations_admin_all"
on public.invitations for all
using (public.is_admin())
with check (public.is_admin());

-- Survey responses policies
create policy "responses_select_own"
on public.survey_responses for select
using (auth.uid() = user_id);

create policy "responses_insert_own"
on public.survey_responses for insert
with check (auth.uid() = user_id);

create policy "responses_update_own"
on public.survey_responses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "responses_admin_select"
on public.survey_responses for select
using (public.is_admin());

-- Security definer functions for invitations
create or replace function public.get_invitation(p_token text)
returns table(id uuid, email text, expires_at timestamptz, accepted_at timestamptz)
language sql
security definer
as $$
  select i.id, i.email, i.expires_at, i.accepted_at
  from public.invitations i
  where i.token = p_token
  limit 1;
$$;

create or replace function public.accept_invitation(p_token text)
returns void
language sql
security definer
as $$
  update public.invitations
  set accepted_at = now()
  where token = p_token;
$$;

revoke all on function public.get_invitation(text) from public;
revoke all on function public.accept_invitation(text) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.accept_invitation(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
