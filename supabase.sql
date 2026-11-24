-- Ejecutar en Supabase > SQL Editor

create table if not exists public.constancias (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  apellido   text not null,
  dni        text not null check (dni ~ '^[0-9]{7,8}$'),
  carrera    text not null,
  fecha      date not null,
  pagado     boolean not null default false,
  pagado_en  timestamptz,
  created_at timestamptz not null default now()
);

alter table public.constancias enable row level security;

-- El navegador (anon) solo puede INSERTAR, siempre como "no pagado".
-- No hay políticas de select/update/delete: nadie puede listar la tabla.
create policy "anon inserta constancias"
  on public.constancias for insert to anon
  with check (pagado = false);

-- Leer una constancia: hay que conocer su id (uuid imposible de adivinar)
create or replace function public.obtener_constancia(p_id uuid)
returns setof public.constancias
language sql security definer set search_path = public as $$
  select * from public.constancias where id = p_id;
$$;

-- Editar datos: solo si todavía no está pagada
create or replace function public.actualizar_constancia(
  p_id uuid, p_nombre text, p_apellido text, p_dni text, p_carrera text, p_fecha date)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.constancias
     set nombre = p_nombre, apellido = p_apellido, dni = p_dni,
         carrera = p_carrera, fecha = p_fecha
   where id = p_id and pagado = false;
  return found;
end $$;

-- Confirmar pago
create or replace function public.confirmar_pago(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.constancias set pagado = true, pagado_en = now() where id = p_id;
  return found;
end $$;

grant execute on function public.obtener_constancia(uuid) to anon;
grant execute on function public.actualizar_constancia(uuid,text,text,text,text,date) to anon;
grant execute on function public.confirmar_pago(uuid) to anon;
