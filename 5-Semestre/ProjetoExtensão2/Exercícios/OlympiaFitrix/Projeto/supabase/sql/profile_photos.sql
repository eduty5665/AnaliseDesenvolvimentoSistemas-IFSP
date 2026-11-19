-- Colunas usadas pelo aplicativo para guardar a URL pública da foto.
alter table public.alunos
    add column if not exists foto_url text;

alter table public.personal
    add column if not exists foto_url text;

-- Bucket público: a leitura direta é necessária para mostrar as fotos nos rankings.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'fotos-perfil',
    'fotos-perfil',
    true,
    5242880,
    array['image/jpeg', 'image/png']::text[]
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Leitura publica de fotos de perfil" on storage.objects;
create policy "Leitura publica de fotos de perfil"
on storage.objects for select
to public
using (bucket_id = 'fotos-perfil');

-- O projeto usa login próprio e acessa o Supabase com a chave anon. Por isso a
-- escrita é liberada para anon; o aplicativo limita a edição ao perfil logado.
drop policy if exists "Enviar fotos de perfil pelo aplicativo" on storage.objects;
create policy "Enviar fotos de perfil pelo aplicativo"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'fotos-perfil');

drop policy if exists "Atualizar fotos de perfil pelo aplicativo" on storage.objects;
create policy "Atualizar fotos de perfil pelo aplicativo"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'fotos-perfil')
with check (bucket_id = 'fotos-perfil');

drop policy if exists "Remover fotos de perfil pelo aplicativo" on storage.objects;
create policy "Remover fotos de perfil pelo aplicativo"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'fotos-perfil');
