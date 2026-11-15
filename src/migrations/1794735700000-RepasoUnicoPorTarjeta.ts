import { MigrationInterface, QueryRunner } from 'typeorm';

// ⭐ Auditoría M5: un solo repaso por usuario y tarjeta. Dos respuestas a la vez podían crear dos
// filas y descuadrar los contadores por tema. El código ya lo evita con un bloqueo; este índice lo
// garantiza en la base de datos.
// Si quedan duplicados, la migración se para sin tocar nada: primero hay que limpiarlos con el SQL
// que acompaña a la auditoría (no se borra nada desde aquí).
export class RepasoUnicoPorTarjeta1794735700000 implements MigrationInterface {
  name = 'RepasoUnicoPorTarjeta1794735700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ n }] = await queryRunner.query(
      `SELECT count(*)::int AS n FROM (
         SELECT 1 FROM "repasos_fc" GROUP BY "usuarioId", "flashcardId" HAVING count(*) > 1
       ) d`,
    );
    if (n > 0) {
      throw new Error(
        `Hay ${n} parejas usuario-tarjeta con repasos duplicados. Ejecuta antes el SQL de limpieza de M5 y vuelve a lanzar la migración.`,
      );
    }
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_repasos_fc_usuario_flashcard" ON "repasos_fc" ("usuarioId", "flashcardId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_repasos_fc_usuario_flashcard"`);
  }
}
