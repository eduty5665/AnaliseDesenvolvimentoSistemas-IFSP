# Banco no Supabase

Projeto **VinoBebidas** (ref `ajmycgojukmbmnvgihee`, região `sa-east-1`), PostgreSQL 17.

| Arquivo | O que faz |
|---|---|
| `01_papel_e_schema.sql` | Cria o papel `vino_app` (privilégio mínimo) e o schema `vino` |
| `02_tabelas.sql` | As 24 tabelas, chaves estrangeiras e índices, iguais ao que o EF Core (provedor Npgsql) gera a partir do `AppDbContext`; RLS ligado |
| `03_conferir.sql` | Consulta de conferência: kardex × saldo, vendas × itens × pagamentos |

Os dois primeiros já foram aplicados no projeto (ficam registrados em *Database › Migrations* no painel do Supabase).
Os dados de demonstração foram carregados em seguida. Em um banco vazio, a própria API cria as tabelas e roda o
seeder (`DadosIniciais`) na primeira execução — os scripts servem para recriar o ambiente manualmente ou em outro projeto.

Para ver os dados no painel: *Table Editor* → troque o schema de `public` para **`vino`**.
