import { randomUUID } from "node:crypto";
import { supabase } from "../lib/supabase.js";
import { fileTypeFromBuffer } from "file-type";

export interface ArquivoMulter {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export interface ArquivoStorage {
  bucket: string;
  path: string;
  publicUrl: string | null;
}

const TIPOS_PERMITIDOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
} as const;

export async function uploadArquivoSupabase(
  file: ArquivoMulter,
  bucket: string,
  pasta: string,
  publico: boolean = false
): Promise<ArquivoStorage> {

  const tamanhoMaximo = 5 * 1024 * 1024;

  if (!file.buffer || file.buffer.length === 0) {
    throw new Error("Arquivo vazio ou inválido.");
  }

  if (file.buffer.length > tamanhoMaximo) {
    throw new Error("Arquivo excede o limite de 5 MB.");
  }

  // Verifica o conteúdo real, não apenas a extensão.
  const tipoReal = await fileTypeFromBuffer(file.buffer);

  if (
    !tipoReal ||
    !(tipoReal.mime in TIPOS_PERMITIDOS)
  ) {
    throw new Error("Conteúdo de arquivo não permitido.");
  }

  // O MIME declarado precisa corresponder ao conteúdo.
  if (file.mimetype !== tipoReal.mime) {
    throw new Error("O tipo declarado não corresponde ao arquivo.");
  }

  const extensao =
    TIPOS_PERMITIDOS[
    tipoReal.mime as keyof typeof TIPOS_PERMITIDOS
    ];

  // Nome gerado pelo servidor, sem usar originalname.
  const fileName = `${randomUUID()}.${extensao}`;
  const filePath = `${pasta}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: tipoReal.mime,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Erro ao enviar arquivo para o Storage: ${error.message}`
    );
  }

  let publicUrl: string | null = null;

  if (publico) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    publicUrl = data.publicUrl;
  }

  return {
    bucket,
    path: filePath,
    publicUrl,
  };
}

export async function excluirArquivoSupabase(
  bucket: string,
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(
      `Erro ao excluir arquivo do Storage: ${error.message}`
    );
  }
}

export function obterUrlPublica(
  bucket: string,
  filePath: string
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function obterUrlAssinada(
  bucket: string,
  filePath: string,
  expiresIn: number = 300
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(
      `Erro ao gerar URL assinada: ${error.message}`
    );
  }

  return data.signedUrl;
}