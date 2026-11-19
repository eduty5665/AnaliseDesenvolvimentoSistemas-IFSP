import type { Role, Usuario } from "../types";

const ROLES_GESTAO: Role[] = [
  "FUNCIONARIO",
  "ADMIN_LOCAL",
  "GLOBAL"
];

export function podeAcessarGestao(usuario?: Usuario | null): boolean {
  return !!usuario && ROLES_GESTAO.includes(usuario.role);
}
