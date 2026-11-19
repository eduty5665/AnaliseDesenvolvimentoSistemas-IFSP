
import multer from "multer";

const LIMITE_ARQUIVO = 5 * 1024 * 1024; // 5 MB

const TIPOS_IMAGEM = ["image/jpeg", "image/png"];
const TIPOS_DOCUMENTO = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

function criarUpload(tiposPermitidos: string[]) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: LIMITE_ARQUIVO,
      files: 2,
      fields: 20,
      parts: 22,
    },
    fileFilter: (_req, file, callback) => {
      if (!tiposPermitidos.includes(file.mimetype)) {
        const erro = new Error(
          "Tipo de arquivo não permitido."
        );
        erro.name = "INVALID_FILE_TYPE";
        return callback(erro);
      }

      callback(null, true);
    },
  });
}

export const uploadImagem = criarUpload(TIPOS_IMAGEM);

export const uploadDocumentos =
  criarUpload(TIPOS_DOCUMENTO);
