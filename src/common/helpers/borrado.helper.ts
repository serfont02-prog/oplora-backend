// ⭐ Borrado de temas, convocatorias y oposiciones sin chocar con las claves foráneas.
// Antes, si un tema tenía resultados de test, duelos, notas, preguntas cortas, apuntes… el borrado
// fallaba a medias. Regla: lo que es CONTENIDO del tema se borra; lo que es HISTORIAL de los
// usuarios (resultados, duelos, notas) se conserva y solo pierde el enlace (queda a NULL).
// Todo en SQL plano sobre el `manager` de una transacción: si algo falla, no se borra nada.

type Q = { query: (sql: string, params?: any[]) => Promise<any> };

export async function borrarTemas(m: Q, temaIds: string[]): Promise<void> {
  if (!temaIds.length) return;
  const p = [temaIds];
  // Historial de usuarios: se conserva sin el tema
  await m.query(`UPDATE resultados_test SET "temaId" = NULL WHERE "temaId" = ANY($1)`, p);
  await m.query(`UPDATE retos SET "temaId" = NULL WHERE "temaId" = ANY($1)`, p);
  await m.query(`UPDATE retos_fc SET "temaId" = NULL WHERE "temaId" = ANY($1)`, p);
  await m.query(`UPDATE notas_articulo SET "temaId" = NULL WHERE "temaId" = ANY($1)`, p);
  // Contenido del tema
  await m.query(`DELETE FROM temas_normativa WHERE "temaId" = ANY($1)`, p);
  await m.query(`DELETE FROM preguntas_test_temas_temas WHERE "temasId" = ANY($1)`, p);
  await m.query(`DELETE FROM preguntas_banco WHERE "temaId" = ANY($1)`, p);
  await m.query(`DELETE FROM preguntas_cortas WHERE "temaId" = ANY($1)`, p);
  await m.query(`DELETE FROM sesiones_tema WHERE "temaId" = ANY($1)`, p);
  await m.query(`DELETE FROM apuntes_usuario WHERE "temaId" = ANY($1)`, p);
  // Apuntes OPLORA que queden (sus archivos se borran antes, fuera de la transacción, si se puede)
  await m.query(
    `DELETE FROM progreso_lectura WHERE "apunteId" IN (SELECT id FROM apuntes_oplora WHERE "temaId" = ANY($1))`, p);
  await m.query(
    `DELETE FROM subrayados_apunte WHERE "apunteId" IN (SELECT id FROM apuntes_oplora WHERE "temaId" = ANY($1))`, p);
  await m.query(`DELETE FROM apuntes_oplora WHERE "temaId" = ANY($1)`, p);
  // Flashcards del tema (sus repasos se borran en cascada; los resultados de duelos se conservan)
  await m.query(
    `UPDATE resultados_reto_fc SET "flashcardId" = NULL WHERE "flashcardId" IN (SELECT id FROM flashcards WHERE "temaId" = ANY($1))`, p);
  await m.query(`DELETE FROM repasos_fc WHERE "flashcardId" IN (SELECT id FROM flashcards WHERE "temaId" = ANY($1))`, p);
  await m.query(`DELETE FROM flashcards WHERE "temaId" = ANY($1)`, p);
  await m.query(`DELETE FROM temas WHERE id = ANY($1)`, p);
}

export async function borrarConvocatorias(m: Q, convocatoriaIds: string[]): Promise<void> {
  if (!convocatoriaIds.length) return;
  const p = [convocatoriaIds];
  const temas: { id: string }[] = await m.query(`SELECT id FROM temas WHERE "convocatoriaId" = ANY($1)`, p);
  await borrarTemas(m, temas.map((t) => t.id));
  // Las preguntas de exámenes anteriores se quedan en el banco, sin el examen
  await m.query(
    `UPDATE preguntas_test SET "examenAnteriorId" = NULL WHERE "examenAnteriorId" IN (SELECT id FROM examenes_anteriores WHERE "convocatoriaId" = ANY($1))`, p);
  await m.query(`DELETE FROM documentos_convocatoria WHERE "convocatoriaId" = ANY($1)`, p);
  // El resto (ligas y todo lo suyo, exámenes, noticias, historial, config de psicotécnicos) va en cascada
  await m.query(`DELETE FROM convocatorias WHERE id = ANY($1)`, p);
}

export async function borrarOposicion(m: Q, oposicionId: string): Promise<void> {
  const p = [oposicionId];
  const convs: { id: string }[] = await m.query(`SELECT id FROM convocatorias WHERE "oposicionId" = $1`, p);
  await borrarConvocatorias(m, convs.map((c) => c.id));
  // Historial de usuarios: se conserva sin la oposición
  await m.query(`UPDATE resultados_test SET "oposicionId" = NULL WHERE "oposicionId" = $1`, p);
  await m.query(`UPDATE resultados_psicotecnicos SET "oposicionId" = NULL WHERE "oposicionId" = $1`, p);
  await m.query(`UPDATE retos_fc SET "oposicionId" = NULL WHERE "oposicionId" = $1`, p);
  await m.query(`UPDATE retos_psicotecnicos SET "oposicionId" = NULL WHERE "oposicionId" = $1`, p);
  // Contenido
  await m.query(`DELETE FROM apuntes_usuario WHERE "oposicionId" = $1`, p);
  await m.query(`DELETE FROM progreso_lectura WHERE "apunteId" IN (SELECT id FROM apuntes_oplora WHERE "oposicionId" = $1)`, p);
  await m.query(`DELETE FROM subrayados_apunte WHERE "apunteId" IN (SELECT id FROM apuntes_oplora WHERE "oposicionId" = $1)`, p);
  await m.query(`DELETE FROM apuntes_oplora WHERE "oposicionId" = $1`, p);
  // Lo demás (retos de test, leyes, psicotécnicos, noticias, interés en papel, inscripciones) va en cascada
  await m.query(`DELETE FROM oposiciones WHERE id = $1`, p);
}
