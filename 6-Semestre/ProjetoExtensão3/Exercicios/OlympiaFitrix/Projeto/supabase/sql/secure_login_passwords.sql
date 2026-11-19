create extension if not exists pgcrypto with schema extensions;

-- Converte somente senhas antigas que ainda estejam em texto puro.
update public.login
set senha = extensions.crypt(senha, extensions.gen_salt('bf', 6))
where senha not like '$2%';

create index if not exists idx_login_email_lower
on public.login (lower(email));

create or replace function public.criar_login_seguro(p_email text, p_senha text)
returns table(id_login integer)
language plpgsql
security definer
set search_path = public, extensions
set statement_timeout = '15s'
as $$
begin
    return query
    insert into public.login as l(email, senha)
    values (
        lower(trim(p_email)),
        extensions.crypt(p_senha, extensions.gen_salt('bf', 6))
    )
    returning l.id_login;
end;
$$;

drop function if exists public.autenticar_login(text, text);

create function public.autenticar_login(p_email text, p_senha text)
returns table(
    id_login integer,
    tipo_usuario text,
    id_usuario integer,
    id_personal integer
)
language plpgsql
security definer
set search_path = public, extensions
set statement_timeout = '10s'
as $$
declare
    v_id_login integer;
    v_hash text;
    v_id_aluno integer;
    v_id_personal integer;
begin
    select l.id_login, l.senha
    into v_id_login, v_hash
    from public.login l
    where lower(l.email) = lower(trim(p_email))
    limit 1;

    if v_id_login is null
       or v_hash <> extensions.crypt(p_senha, v_hash) then
        return;
    end if;

    -- Atualiza hashes antigos/caros para acelerar os próximos logins.
    if split_part(v_hash, '$', 3)::integer <> 6 then
        update public.login
        set senha = extensions.crypt(p_senha, extensions.gen_salt('bf', 6))
        where public.login.id_login = v_id_login;
    end if;

    select a.id_aluno, a.id_personal
    into v_id_aluno, v_id_personal
    from public.alunos a
    where a.id_login = v_id_login;

    if v_id_aluno is not null then
        return query
        select v_id_login, 'aluno'::text, v_id_aluno, v_id_personal;
        return;
    end if;

    select p.id_personal
    into v_id_personal
    from public.personal p
    where p.id_login = v_id_login;

    if v_id_personal is not null then
        return query
        select v_id_login, 'personal'::text, v_id_personal, v_id_personal;
    end if;
end;
$$;

create or replace function public.atualizar_login_seguro(
    p_id_login integer,
    p_email text,
    p_nova_senha text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
set statement_timeout = '15s'
as $$
begin
    update public.login
    set email = lower(trim(p_email)),
        senha = case
            when nullif(trim(p_nova_senha), '') is null then senha
            else extensions.crypt(p_nova_senha, extensions.gen_salt('bf', 6))
        end
    where id_login = p_id_login;

    return found;
end;
$$;

revoke all on function public.criar_login_seguro(text, text) from public;
revoke all on function public.autenticar_login(text, text) from public;
revoke all on function public.atualizar_login_seguro(integer, text, text) from public;

grant execute on function public.criar_login_seguro(text, text) to anon, authenticated;
grant execute on function public.autenticar_login(text, text) to anon, authenticated;
grant execute on function public.atualizar_login_seguro(integer, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
