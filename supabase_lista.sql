-- Ejecutar en Supabase > SQL Editor (después del supabase.sql original)

-- Solo usuarios autenticados (personal) pueden LEER la tabla.
-- El público (anon) sigue sin poder listar nada.
create policy "personal lee constancias"
  on public.constancias for select to authenticated
  using (true);

-- Luego:
-- 1) Authentication > Users > Add user (correo + contraseña del personal).
-- 2) Authentication > Sign In / Providers > Email: desactivar "Allow new users to sign up",
--    para que nadie pueda registrarse por su cuenta y obtener acceso al listado.
