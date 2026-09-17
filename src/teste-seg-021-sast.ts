// TEMP — só para validar o gate de SAST (SEG-021). Não mergear.
export function testeInseguro(entrada: string) {
  return eval(entrada);
}
