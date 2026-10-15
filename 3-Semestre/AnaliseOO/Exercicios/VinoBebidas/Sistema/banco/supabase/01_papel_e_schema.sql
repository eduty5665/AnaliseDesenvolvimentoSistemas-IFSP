-- Papel de aplicação com privilégio mínimo: só enxerga o schema "vino" (fora do "public", portanto fora da Data API).
-- Troque <SENHA> por uma senha forte; ela vai em src/VinoBebidas.Api/appsettings.Local.json (nunca no Git).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vino_app') THEN
    CREATE ROLE vino_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '<SENHA>';
  END IF;
END $$;

GRANT vino_app TO postgres;
CREATE SCHEMA IF NOT EXISTS vino AUTHORIZATION vino_app;
COMMENT ON SCHEMA vino IS 'Vino Bebidas — banco único do ERP/PDV, loja online e app (acessado pela API .NET via EF Core)';
REVOKE ALL ON SCHEMA vino FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA vino TO vino_app;
ALTER ROLE vino_app SET search_path = vino;
ALTER ROLE vino_app SET statement_timeout = '60s';

-- Para trocar a senha depois:  ALTER ROLE vino_app PASSWORD '<NOVA SENHA>';
