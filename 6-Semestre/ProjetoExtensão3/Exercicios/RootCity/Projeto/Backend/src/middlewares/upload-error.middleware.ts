
import multer from "multer";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

export function tratarErroUpload(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        erro: "O arquivo excede o limite de 5 MB.",
      });
    }

    return res.status(400).json({
      erro: "Upload inválido.",
      codigo: err.code,
    });
  }

  if (err.name === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      erro: "Tipo de arquivo não permitido.",
    });
  }

  next(err);
}
