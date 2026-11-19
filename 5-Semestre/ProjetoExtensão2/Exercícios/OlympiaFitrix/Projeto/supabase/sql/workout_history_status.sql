alter table public.treino
add column if not exists status text not null default 'pendente',
add column if not exists observacao text;

alter table public.treino
drop constraint if exists treino_status_check;

alter table public.treino
add constraint treino_status_check
check (status in ('pendente', 'realizado', 'dispensado'));

create table if not exists public.historico_treinos (
    id_historico serial primary key,
    id_treino int not null unique references public.treino(id_treino) on delete cascade,
    id_aluno int not null references public.alunos(id_aluno) on delete cascade,
    id_personal int not null references public.personal(id_personal) on delete cascade,
    data_treino timestamp not null,
    graudificuldade int not null check (graudificuldade between 1 and 10),
    observacao text,
    status text not null default 'realizado'
);

alter table public.historico_treinos
add column if not exists status text not null default 'realizado';

alter table public.historico_treinos
drop constraint if exists historico_treinos_status_check;

alter table public.historico_treinos
add constraint historico_treinos_status_check
check (status in ('realizado', 'dispensado'));

create index if not exists idx_historico_treinos_personal_aluno_data
on public.historico_treinos(id_personal, id_aluno, data_treino);

create index if not exists idx_treino_aluno_status
on public.treino(id_aluno, status);
