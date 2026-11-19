-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CIDADAO', 'FUNCIONARIO', 'ADMIN_LOCAL', 'GLOBAL');

-- CreateEnum
CREATE TYPE "StatusRequisicao" AS ENUM ('SOLICITADO', 'APROVADO', 'RECUSADO', 'AGUARDANDO_RETIRADA', 'AGENDADO_PLANTIO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('RETIRADA_LOCAL', 'PLANTIO_AGENDADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CIDADAO',
    "cidadeId" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cidade" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "ativa" BOOLEAN NOT NULL,
    "permiteEntrega" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arvore" (
    "id" UUID NOT NULL,
    "cidadeId" UUID,
    "nomePopular" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arvore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requisicao" (
    "id" UUID NOT NULL,
    "criadoPorId" UUID,
    "nomeBeneficiario" TEXT,
    "telefoneBeneficiario" TEXT,
    "emailBeneficiario" TEXT,
    "cidadeId" UUID NOT NULL,
    "arvoreId" UUID NOT NULL,
    "status" "StatusRequisicao" NOT NULL DEFAULT 'SOLICITADO',
    "observacaoStatus" TEXT,
    "dataInicial" TIMESTAMP(3),
    "dataFinal" TIMESTAMP(3),
    "tipoAtendimento" "TipoAtendimento" NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidadeEndereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pontoReferencia" TEXT,
    "fotoLocalUrl" TEXT,
    "comprovanteResidenciaUrl" TEXT,
    "fotoPlantioUrl" TEXT,
    "enderecoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requisicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" UUID NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cep" TEXT,
    "pontoReferencia" TEXT,
    "cidadeId" UUID NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoRequisicao" (
    "id" UUID NOT NULL,
    "requisicaoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "statusAnterior" "StatusRequisicao",
    "statusNovo" "StatusRequisicao" NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoRequisicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacao" (
    "id" UUID NOT NULL,
    "requisicaoId" UUID NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publicacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Publicacao_requisicaoId_key" ON "Publicacao"("requisicaoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arvore" ADD CONSTRAINT "Arvore_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_arvoreId_fkey" FOREIGN KEY ("arvoreId") REFERENCES "Arvore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoRequisicao" ADD CONSTRAINT "HistoricoRequisicao_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoRequisicao" ADD CONSTRAINT "HistoricoRequisicao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_requisicaoId_fkey" FOREIGN KEY ("requisicaoId") REFERENCES "Requisicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
